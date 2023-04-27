import styles from './index.less'
import { Input, Row, Col, Select, ConfigProvider } from 'antd';
import DragModel from '@/components/apureComponents/dragModel';
import React, { useRef, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';

const { TextArea } = Input
export default ({ node }: any) => {
    const { string,replace } = node.getData()
    const [open, setOpen] = useState(false);

    const changeString = (val: any) => {
        node.setData({
            string: val.target.value,
            replace:replace
        })
    }

    const changeReplace = (val: any) => {
        node.setData({
            string: string,
            replace:val.target.value
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
            Replace Message
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
                {string.substring(0, 5) + '...->' +  replace.substring(0, 5) + '...' }
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
                    <TextArea onClick={(e) => { e.stopPropagation() }} value={string} onChange={changeString} />
                </Col>
                <Col  span={12} >
                    <TextArea onClick={(e) => { e.stopPropagation() }} value={replace} onChange={changeReplace} />
                </Col>
                </Row>
            </DragModel>
        </ConfigProvider>
    </div>
}