import { Descriptions, Avatar } from 'antd';
import botStore from '@/stores//bot';
import React, { useEffect, useState } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, Select } from 'antd';
import { apikeysState } from '@/stores/apikeys';
import { creatChatbot, getChatbotByProjectid, updateChatbot } from '@/services/bots'
import { snapshot } from 'valtio'
import { activeProject } from '@/stores/project';
import { Divider, Typography } from 'antd';


const { Paragraph } = Typography;
const { botState } = botStore

export default () => {
    const [form] = Form.useForm();
    const [requiredMark, setRequiredMarkType] = useState<RequiredMark>('optional');
    const [dataSource, setDataSource] = useState(snapshot(apikeysState))
    const [isShowSelectKey, setIsShowSelectKey] = useState(false)
    const [isShowUpdateBot, setIsShowUpdateBot] = useState(false)
    const [isUpdateBot, setIsUpdateBot] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [chatbotId, setChatbotId] = useState(-1)

    const onRequiredTypeChange = (result: any) => {
        // setRequiredMarkType(requiredMarkValue);
        if (JSON.stringify(result.is_with_key)) {
            if (result.is_with_key) {
                setIsShowSelectKey(true)
            } else {
                setIsShowSelectKey(false)
            }
        }
        if (JSON.stringify(result.is_bot_update)) {
            if (result.is_bot_update) {
                setIsUpdateBot(true)
            } else {
                setIsUpdateBot(false)
            }
        }


    };

    useEffect(() => {
        setIsLoading(true)
        getChatbotByProjectid(activeProject.activeProjectID).then((res: any) => {
            console.log(res)
            setIsLoading(false)
            if (res.data && res.data.length > 0 ) {
                setIsShowUpdateBot(true)
                form.setFieldsValue(res.data[0].chatbot)
                setChatbotId(res.data[0].chatbot.id)
                if (JSON.stringify(res.data[0].chatbot.is_with_key)) {
                    if (res.data[0].chatbot.is_with_key) {
                        setIsShowSelectKey(true)
                    } else {
                        setIsShowSelectKey(false)
                    }
                }
            }
        })
    }, [])

    const handleChange = (value: string) => {
        const newDatasource = Object.assign({}, dataSource)
        newDatasource.currentuse = value
        setDataSource(newDatasource)
    };

    const onFinish = (values: any) => {
        console.log('Success:', values);
        setIsLoading(true)
        const botdata = snapshot(botState)
        if (isShowUpdateBot) {

            if (isUpdateBot) {
                updateChatbot(chatbotId, {
                    ...values,
                    config: botdata,
                }).then((res) => {
                    setIsLoading(false)
                })
            } else {
                updateChatbot(chatbotId, {
                    ...values,
                }).then((res) => {
                    setIsLoading(false)
                })
            }

        } else {
            creatChatbot({
                ...values,
                config: botdata,
                projectid: activeProject.activeProjectID
            }).then(res => {
                console.log(res, 888888)
                setIsLoading(false)
                setIsShowUpdateBot(true)
            })
        }

    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    return <div onMouseDown={(e) => e.stopPropagation()}>
        <Descriptions>
            <Descriptions.Item label="Bot Name">{botState.name}</Descriptions.Item>
            <Descriptions.Item label="History Strategy">{botState.strategy}</Descriptions.Item>
            <Descriptions.Item label="Avatar">
                <Avatar src={botState.avatar} alt="" />
            </Descriptions.Item>
            <Descriptions.Item label="Describe">
                {botState.describe}
            </Descriptions.Item>
        </Descriptions>

        <Form
            form={form}
            layout="vertical"
            // initialValues={initialValues}
            onValuesChange={onRequiredTypeChange}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            requiredMark={requiredMark}
        >
            {isShowUpdateBot &&
                <Form.Item name="is_bot_update"
                    rules={[{ required: true, message: 'Please select your choice' }]}
                    label="Do you want to update the current chatbot configuration to the server?"
                    tooltip="There is a gap for update">
                    <Radio.Group>
                        <Radio.Button value={true}>Yes</Radio.Button>
                        <Radio.Button value={false}>No</Radio.Button>
                    </Radio.Group>
                </Form.Item>
            }
            <Form.Item name="is_community"
                rules={[{ required: true, message: 'Please select your choice' }]}
                label="Do you want to post to the community?"
                tooltip="There is a risk of leakage with the key, and the interface will directly request openai locally, which is faster">
                <Radio.Group>
                    <Radio.Button value={true}>Yes</Radio.Button>
                    <Radio.Button value={false}>No</Radio.Button>
                </Radio.Group>
            </Form.Item>
            {/* <Form.Item
                rules={[{ required: true, message: 'Please select your choice' }]}
                name="is_with_key" label="Do you want to publish with a key?" required tooltip="There is a risk of leakage with the key, and the interface will directly request openai locally, which is faster">
                <Radio.Group>
                    <Radio.Button value={true}>Yes</Radio.Button>
                    <Radio.Button value={false}>No</Radio.Button>
                </Radio.Group>
            </Form.Item> */}
            {
                isShowSelectKey && <Form.Item
                    rules={[{ required: true, message: 'Please select your choice' }]}
                    name="is_in_bot"
                    required
                    label="Is your key entrusted to the server for management or directly kept in the bot"
                    tooltip="There is a risk of leakage with the key, and the interface will directly request openai locally, which is faster"
                >
                    <Radio.Group>
                        <Radio.Button value={false}>Server</Radio.Button>
                        <Radio.Button value={true}>Your Bot</Radio.Button>
                    </Radio.Group>
                </Form.Item>
            }
            {
                isShowSelectKey && <Form.Item
                    rules={[{ required: true, message: 'Please select your choice' }]}
                    name="key"
                    required
                    label="Which key do you want to use for this bot"
                    tooltip="There is a risk of leakage with the key, and the interface will directly request openai locally, which is faster"
                >
                    <Select
                        // defaultValue={dataSource.keys[0]?.apikey}
                        style={{ width: 120 }}
                        onChange={handleChange}
                        options={dataSource.keys.map((item: any) => {
                            return { value: item?.apikey, label: item?.name }
                        })}
                    />
                </Form.Item>
            }
            <Form.Item>
                <Button loading={isLoading} type="primary" htmlType="submit">{isShowUpdateBot ? 'Update' : 'Publish'}</Button>
            </Form.Item>
            {
                isShowUpdateBot ? <>
                    <div>
                        Your Chatbot Link:
                    </div>
                    <div><Paragraph copyable>{`${window.location.origin}/chat/${activeProject.activeProjectID}`}</Paragraph>
                    </div>
                </> : <>
                    <div>
                        After publishing you will get a share link
                    </div>
                    <div>
                        You can modify these settings at any time
                    </div>
                </>
            }
        </Form>
    </div>
}