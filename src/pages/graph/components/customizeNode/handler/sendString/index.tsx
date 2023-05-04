import styles from './index.less'
import { Input, Row, Col, Select, ConfigProvider } from 'antd';
import DragModel from '@/components/apureComponents/dragModel';
import React, { useRef, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';

const { TextArea } = Input
export default ({ node }: any) => {
    const { string } = node.getData()
    const [open, setOpen] = useState(false);

    const changeVal = (val: any) => {
        node.setData({
            string: val.target.value,
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
            Send Message
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
                {string.substring(0, 8) + '...'}
            </div>

            <DragModel open={open}
                mask={false}
                destroyOnClose={true}
                onOk={handleOk}
                footer={null}
                title="Send Message"
                onCancel={handleCancel}>
                <Row align="middle">
                <TextArea onClick={(e) => { e.stopPropagation() }} value={string} onChange={changeVal} />
                </Row>
            </DragModel>
        </ConfigProvider>
    </div>
}