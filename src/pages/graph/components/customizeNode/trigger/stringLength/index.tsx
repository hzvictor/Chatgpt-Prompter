import styles from './index.less'
import { InputNumber, Row, Col, Select, ConfigProvider } from 'antd';
import DragModel from '@/components/apureComponents/dragModel';
import React, { useRef, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';

export default ({ node }: any) => {
    const { length, formula } = node.getData()
    const [open, setOpen] = useState(false);

    const changeVal = (val: any) => {
        node.setData({
            length: val,
            formula:formula
        })
    }

    const handleChange = (value:any) => {
        node.setData({
            length: length,
            formula:value
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
            String Length
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
                {formula + ' ' + length}
            </div>

            <DragModel open={open}
                mask={false}
                destroyOnClose={true}
                onOk={handleOk}
                footer={null}
                width={280}
                title="Match String"
                onCancel={handleCancel}>
                <Row gutter={16} align="middle">
                    <Col span={15}>
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
                    <Col span={9}> <InputNumber style={{ width: "70px",marginTop:'3px' }} onClick={(e) => { e.stopPropagation() }} value={length} onChange={changeVal} /></Col>
                </Row>
            </DragModel>
        </ConfigProvider>
    </div>
}