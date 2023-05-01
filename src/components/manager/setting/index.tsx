import { Descriptions, Avatar } from 'antd';
import botStore from '@/stores//bot';
import React, { useEffect, useState } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio, Select } from 'antd';
import { Divider, Typography } from 'antd';
import { connect } from 'umi';



function Setting({ layoutConfig, dispatch, projectid }: any) {
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue(layoutConfig)
    }, [])

    const handleChange = (value: any) => {
        const newLayoutConfig = JSON.parse(JSON.stringify(layoutConfig))
        newLayoutConfig[Object.keys(value)[0]] = value[Object.keys(value)[0]]
        dispatch({
            type: 'layoutConfig/updateLayoutConfig',
            payload: {
                nanoid: projectid,
                data: { layoutConfig:newLayoutConfig}
            },
        })
    };


    return <div >


        <Form
            form={form}
            layout="vertical"
            // initialValues={initialValues}
            onValuesChange={handleChange}
        // requiredMark={requiredMark}
        >
            {
                Object.keys(layoutConfig).map((item: any) => {

                    if (item != 'layoutGrid') {
                        return <Form.Item
                            rules={[{ required: false, message: 'Please select your choice' }]}
                            name={item} label={`Whether ${item}`} key={item} required tooltip="">
                            <Radio.Group>
                                <Radio.Button value={true}>Yes</Radio.Button>
                                <Radio.Button value={false}>No</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                    }
                })
            }


        </Form>
    </div>
}

export default connect(({ layoutConfig }) => ({
    layoutConfig
}))(Setting) 