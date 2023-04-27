import GoogleSvg from '../../../public/assets/imgs/google.svg'
import DiscordSvg from '../../../public/assets/imgs/discord.svg'
import { Avatar, Button, Checkbox, Tabs, Form, Input } from 'antd';
import { register, login } from '@/services/user'
import { userState } from '@/stores/user'
import { useState } from 'react';
import styles from './index.less'
// const backendUrl = 'https://test.server.prompterhub.com';
export default ({ onCancel }: any) => {
    const [loading, setLoading] = useState(false)

    const onFinish = (values: any) => {
        setLoading(true)
        if(!values.email){
            login(values).then(res => {
                setLoading(false)
                if (res.jwt) {
                    userState.jwt = `Bearer ${res.jwt}`
                    userState.islogin = true
                    userState.username = res.user.username
                    onCancel()
                }
            })
        }else{
            register(values).then(res => {
                setLoading(false)
                if (res.jwt) {
                    userState.jwt = `Bearer ${res.jwt}`
                    userState.islogin = true
                    userState.username = res.user.username
                    onCancel()
                }
            })
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };


    return <>
        <br />
        <Tabs
            defaultActiveKey="1"
            centered
            items={[
                {
                    label: `Login`,
                    key: 'login',
                    children: <Form
                        name="basic"
                        labelCol={{ span: 5 }}
                        // wrapperCol={{ span: 16 }}
                        // style={{ maxWidth: 600 }}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="Username"
                            name="identifier"
                            rules={[{ required: true, message: 'Please input your email!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 1 }}>
                            <Button loading={loading} type="primary" htmlType="submit">
                                Login
                            </Button>
                        </Form.Item>
                    </Form>
                }
                , {
                    label: `Register`,
                    key: 'register',
                    children: <Form
                        name="basic"
                        labelCol={{ span: 5 }}
                        // wrapperCol={{ span: 16 }}
                        // style={{ maxWidth: 600 }}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: 'Please input your email!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Username"
                            name="username"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item wrapperCol={{ offset: 1 }}>
                            <Button loading={loading} type="primary" htmlType="submit">
                                Register
                            </Button>
                        </Form.Item>
                    </Form>
                }
            ]} />

        {/* <div style={{ color: "#999" }} >If the account does not exist, it will be registered</div> */}
        {/* <a className={styles.loginButton} href={`${backendUrl}/api/connect/google`} >
            <Avatar size={39} src={GoogleSvg} />
            <p className={styles.loginButtonName} >Login with Google</p>
        </a> */}
        {/* <a className={styles.loginButton} href={`${backendUrl}/api/connect/discord`}>
            <Avatar size={39} src={DiscordSvg} />
            <p className={styles.loginButtonName} >Login with Discord</p>
        </a> */}
    </>
}

