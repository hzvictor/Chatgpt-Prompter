import styles from './index.less';
import Chat, { Bubble, useMessages } from '@chatui/core';
import '@chatui/core/dist/index.css';
import { chatToOpenai } from '@/services/openai'
import { Popover, Row, Col, ConfigProvider } from 'antd';
import { getProjectChatbot, newChatbot, updateChatbotDetail }  from '@/database/prompter/chatbot'
import { useEffect, useState } from 'react';
import ChatHeader from './components/chatHeader';

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
const defaultQuickReplies = [
    {
        icon: 'message',
        name: '联系人工服务',
        isNew: true,
        isHighlight: true,
    },
    {
        name: '短语1',
        isNew: true,
    },
    {
        name: '短语2',
        isHighlight: true,
    },
    {
        name: '短语3',
    },
];

export default function ({projectid}:any) {
    // 消息列表
    const { messages, appendMsg, setTyping, resetList } = useMessages([]);

    const [ chatbotInfo, setChatbotInfo ] = useState({
        nanoid:'',
    })



    useEffect(()=>{
        getProjectChatbot(projectid).then((res:any)=>{
            if(res){
                setChatbotInfo(res)
                if(res.messageHistorys){
                    resetList(res.messageHistorys)
                }else{
                    resetList([])
                }
            }else{
                newChatbot(projectid)
            }
        })

    },[projectid])


    useEffect(()=>{
        updateChatbotDetail(chatbotInfo.nanoid, { messageHistorys: messages } )
    },[messages])

    // 发送回调
    function handleSend(type, val) {
        if (type === 'text' && val.trim()) {
            // TODO: 发送请求
            appendMsg({
                type: 'text',
                content: { text: val },
                position: 'right',
            });

            setTyping(true);

            // 模拟回复消息
            setTimeout(() => {
                appendMsg({
                    type: 'text',
                    content: { text: '亲，您遇到什么问题啦？请简要描述您的问题~' },
                });
            }, 1000);
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
                        renderNavbar={() => <ChatHeader chatbotInfo={chatbotInfo} ></ChatHeader>}
                        messages={messages}
                        renderMessageContent={renderMessageContent}
                        quickReplies={defaultQuickReplies}
                        onQuickReplyClick={handleQuickReplyClick}
                        onSend={handleSend}
                    />
                </div>
            </div>
        </ConfigProvider>
    );
}
