import { Button, Modal, List, message } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less'
import './index.css'
import dayjs from 'dayjs';
import botStore from '@/stores/chatboxs/bot';
import Avatar from 'react-avatar';
import { useSnapshot } from 'valtio';
import { getMessageHistorysBot, deleteMessage } from '@/database/chatboxs/messageHistory'
import messageHistoryStore from '@/stores/chatboxs/messageHistory';
import { activeBot, chatFunction } from '@/stores/chatboxs/activebot';
import { getTargetMessageHistory } from '@/database/chatboxs/messageHistory'
import { DeleteOutlined } from '@ant-design/icons';
import KeyTable from '@/components/manager/keysTable'
const { botState } = botStore
const { messageHistoryState } = messageHistoryStore
const App: React.FC = () => {
    const [historyList, setHistoryList] = useState([])
    const snapBotState = useSnapshot(botState)
    const snapActiveBot = useSnapshot(activeBot)
    const snapMessageHistoryState = useSnapshot(messageHistoryState)
    const [isKeysModalOpen, setIsKeysModalOpen] = useState(false);


    useEffect(() => {
        getMessageHistorysBot(activeBot.activebotID).then(res => {
            setHistoryList(res)
            console.log(res, 11111)
            if (res.length > 0) {
                activeBot.activeMessageID = res[0].nanoid
            }
        })
    }, [snapActiveBot.activebotID])


    const resethistoryList = () => {
        getMessageHistorysBot(activeBot.activebotID).then(res => {
            setHistoryList(res)
        })
    }

    chatFunction.resethistoryList = resethistoryList

    const showKeysModal = () => {
        setIsKeysModalOpen(true);
      };
    
      const handleKeysOk = () => {
        
        setIsKeysModalOpen(false);
      };
    
      const handleKeysCancel = () => {
        setIsKeysModalOpen(false);
      };

    const updataHistory = (messages: any) => {
        if (messages) {
            getTargetMessageHistory(messages.nanoid).then(res => {
                console.log(res, 1111111)
                messageHistoryState.list.splice(0, messageHistoryState.list.length, ...res.list)
                activeBot.activeMessageID = messages.nanoid
                chatFunction.resetList(res.list)
                getMessageHistorysBot(activeBot.activebotID).then(all => {
                    setHistoryList(all)
                })
            })
        }
    }


    const deletebotSelef = (e: any, item: any) => {
        if (historyList.length == 1) {
            message.info('delete error')
            return
        }
        e.stopPropagation();
        deleteMessage(item.nanoid).then(() => {
            activeBot.activeMessageID = ''
            chatFunction.resetList()
        })
    }

    return (

        <div className={` chatListContainer ${styles.chatListContainer}`}>
            <List
                itemLayout="horizontal"
                dataSource={historyList}
                renderItem={(item: any, index) => (

                    <List.Item actions={[<DeleteOutlined onClick={(e) => { deletebotSelef(e, item) }} />]} onClick={() => { updataHistory(item) }} className={`${snapActiveBot.activeMessageID == item.nanoid ? styles.active : ''}  ${styles.itemSelf}`}>
                        <List.Item.Meta

                            title={item.list[0] ? item.list[0].content.text : '...'}
                        />
                        {console.log(item, 1111111)}
                        <div className={styles.time} >{dayjs(item.list[0]?.createdAt).format('HH:mm')}</div>
                    </List.Item>
                )}
            />
            <div style={{ position: "fixed", bottom: '15px', right: "20px", borderTop: "1px slide #eee" }}>
                <Button type="primary"  onClick={ showKeysModal }  >API keys</Button>
            </div>
            <Modal
                title="API keys"
                open={isKeysModalOpen}
                width={600}
                onOk={handleKeysOk}
                onCancel={handleKeysCancel}
                destroyOnClose={true}
            >
                <KeyTable></KeyTable>
            </Modal>
        </div>
    );

}
export default App;