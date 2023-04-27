import styles from './index.less';
import Chat, { Bubble, useMessages } from '@chatui/core';
import '@chatui/core/dist/index.css';
import { chatToOpenai } from '@/services/openai'
import ChatHeader from './components/chatHeader';

import { activeProject } from '@/stores/project';
import botStore from '@/stores/bot';
import messageHistoryStore from '@/stores/messageHistory';
import { makeNodeId } from '@/utils/withNodeId';
import { snapshot, useSnapshot, subscribe } from 'valtio';
import dayjs from 'dayjs';
import { getCurrentMessageHistory } from '@/database/messageHistory';
import { chatFunction } from '@/stores/globalFunction';
import { useEffect, useState } from 'react';
import { Popover, Row, Col, ConfigProvider } from 'antd';
import { getGraphTree, getFunctionMap, updateShotCut, piplineAllFunction, getRealData, filterUsefulInfo } from '@/utils/graphUtils';
const { messageHistoryState } = messageHistoryStore;
const { botState, updataHistory, resetHistory, updataLogitBias, filterMessage } = botStore;

export default function IndexPage() {
  const {
    messages,
    appendMsg,
    setTyping,
    deleteMsg,
    resetList,
    updateMsg,
    prependMsgs,
  } = useMessages(messageHistoryState.list);
  const snapActiveProject = useSnapshot(activeProject);

  const botStateSnap = useSnapshot(botState)
  useEffect(() => {
    if (messageHistoryState.list.length == 0) {
      firstTimeEntry()
    }
  }, []);

  const firstTimeEntry = async () => {
    const { firstTimeEntryTree } = botState
    const result = await getFunctionTreeResult(firstTimeEntryTree, '', 'user')
    await pipelineResult(result)
    if (result.sendUsermessage) {
      setTyping(true);
      result.sendUsermessage.forEach((item: any) => {
        setTimeout(() => {
          chatFunction.assistantSend(item.type, item.content)
          setTyping(false);
        }, 500);
      })
    }
  }

  chatFunction.firstTimeEntry = firstTimeEntry

  useEffect(() => {
    getCurrentMessageHistory().then(res=>{
      if(res){
        resetList(res.list);
      }
    })
  }, [snapActiveProject]);

  chatFunction.handleSend = async (type: any, val: any, isAsyn: boolean) => {
    if (isAsyn) {
      const  piplineResult = await pipLine(type, val);
      if (!piplineResult?.result.stopGenurate) {
        setTyping(true);
        await botAnswer(val, piplineResult?.prompt, piplineResult?.history, piplineResult?.modify);
      }
    } else {
      const piplineResult = await pipLine(type, val);
      if (!piplineResult?.result.stopGenurate) {
        setTyping(true);
        botAnswer(val, piplineResult?.prompt, piplineResult?.history, piplineResult?.modify);
      }
    }
  };
  chatFunction.resetList = resetList
  chatFunction.assistantSend = async (type: any, content: any) => {
    let messageContent: any
    if (type == 'text') {
      messageContent = { 'text': content }
    } else if (type == 'image') {
      messageContent = { 'picUrl': content }
    }


    const _id = makeNodeId();
    const messageItem: any = {
      _id: _id,
      type: type,
      role: 'assistant',
      content: messageContent,
      realContent: messageContent,
      position: 'left',
      isComplete: false,
      user: { avatar: botState.avatar },
      createdAt: dayjs().valueOf(),
    };
    appendMsg(messageItem);
    messageHistoryState.list.push(messageItem);
    updataHistory(messageItem)
  }

  const pipLine = async (type: any, val: any) => {
    if (type === 'text' && val.trim()) {
      const { userFunctionTree } = botState
      const result = await getFunctionTreeResult(userFunctionTree, val, 'user')
      await pipelineResult(result)


      const promptInfo = getSnopPrompt();
      const _id = makeNodeId();
      const messageItem: any = {
        _id: _id,
        type: 'text',
        role: 'user',
        content: { text: val },
        position: 'right',
        realContent: { text: `${botState?.modify?.prefix ? botState?.modify?.prefix : ''} ${result.input ? result.input : val} ${botState?.modify?.suffix ? botState?.modify?.suffix : ''}` },
        createdAt: dayjs().valueOf(),
        history: botState.history.concat([]),
        propmt: promptInfo,
        modify: botState.modify,
      };
      appendMsg(messageItem);
      messageHistoryState.list.push(messageItem);
      updataHistory(messageItem)

      if (result.sendUsermessage) {
        setTyping(true);
        result.sendUsermessage.forEach((item: any) => {
          setTimeout(() => {
            chatFunction.assistantSend(item.type, item.content)
            setTyping(false);
          }, 500);
        })
      }
      return { prompt: promptInfo, history:botState.history.concat([]), modify: botState.modify, result:result};
    }
  };


  const pipelineResult = async (result: any) => {
    if (result.clearHistory) {
      botState.history.splice(0, botState.history.length)
    }

    if (result.historyFunction) {
      botState.historyFunction.lang = result.historyFunction.lang
      botState.historyFunction.code = result.historyFunction.content
    }

    if (result.resetHistory) {
      resetHistory()
    }

    if (result.modify) {
      botState.modify.prefix = result.modify.prefix
      botState.modify.suffix = result.modify.suffix
    }

    if (result.conversation) {
      if (result.conversation[0].children) {
        botState.prompt.conversation.splice(0, botState.prompt.conversation.length, ...filterMessage(result.conversation))
      } else {
        botState.prompt.conversation.splice(0, botState.prompt.conversation.length, ...result.conversation)
      }
    }
    if (result.system) {
      if (result.system[0].children) {
        botState.prompt.system.splice(0, botState.prompt.system.length, ...filterMessage(result.system))
      } else {
        botState.prompt.system.splice(0, botState.prompt.system.length, ...result.system)
      }

    }
    if (result.parameter) {
      botState.prompt.slideLists.frequencyPenalty = result.parameter.frequencyPenalty
      botState.prompt.slideLists.maximumLength = result.parameter.maximumLength
      botState.prompt.slideLists.presencePenalty = result.parameter.presencePenalty
      botState.prompt.slideLists.temperature = result.parameter.temperature
      botState.prompt.slideLists.topP = result.parameter.topP
    }

    if (result.logitBiasArray) {
      botState.prompt.logitBiasArray.splice(0, botState.prompt.logitBiasArray.length, ...result.logitBiasArray)
      await updataLogitBias(result.logitBiasArray)
    }
  }

  const handleSendSelf = async (type: any, val: any) => {
    const { userFunctionTree } = botState
    const result = await getFunctionTreeResult(userFunctionTree, val, 'user')
    await pipelineResult(result)



    const promptInfo = getSnopPrompt();
    const _id = makeNodeId();
    const messageItem: any = {
      _id: _id,
      type: 'text',
      role: 'user',
      content: { text: val },
      position: 'right',
      realContent: { text: `${botState?.modify?.prefix ? botState?.modify?.prefix : ''} ${result.input ? result.input : val} ${botState?.modify?.suffix ? botState?.modify?.suffix : ''}` },
      createdAt: dayjs().valueOf(),
      history: botState.history.concat([]),
      propmt: promptInfo,
      modify: botState.modify,
    };
    appendMsg(messageItem);
    messageHistoryState.list.push(messageItem);
    updataHistory(messageItem)

    if (result.sendUsermessage) {
      setTyping(true);
      result.sendUsermessage.forEach((item: any) => {
        setTimeout(() => {
          chatFunction.assistantSend(item.type, item.content)
          setTyping(false);
        }, 500);
      })
    }

    if (!result.stopGenurate) {
      setTyping(true);
      botAnswer(result.input ? result.input : val, promptInfo, botState.history, botState.modify);
    }
  };

  const getFunctionTreeResult = async (tree: any, input: string, role: string) => {
    const { functionmap } = botState
    // try {

      const treeFuntionResuList: any = []
      const inputData = getRealData(input, role)
      await traverseJSON(tree, inputData)
      const usefulInfo = filterUsefulInfo(treeFuntionResuList, inputData)

      return usefulInfo

      async function traverseJSON(obj: any, inputdata: any) {

        for (let key in obj) {
          const item = functionmap[key]
          const treeFuntionResult = await piplineAllFunction(item, inputdata)
          let newInputdata: any = {}
          if (treeFuntionResult.prompt) {
            newInputdata = {
              ...inputdata,
              ...treeFuntionResult.prompt,
            }
          } else if (treeFuntionResult.sendUsermessage) {
            newInputdata = {
              ...inputdata,
              sendUsermessage: inputdata.sendUsermessage ? inputdata.sendUsermessage.concat(treeFuntionResult.sendUsermessage) : treeFuntionResult.sendUsermessage,
            }
          }
          else {
            newInputdata = {
              ...inputdata,
              ...treeFuntionResult,
            }
          }

          if (Object.keys(obj[key]).length > 0 && treeFuntionResult.isContinue) {
            await traverseJSON(obj[key], newInputdata); // 如果当前键值还是一个对象，则递归遍历
          } else {
            treeFuntionResuList.push(newInputdata)
          }
        }
      }

    // } catch (error) {
    //   console.log(error, 9999999)
    // }
  }

  // const getHistoryMessage = () => {
  //   const history = messages.map((item: any) => {
  //     if (item.isComplete == true) {
  //       return { role: item.role, content: item.content.text };
  //     }
  //   }).filter(Boolean);
  //   return history.filter(Boolean);
  // };

  const getSnopPrompt = () => {

    const prompt = botState.prompt
    // console.log('getSnopPrompt', prompt)
    const { system, conversation, slideLists, logitBias } = prompt

    const {
      temperature,
      maximumLength,
      topP,
      frequencyPenalty,
      presencePenalty,
    } = slideLists;

    const promptInfo = {
      messages: [...system, ...conversation].filter(Boolean),
      parameter: {
        frequency_penalty: frequencyPenalty,
        temperature: temperature,
        max_tokens: maximumLength,
        presence_penalty: presencePenalty,
        top_p: topP,
        logit_bias: logitBias,
      },
    };

    return promptInfo;
  };

  async function botAnswer(
    msg: string,
    prompt: any,
    history: any,
    modify: any,
  ) {
    try {
      const finalInfo = {
        parameter: prompt.parameter,
        messages: [
          ...prompt.messages,
          ...history,
          {
            role: 'user',
            content: `${modify?.prefix ? modify?.prefix : ''} ${msg} ${modify?.suffix ? modify?.suffix : ''
              }`,
          },
        ],
      };
      const ans = await chatToOpenai(finalInfo);
      if (ans.data) {
        const { botFunctionTree } = botState
        const result = await getFunctionTreeResult(botFunctionTree, ans.data.message.content, 'assistant')
        await pipelineResult(result)



        const _id = makeNodeId();
        const messageItem: any = {
          _id: _id,
          type: 'text',
          role: 'assistant',
          content: { text: result.input ? result.input : ans.data.message.content },
          realContent: { text: ans.data.message.content },
          position: 'left',
          isComplete: true,
          user: { avatar: botState.avatar },
          createdAt: dayjs().valueOf(),
        };

        if (result.sendUsermessage) {
          setTyping(true);
          result.sendUsermessage.forEach((item: any) => {
            chatFunction.assistantSend(item.type, item.content)
            setTyping(false);
          })
        }
        if (!result.stopGenurate) {
          appendMsg(messageItem);
          messageHistoryState.list.push(messageItem);
          updataHistory(messageItem)
        }
      } else {
        const _id = makeNodeId();
        const messageItem: any = {
          _id: _id,
          type: 'text',
          role: 'assistant',
          content: { text: 'Build failed, try to rebuild' },
          realContent: { text: 'Build failed, try to rebuild' },
          position: 'left',
          isComplete: false,
          user: { avatar: botState.avatar },
          createdAt: dayjs().valueOf(),
        };
        appendMsg(messageItem);
        messageHistoryState.list.push(messageItem);
        updataHistory(messageItem)
      }
    } catch (error) {
      console.log(error);
      const _id = makeNodeId();
      const messageItem: any = {
        _id: _id,
        type: 'text',
        role: 'assistant',
        content: { text: 'Build failed, try to rebuild' },
        position: 'left',
        isComplete: false,
        user: { avatar: botState.avatar },
        createdAt: dayjs().valueOf(),
      };
      appendMsg(messageItem);
      messageHistoryState.list.push(messageItem);
      updataHistory(messageItem)
    }
  }

  function renderMessageContent(msg: any) {
    const { type, content, realContent } = msg;
    // console.log(type,content ,222222)
    if (msg.role == 'user') {
      const hoverContent = (
        <div>
          <div>{dayjs(msg.createdAt).format('MM-DD HH:mm:ss')} </div>
          <div className={styles.hoverCatageTitle}>Prompts</div>
          {msg.propmt.messages?.length > 0 &&
            msg.propmt.messages.map((item: any, index: number) => {
              return (
                <Row onMouseDown={(e) => e.stopPropagation()} key={index}>
                  <Col className={styles.hoverContentTitle}>{item.role}: </Col>
                  <Col>{item.content}</Col>
                </Row>
              );
            })}
          <div className={styles.hoverCatageTitle}>History</div>
          {msg.history.length > 0 &&
            msg.history.map((item: any, index: number) => {
              return (
                <Row onMouseDown={(e) => e.stopPropagation()} key={index}>
                  <Col className={styles.hoverContentTitle}>{item.role}: </Col>
                  <Col>{item.content}</Col>
                </Row>
              );
            })}
        </div>
      );
      return (
        <Popover  content={hoverContent} title="Log" trigger="click">
          <Popover
            content={hoverContent}
            title={realContent.text}
            trigger="hover"
          >
            <div  onMouseDown={(e) => e.stopPropagation()} >
              <Bubble content={content.text} />
            </div>
          </Popover>
        </Popover>
      );
    } else {
      switch (type) {
        case 'text':
          return <Bubble onMouseDown={(e) => e.stopPropagation()} content={content.text} />;
        case 'image':
          return (
            <Bubble onMouseDown={(e) => e.stopPropagation()} type="image">
              <img src={content?.picUrl} alt="" />
            </Bubble>
          );
        default:
          return null;
      }
    }
  }

  async function handleQuickReplyClick(item: any) {

    // await handleSendSelf('text', item.name);
    const { quickRepliesFunctionTree } = botState
    const result = await getFunctionTreeResult(quickRepliesFunctionTree[item.key], item.name, 'user')

    const promptInfo = getSnopPrompt();
    const _id = makeNodeId();
    const messageItem: any = {
      _id: _id,
      type: 'text',
      role: 'user',
      content: { text: item.name },
      position: 'right',
      realContent: { text: `${botState?.modify?.prefix ? botState?.modify?.prefix : ''} ${result.input ? result.input : item.name} ${botState?.modify?.suffix ? botState?.modify?.suffix : ''}` },
      createdAt: dayjs().valueOf(),
      history: botState.history.concat([]),
      propmt: promptInfo,
      modify: botState.modify,
    };
    appendMsg(messageItem);
    messageHistoryState.list.push(messageItem);
    updataHistory(messageItem)


    await pipelineResult(result)
    if (result.sendUsermessage) {
      setTyping(true);
      result.sendUsermessage.forEach((item: any) => {
        setTimeout(() => {
          chatFunction.assistantSend(item.type, item.content)
          setTyping(false);
        }, 500);
      })
    }

    if (!result.stopGenurate) {
      setTyping(true);
      botAnswer(result.input ? result.input : item.name, promptInfo, botState.history, botState.modify);
    }

  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00AA90',
        },
      }}
    >
      <div className={styles.chatContainer}>
        <div className={styles.chatBoxWrap}>
          <Chat
            renderNavbar={() => <ChatHeader></ChatHeader>}
            messages={messages}
            quickReplies={botStateSnap.quickReplies}
            renderMessageContent={renderMessageContent}
            onQuickReplyClick={handleQuickReplyClick}
            onSend={handleSendSelf}
          />
        </div>
      </div>
    </ConfigProvider>
  );
}
