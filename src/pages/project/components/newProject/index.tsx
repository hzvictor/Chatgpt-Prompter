import React, { useEffect, useState } from 'react';
import styles from './index.less';
import {
    Button,
    Col,
    Form,
    Input,
    Row,
    Radio
} from 'antd';
import { newProject, updateProjectDetail } from '@/database/prompter/project'

import UploadAntdCover from '@/components/apureComponents/uploadAntdCover'
import TextArea from 'antd/es/input/TextArea';



const App: React.FC = ({ onCancel, projectInfo }: any) => {
    const [form] = Form.useForm();
    const [imgUrl, setImgUrl] = useState('');

    useEffect(() => {
        // form.setFieldsValue(projectInfo)
        const newProjectInfo = JSON.parse(JSON.stringify(projectInfo))

        form.setFieldsValue(newProjectInfo)
        if (projectInfo.cover && projectInfo.cover != '') {
            setImgUrl(projectInfo.cover)
        }
    }, [projectInfo])

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const onFinish = async (info: any) => {
        if (projectInfo.type) {
            await updateProjectDetail({
                nanoid: projectInfo.nanoid,
                data: { ...info, cover: imgUrl }
            })
        } else {
            await newProject(info.name, info.describe, imgUrl, info.type, info.model)

        }
        onCancel()
    };

    // const handleChange = (val:any) => {

    // }




    return (
        <>
            <Form layout="vertical"
                form={form}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
            >
                <Row >
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Name:"
                            rules={[{ required: false, message: 'Please enter user name' }]}
                        >
                            {
                                <Input
                                    placeholder="Please enter user name"
                                />
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <Row >
                    <Col span={16}>
                        <Form.Item
                            name="describe"
                            label="Describe:"
                            rules={[{ required: false, message: 'Please enter describe' }]}
                        >
                            {
                                <TextArea
                                    placeholder="Please enter user name"
                                />
                            }
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={16}>
                        <Form.Item
                            label="Cover:"
                            rules={[{ required: false, message: 'Please enter user name' }]}
                        >
                            <UploadAntdCover imgUrl={imgUrl} changImg={setImgUrl} >
                            </UploadAntdCover>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col >
                        <Form.Item
                            name="type"
                            label="Type:"
                            rules={[{ required: true, message: 'Please select type' }]}
                        >

                            <Radio.Group disabled={projectInfo.type}>
                                <Radio.Button value="chatbot">Chatbot</Radio.Button>
                                <Radio.Button value="plugin">Browser Plug-in</Radio.Button>
                                <Radio.Button value="reader">PDF Reader</Radio.Button>
                            </Radio.Group>

                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col >
                        <Form.Item
                            name="model"
                            label="Model:"
                            rules={[{ required: true, message: 'Please select model' }]}
                        >
                            <Radio.Group disabled={projectInfo.type}>
                                <Radio.Button value="turbo">Turbo</Radio.Button>
                                <Radio.Button value="davinaci">Davinaci</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item>
                    <Button type="primary" htmlType="submit">{projectInfo.type ? 'Update' : 'OK'}</Button>
                </Form.Item>
            </Form>
        </>
    );
};

export default App;
