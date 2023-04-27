import styles from './index.less'
import { InputNumber, Row, Col, Select, ConfigProvider } from 'antd';
import DragModel from '@/components/apureComponents/dragModel';
import React, { useRef, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';

export default ({ node }: any) => {
    const { role, index, formula } = node.getData()
    const [open, setOpen] = useState(false);

    const changeVal = (val: any) => {
        node.setData({
            index: val,
            formula:formula,
            role:role
        })
    }

    const handleChange = (value:any) => {
        node.setData({
            index: index,
            formula:value,
            role:role
        })
    }

    const handleChangeRole = (value:any) => {
        node.setData({
            index: index,
            formula:formula,
            role:value
        })
    }

    const showModal = () => {
        setOpen(true);
    };



    const handleOk = (e: React.MouseEvent<HTMLElement>) => {
        
        setOpen(false);
    };

    const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
        
        setOpen(false);
    };

    return <div className={styles.nodeContainer} >
        <div className={styles.nodeTitle} >
        Match Index
        </div>
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#00AA90',
                },
            }}

        >

            <div onClick={showModal} className={styles.matchString}>
                <EditOutlined />
                {role + ' ' + formula + ' ' + index}
            </div>

            <DragModel open={open}
                mask={false}
                destroyOnClose={true}
                onOk={handleOk}
                footer={null}
                width={380}
                title="Match Index"
                onCancel={handleCancel}>
                <Row gutter={16} align="middle">
                <Col span={6}>
                        <Select
                            defaultValue={role}
                            style={{width:'100%'}}
                            onChange={handleChangeRole}
                            options={[
                                { value: 'all', label: 'All' },
                                { value: 'assistant', label: 'Assistant' },
                                { value: 'user', label: 'User' },
                            ]}
                        />

                    </Col>
                    <Col span={9}>
                        <Select
                            defaultValue={formula}
                            style={{width:'100%'}}
                            onChange={handleChange}
                            options={[
                                { value: 'equal', label: 'Equal' },
                                { value: 'notequal', label: 'Not equal' },
                                { value: 'lessthan', label: 'Less than' },
                                { value: 'greaterthan', label: 'Greater than' },
                            ]}
                        />

                    </Col>
                    <Col span={9}> <InputNumber style={{ width: "70px",marginTop:'3px' }} onClick={(e) => { e.stopPropagation() }} value={index} onChange={changeVal} /></Col>
                </Row>
            </DragModel>
        </ConfigProvider>
    </div>
}