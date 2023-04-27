import { List } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less'
import './index.css'
import dayjs from 'dayjs';
import botStore from '@/stores/chatboxs/bot';
import Avatar from 'react-avatar';
import { useSnapshot } from 'valtio';
import { activeBot ,chatFunction} from '@/stores/chatboxs/activebot';
import { DeleteOutlined } from '@ant-design/icons';
import { deletebot, getAllBot } from '@/database/chatboxs/bot'
const { botState } = botStore

const App: React.FC = () => {
    const snapActiveBot = useSnapshot(activeBot)
    const [contactList, setContactList] = useState([])
    useEffect(() => {
        getAllBot().then(res => {
            setContactList(res)
        })

    }, [])

    const updataBot = (bot: any) => {
        console.log(bot, 'bot')
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
        activeBot.activebotID = bot.nanoid
    }

    const deletebotSelef = (e: any, item: any) => {
        

        e.stopPropagation();
        deletebot(item.nanoid).then(() => {
            activeBot.activebotID = ''
            activeBot.activeMessageID = ''
            chatFunction.resetList()
            chatFunction.resethistoryList()
            getAllBot().then(res => {
                setContactList(res)
            })
        })
    }

    return (

        <div className={` chatListContainer ${styles.chatListContainer}`}>
            <List
                itemLayout="horizontal"
                dataSource={contactList}
                renderItem={(item: any, index) => (
                    <List.Item
                        actions={[<DeleteOutlined onClick={(e) => { deletebotSelef(e, item) }} />]}
                        onClick={() => { updataBot(item) }} className={`${snapActiveBot.activebotID == item.nanoid ? styles.active : ''}  ${styles.itemSelf}`}>
                        <List.Item.Meta
                            avatar={item.avatar == '' ? <Avatar name={item.name} size="39" round={true} /> : <Avatar size="39" round={true} src={item.avatar} />}
                            title={item.name}
                            description={item.describe != '' ? item.describe : '...'}
                        />
                        <div className={styles.time} >{dayjs(item.lastData).format('HH:mm')}</div>
                    </List.Item>
                )}
            />
        </div>
    );

}
export default App;