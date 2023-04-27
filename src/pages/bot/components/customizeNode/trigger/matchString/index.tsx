import styles from './index.less'
import { Input, Row, Col, Select, ConfigProvider } from 'antd';
import DragModel from '@/components/apureComponents/dragModel';
import React, { useRef, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';

const { TextArea } = Input
export default ({ node }: any) => {
    const { string, formula } = node.getData()
    const [open, setOpen] = useState(false);

    const changeVal = (val: any) => {
        node.setData({
            string: val.target.value,
            formula:formula
        })
    }

    const handleChange = (value:any) => {
        node.setData({
            string: string,
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
            Match String
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
                {formula + ' '  + string.substring(0, 3) + '...'}
            </div>

            <DragModel open={open}
                mask={false}
                destroyOnClose={true}
                onOk={handleOk}
                footer={null}
                title="Match String"
                onCancel={handleCancel}>
                <Row gutter={30} align="middle">
                    <Col span={8}>
                        <Select
                            defaultValue={formula}
                            style={{width:'100%'}}
                            onChange={handleChange}
                            options={[
                                { value: 'equal', label: 'Equal' },
                                { value: 'notequal', label: 'Not equal' },
                                { value: 'contains', label: 'Contains' },
                                { value: 'notContains', label: 'NotContains' },
                                { value: 'startsWith', label: 'StartsWith' },
                                { value: 'endsWith', label: 'EndsWith' },
                            ]}
                        />

                    </Col>
                    <Col span={16}> <TextArea onClick={(e) => { e.stopPropagation() }} value={string} onChange={changeVal} /></Col>
                </Row>
            </DragModel>
        </ConfigProvider>
    </div>
}