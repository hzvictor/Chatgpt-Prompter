import styles from './index.less'
import { Input, Row, Col, Select, ConfigProvider } from 'antd';
import DragModel from '@/components/apureComponents/dragModel';
import React, { useRef, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';

const { TextArea } = Input
export default ({ node }: any) => {
    const { prefix , suffix } = node.getData()
    const [open, setOpen] = useState(false);

    const changeString = (val: any) => {
        node.setData({
            prefix: val.target.value,
            suffix:suffix
        })
    }

    const changeReplace = (val: any) => {
        node.setData({
            prefix: prefix,
            suffix:val.target.value
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
            Replace Modify 
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
                {prefix.substring(0, 5) + '... / ' +  suffix.substring(0, 5) + '...' }
            </div>

            <DragModel open={open}
                mask={false}
                destroyOnClose={true}
                onOk={handleOk}
                footer={null}
                title="Replace Message"
                onCancel={handleCancel}>
                <Row gutter={30}>
                <Col span={12} >
                    <TextArea onClick={(e) => { e.stopPropagation() }} value={prefix} onChange={changeString} />
                </Col>
                <Col  span={12} >
                    <TextArea onClick={(e) => { e.stopPropagation() }} value={suffix} onChange={changeReplace} />
                </Col>
                </Row>
            </DragModel>
        </ConfigProvider>
    </div>
}