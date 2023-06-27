import styles from './index.less';
import Chat, { Bubble, useMessages } from '@chatui/core';
import '@chatui/core/dist/index.css';
import { completionOpenai } from '@/services/openai'
import { getProjectSlidelistList } from '@/database/prompter/slidelist'
import { Popover, Row, message, ConfigProvider } from 'antd';
import { getProjectChatbot, newChatbot, updateChatbotDetail } from '@/database/prompter/chatbot'
import { useEffect, useState } from 'react';
import ChatHeader from './components/chatHeader';
import dayjs from 'dayjs';
import { makeNodeId } from '@/utils/withNodeId';
import { handelhistoryFunction } from '@/utils/handelFunction';
import { fakeHooks } from '@/stores/fakehooks';
import { getProjectPromptList } from '@/database/prompter/prompt'
import { piplineAllFunction, filterUsefulInfo } from '@/utils/graphUtils';
import {history as umiHistory } from 'umi'
import { chatToOpenaiServer } from '@/services/openai'
const initialMessages = [
    // {
    //     type: 'text',
    //     content: { text: '主人好，我是智能助理，你的贴心小助手~' },
    //     user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg' },
    // },
    // {
    //     type: 'image',
    //     content: {
    //         picUrl: '//img.alicdn.com/tfs/TB1p_nirYr1gK0jSZR0XXbP8XXa-300-300.png',
    //     },
    // },
];

// 默认快捷短语，可选
// const defaultQuickReplies = [
//     {
//         icon: 'message',
//         name: '联系人工服务',
//         isNew: true,
//         isHighlight: true,
//     },
//     {
//         name: '短语1',
//         isNew: true,
//     },
//     {
//         name: '短语2',
//         isHighlight: true,
//     },
//     {
//         name: '短语3',
//     },
// ];



export default function ({ projectid }: any) {
    // 消息列表
    const { messages, appendMsg, setTyping, resetList } = useMessages([]);
    const [chatbotInfo, setChatbotInfo] = useState({
        nanoid: '',
    })

    const [quickReplies, setQuickReplies] = useState([])

    const [history, setHistory] = useState([])

    fakeHooks.setQuickReplies = setQuickReplies as any

    const hzAppendMsg = (data: any) => {
        const { content, realContent, role = 'user', position = 'left', history = [], type = 'text', modify = {} } = data

        const _id = makeNodeId();
        const message = {
            _id: _id,
            type: type,
            role: role,
            content: content,
            position: position,
            realContent: realContent,
            createdAt: dayjs().valueOf(),
            history: history,
            modify: modify
        }
        appendMsg(message as any);

        return message

    }


    useEffect(() => {
        getProjectChatbot(projectid).then((res: any) => {
            if (res) {

                setChatbotInfo(res)

                if (res.messageHistorys) {
                    resetList(res.messageHistorys)
                } else {
                    resetList([])
                }

                if (res.history) {
                    setHistory(res.history)
                } else {
                    setHistory([])
                }


                if (res.quickReplies) {
                    setQuickReplies(res.quickReplies)
                } else {
                    setQuickReplies([])
                }

            } else {
                newChatbot(projectid)
            }
        })

    }, [projectid])


    useEffect(() => {
        updateChatbotDetail(chatbotInfo.nanoid, { messageHistorys: messages })
        updataHistory(messages)
    }, [messages])

    useEffect(() => {
        updateChatbotDetail(chatbotInfo.nanoid, { history: history })
    }, [history])

    async function getRealData(message: any) {

        const chatbotInfo = await getProjectChatbot(projectid)
        const slidelist = await getProjectSlidelistList(projectid)

        const messageindex = {
            all: 0,
            assistant: 0,
            user: 0,
        }
        for (let index = 0; index < messages.length; index++) {
            const element = messages[index];
            messageindex.all = messageindex.all + 1
            if (element.role == 'user') {
                messageindex.user = messageindex.user + 1
            } else {
                messageindex.assistant = messageindex.assistant + 1
            }
        }

        return {
            input: message,
            index: messageindex,
            messageHistory: messages,
            prompt: {
                parameter: slidelist.active ? slidelist.active.config : {},
                history: history,
                modify: chatbotInfo.modify ? chatbotInfo.modify : { prefix: '', suffix: '' },
                messages: []
            }
        }
    }


    async function updataHistory(messages: any) {
        const chatbotInfo = await getProjectChatbot(projectid)
        const slidelist = await getProjectSlidelistList(projectid)

        const messageindex = {
            all: 0,
            assistant: 0,
            user: 0,
        }
        for (let index = 0; index < messages.length; index++) {
            const element = messages[index];
            messageindex.all = messageindex.all + 1
            if (element.role == 'user') {
                messageindex.user = messageindex.user + 1
            } else {
                messageindex.assistant = messageindex.assistant + 1
            }
        }



        if (messages.length > 0) {
            let isPushHistory = true
            const lastMessage = messages[messages.length - 1].type == 'typing' ? messages[messages.length - 2] : messages[messages.length - 1]
            const InputData = {
                input: lastMessage,
                index: messageindex,
                messageHistory: messages,
                prompt: {
                    parameter: slidelist.active ? slidelist.active.config : {},
                    history: history,
                    modify: chatbotInfo.modify ? chatbotInfo.modify : { prefix: '', suffix: '' },
                    messages: []
                }
            }

            if (chatbotInfo.historyFunction) {
                isPushHistory = await handelhistoryFunction(chatbotInfo.historyFunction, InputData)
            }

            if (isPushHistory) {
                setHistory([...history, lastMessage])
            }
        }


    }


    const pipelineResult = async (result: any) => {

        if (result.clearHistory) {
            await setHistory([])
        }

        if (result.historyFunction) {
            await updateChatbotDetail(chatbotInfo.nanoid, { historyFunction: result.historyFunction.content })
        }

        if (result.modify) {
            await updateChatbotDetail(chatbotInfo.nanoid, { modify: result.modify })
        }
        
        if (result.parameter) {
            await updateChatbotDetail(chatbotInfo.nanoid, { parameter: result.parameter })
        }

    }

    const getFunctionTreeResult = async (tree: any, message: any) => {
        const chatbotInfo = await getProjectChatbot(projectid)

        const functionMap = chatbotInfo.functionMap

        const treeFuntionResuList: any = []
        const inputData = await getRealData(message)

        await traverseJSON(tree, inputData)
        const usefulInfo = filterUsefulInfo(treeFuntionResuList, inputData)

        return usefulInfo

        async function traverseJSON(obj: any, inputdata: any) {
            for (let key in obj) {
                const item = functionMap[key]
                const treeFuntionResult = await piplineAllFunction(item, inputdata)
                let newInputdata: any = {}
                if (treeFuntionResult.sendUsermessage) {
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
    }

    // 发送回调
    async function handleSend(type: any, val: any) {
            if (type === 'text' && val.trim()) {
                let newval = val
    
                const chatbotInfo = await getProjectChatbot(projectid)
    
                if (chatbotInfo.modify) {
                    if (type == 'text') {
                        newval = chatbotInfo.modify.prefix + newval + chatbotInfo.modify.suffix
                    }
                }
    
    
                const message = hzAppendMsg({
                    content: { text: val },
                    realContent: { text: newval },
                    role: 'user',
                    position: 'right'
                })
    
                // console.log(chatbotInfo,1111111111)
    
                if (chatbotInfo.userFunctionTree) {
                    const result = await getFunctionTreeResult(chatbotInfo.userFunctionTree, message)
                    await pipelineResult(result)
                    console.log(result,1111111)
                    if (result.sendUsermessage) {
                        setTyping(true);
                        result.sendUsermessage.forEach((item: any) => {
                            setTimeout(() => {
                                hzAppendMsg({
                                    content: item.content,
                                    realContent: item.content,
                                    role: 'assistant',
                                    position: 'left',
                                    type: item.type
                                })
                                setTyping(false);
                            }, 800);
                        })
                    }
    
                    if (!result.stopGenurate) {
                        setTyping(true);
                        botAnswer(type, result.input ? result.input : val);
                    }
                }else{
                    setTyping(true);
                    botAnswer(type, val);
                }
            }
    }



    fakeHooks.updateChatbotParameter = async () => {
        const slidelist = await getProjectSlidelistList(projectid)
        await updateChatbotDetail(chatbotInfo.nanoid, { parameter: slidelist.active})
    }

    const botAnswer = async (type: any, val: string) => {
        let newval = val
        const chatbotInfo = await getProjectChatbot(projectid)
        let parameter =  chatbotInfo.parameter

        if(!parameter){
            const slidelist = await getProjectSlidelistList(projectid)
            if (!slidelist.active) {
                message.info("parameter not exist")
                return
            }
            parameter = slidelist.active.config
        }

        
        if (chatbotInfo.modify) {
            if (type == 'text') {
                newval = chatbotInfo.modify.prefix + newval + chatbotInfo.modify.suffix
            }
        }

        if (chatbotInfo.history) {
            const historyListMessage = history.map((item: any) => {
                if (item.content.text) {
                    return item.content.text
                } else {
                    return ''
                }
            })
            const historyJoin = historyListMessage.join(`/n/n`)
            newval = historyJoin + '\/n\/n' + newval
        }

        if(umiHistory.location.pathname.includes('turbo')){
            console.log(val,22222222)
            const prompts = await getProjectPromptList(projectid)
            const messages = prompts.active.list.map((item: any) => { return { role: item.role, content: item.message } })

            if (!parameter.function_call) {
                delete parameter.function_call
            }
            if (parameter.functions.length == 0) {
                delete parameter.functions
            } else {
                parameter.functions = parameter.functions.map((item: any) => {
    
                    const required = item.parameters.map((parameter: any) => parameter.name)
    
                    const properties = {} as any
                    item.parameters.forEach((parameter: any) => {
                        if (parameter.enum) {
                            properties[parameter.name] = {
                                type: parameter.type,
                                description: parameter.description,
                                enum: parameter.enum,
                            }
                        } else {
                            properties[parameter.name] = {
                                type: parameter.type,
                                description: parameter.description,
                            }
                        }
    
    
                    })
    
                    return {
                        "name": item.name,
                        "description": item.description,
                        "parameters": {
                            "type": "object",
                            "properties": properties,
                            "required": required,
                        },
                    }
    
                })
            }

            chatToOpenaiServer({
                "messages": messages,
                ...parameter
            }).then((res) => {
                if (res) {
                    let message = 'cant get content'
                    if(res.data.message.content){
                        message = res.data.message.content
                    }else{
                        message = JSON.stringify(res.data.message.function_call)
                    }
                    
                    hzAppendMsg({
                        content: { text: message},
                        realContent: { text: message},
                        role: 'assistant',
                        position: 'left'
                    })
                }
            })

        }else{
            completionOpenai({
                ...parameter,
                prompt: newval,
            }).then(res => {
                console.log(res)
                hzAppendMsg({
                    content: { text: res?.data?.text.trim() },
                    realContent: { text: res?.data?.text.trim() },
                    role: 'assistant',
                    position: 'left'
                })
            })
        }

        
    }

    // 快捷短语回调，可根据 item 数据做出不同的操作，这里以发送文本消息为例
    function handleQuickReplyClick(item) {
        handleSend('text', item.name);
    }

    function renderMessageContent(msg) {
        const { type, content } = msg;

        // 根据消息类型来渲染
        switch (type) {
            case 'text':
                return <Bubble content={content.text} />;
            case 'image':
                return (
                    <Bubble type="image">
                        <img src={content.picUrl} alt="" />
                    </Bubble>
                );
            default:
                return null;
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
            <div className={`componentContainer  ${styles.chatContainer}`}>
                <div className={styles.chatBoxWrap}>
                    <Chat
                        renderNavbar={() => <ChatHeader resetList={resetList} setHistory={setHistory} chatbotInfo={chatbotInfo} ></ChatHeader>}
                        messages={messages}
                        renderMessageContent={renderMessageContent}
                        quickReplies={quickReplies}
                        onQuickReplyClick={handleQuickReplyClick}
                        onSend={handleSend}
                    />
                </div>
            </div>
        </ConfigProvider>
    );
}
