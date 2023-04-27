import styles from './index.less';
import ChatBox from './components/box';
import ChatList from './components/chatList';
import HistoryList from './components/historyList';
import GridLayout from 'react-grid-layout';
import { Button, ConfigProvider } from 'antd';
import { RedoOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { KeepAlive } from 'umi';
import { chatLayout } from '@/stores/chat';
import { useSnapshot } from 'valtio';
import { getTargetChatbot } from '@/services/bots'
import { getAllBot, storeBot, updateBotToDB } from '@/database/chatboxs/bot'
import { storeMessageHistory, getMessageHistorysBot } from '@/database/chatboxs/messageHistory'
import dayjs from 'dayjs';
import botStore from '@/stores/chatboxs/bot';
import messageHistoryStore from '@/stores/chatboxs/messageHistory';
import { history } from 'umi';
import { makeNodeId } from '../../utils/withNodeId';
import { activeBot } from '@/stores/chatboxs/activebot';
const layoutGrid = [{ "w": 6, "h": 30, "x": 0, "y": 0, "i": "chatlist", "moved": false, "static": false }, { "w": 14, "h": 30, "x": 6, "y": 0, "i": "chatbox", "moved": false, "static": false }, { "w": 4, "h": 30, "x": 20, "y": 0, "i": "historylist", "moved": false, "static": false }]
export default function IndexPage(props: any) {
  const ref: any = useRef(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [contactList, setContactList] = useState([])

  const { layout } = useSnapshot(chatLayout);
  const [isChangeLayout, setIsChangeLayout] = useState({
    conversation: false,
  });

  useLayoutEffect(() => {
    setWidth(ref?.current?.offsetWidth);
    setHeight(ref?.current?.offsetHeight);
  }, []);


  useEffect(() => {
    updataContactList()
  }, [])

  const updataContactList = async () => {
    const allBots = await getAllBot()
    setContactList(allBots)
    if (props.match.params.projectid) {
      const currentBot = await getTargetChatbot((props.match.params.projectid))
      if (currentBot.data.length > 0) {
        const isExit = allBots.find((item: any) => item.nanoid == props.match.params.projectid)
        // console.log(isExit, 1111111)
        if (isExit) {
          await updateBotToDB(props.match.params.projectid, currentBot.data[0].attributes.config)
          updataBot(currentBot.data[0].attributes.config)

          activeBot.activebotID = props.match.params.projectid
          const allhistory = await getMessageHistorysBot(props.match.params.projectid)
          if (allhistory.length > 0) {
            activeBot.activeMessageID = allhistory[0].nanoid
          } else {
            const id = makeNodeId();
            await storeMessageHistory(id, props.match.params.projectid)
            activeBot.activeMessageID = id
          }

        } else {
          await storeBot(props.match.params.projectid, { ...currentBot.data[0].attributes.config, lastMessage: '', lastData: dayjs().valueOf() })

          const id = makeNodeId();
          await storeMessageHistory(id, props.match.params.projectid)
          activeBot.activeMessageID = id

          activeBot.activebotID = props.match.params.projectid
          const allBots = await getAllBot()
          updataBot({ ...currentBot.data[0].attributes.config, lastMessage: '', lastData: dayjs().valueOf() })
          setContactList(allBots)
        }
        history.replace('/chat')
      }
    }else{
      
    }
  }

  const updataBot = (bot: any) => {
    if (bot) {
      botStore.botState.botFunctionTree = bot.botFunctionTree,
        botStore.botState.userFunctionTree = bot.userFunctionTree,
        botStore.botState.firstTimeEntryTree = bot.firstTimeEntryTree,
        botStore.botState.quickRepliesFunctionTree = bot.quickRepliesFunctionTree,
        botStore.botState.historyFunction = bot.historyFunction,
        botStore.botState.functionmap = bot.functionmap,

        botStore.updataLogitBias([])
      botStore.botState.history.splice(0, botStore.botState.history.length, ...bot.history),
        botStore.botState.strategy = 'all',
        botStore.botState.strategyId = bot.strategyId;
      botStore.botState.avatar = bot.avatar;
      botStore.botState.quickReplies.splice(0, botStore.botState.quickReplies.length, ...bot.quickReplies),
        botStore.botState.name = bot.name;
    }
  }


  const onLayoutChange = (layout: any) => {
    const changeList = layout.filter((item: any) => {
      const result = layoutGrid.filter((grid: any) => {
        if (grid.i == item.i) {
          if (grid.w != item.w || grid.h != item.h) {
            return true;
          }
        }
        return false;
      });
      if (result.length > 0) {
        return true;
      } else {
        return false;
      }
    });

    const newIsChangeLayout = {
      conversation: false,
    };

    changeList.forEach((item: any) => {
      newIsChangeLayout[item.i] = true;
    });

    // console.log(newIsChangeLayout, 6666666)
    setIsChangeLayout(newIsChangeLayout);

    chatLayout.layout = layout;
    // this.props.onLayoutChange(layout); // updates status display
  };

  const ChangeSize = ({ layoutKey }: any) => {
    const changeToSamll = (ksyString: string) => {
      if (!isChangeLayout[layoutKey]) {
        const newLayout = chatLayout.layout.concat([]);
        let keyLayOut = chatLayout.layout.find(
          (item: any) => item.i == ksyString,
        );
        let keyLayOutIndex = chatLayout.layout.findIndex(
          (item: any) => item.i == ksyString,
        );
        keyLayOut.h = 2;
        keyLayOut.w = 3;
        newLayout.splice(keyLayOutIndex, 1, keyLayOut);

        chatLayout.layout.splice(
          0,
          chatLayout.layout.length,
          ...JSON.parse(JSON.stringify(newLayout)),
        );
      } else {
        const newLayout = chatLayout.layout.concat([]);
        let keyLayOut = chatLayout.layout.find(
          (item: any) => item.i == ksyString,
        );
        const keyOrignLayOut = layoutGrid.find(
          (item: any) => item.i == ksyString,
        );
        let keyLayOutIndex = chatLayout.layout.findIndex(
          (item: any) => item.i == ksyString,
        );
        keyLayOut.h = keyOrignLayOut?.h;
        keyLayOut.w = keyOrignLayOut?.w;
        newLayout.splice(keyLayOutIndex, 1, keyLayOut);
        chatLayout.layout.splice(
          0,
          chatLayout.layout.length,
          ...JSON.parse(JSON.stringify(newLayout)),
        );
      }
    };
    // console.log(isChangeLayout[layoutKey],7777777)
    return (
      <Button
        onClick={() => {
          changeToSamll(layoutKey);
        }}
        type="primary"
        style={{
          position: 'fixed',
          borderBottomRightRadius: '15px',
          zIndex: 100,
          top: '4px',
          backgroundColor: 'rgb(129,207,183)',
          left: '4px',
          color: 'gray',
          transform: 'scale(0.55)',
        }}
        size="small"
        icon={isChangeLayout[layoutKey] ? <RedoOutlined /> : <MinusOutlined />}
      ></Button>
    );
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00AA90',
        },
      }}
    >
      <div className={styles.container}  ref={ref}>
        <KeepAlive>
          <GridLayout
            className={styles.gridContainer}
            layout={layout}
            onLayoutChange={onLayoutChange}
            cols={24}
            margin={[0, 0]}
            rowHeight={height / 30}
            width={width}
            isDraggable={true}
          >
            <div className={styles.grad} key="chatlist">
              <ChangeSize layoutKey="chatlist"></ChangeSize>
              <ChatList 
                ></ChatList>
            </div>
            <div className={styles.grad} key="chatbox">
              <ChangeSize layoutKey="chatbox"></ChangeSize>
              <ChatBox></ChatBox>
            </div>
            <div className={styles.grad} key="historylist">
              <ChangeSize layoutKey="historylist"></ChangeSize>
              <HistoryList></HistoryList>
            </div>
          </GridLayout>
        </KeepAlive>
      </div>
    </ConfigProvider>
  );
}
