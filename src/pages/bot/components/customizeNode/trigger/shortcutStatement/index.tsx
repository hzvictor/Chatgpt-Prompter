import styles from './index.less'
import { Input, Row, Col, Select, ConfigProvider } from 'antd';
import DragModel from '@/components/apureComponents/dragModel';
import React, { useRef, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { Icon } from '@chatui/core';
const { TextArea } = Input
export default ({ node }: any) => {
    const { name,icon,isNew,isHighlight } = node.getData()
    const [open, setOpen] = useState(false);

    const changeVal = (val: any) => {
        node.setData({
            name: val.target.value,
            icon,isNew,isHighlight
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


    const handleIsNew =(val:any)=>{
        node.setData({
            isNew: val,
            name,icon,isHighlight
        })
    }
    const handleIcon =(val:any)=>{
        node.setData({
            icon: val,
            name,isNew,isHighlight
        })
    }
    const handleIsHighlight =(val:any)=>{
        node.setData({
            isHighlight: val,
            icon,isNew,name
        })
    }

    return <div className={styles.nodeContainer} >
        <div className={styles.nodeTitle} >
            Shortcut Statement
        </div>
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#00AA90',
                },
            }}

        >

            <div onClick={showModal} className={styles.matchString}>
                <Icon type={icon} />
                {name.substring(0, 8) + '...'}
            </div>

            <DragModel open={open}
                mask={false}
                destroyOnClose={true}
                onOk={handleOk}
                footer={null}
                title="Shortcut Statement"
                onCancel={handleCancel}>
                <Row align="middle" gutter={16}>
                    <Col span={8}>
                        <Select
                            defaultValue={icon}
                            style={{ width: '100%' }}
                            onChange={handleIcon}
                            options={[
                                { value: 'null', label: 'null' },
                                { value: 'message', label: 'message' },
                                { value: 'alarm', label: 'alarm' },
                                { value: 'apps', label: 'apps' },
                                { value: 'cancel', label: 'cancel' },
                                { value: 'compass', label: 'compass' },
                                { value: 'copy', label: 'copy' },
                                { value: 'file', label: 'file' },
                                { value: 'folder', label: 'folder' },
                                { value: 'image', label: 'image' },
                                { value: 'smile', label: 'smile' },
                            ]}
                        />

                    </Col>
                    <Col span={8}>
                        <Select
                            defaultValue={isNew}
                            style={{ width: '100%' }}
                            onChange={handleIsNew}
                            options={[
                                { value: true, label: 'true' },
                                { value: false, label: 'false' },
                            ]}
                        />

                    </Col>
                    <Col span={8}>
                        <Select
                            defaultValue={isHighlight}
                            style={{ width: '100%' }}
                            onChange={handleIsHighlight}
                            options={[
                                { value: true, label: 'true' },
                                { value: false, label: 'false' },
                            ]}
                        />

                    </Col>
                </Row>
                <br />
                <Row>
                    <TextArea onClick={(e) => { e.stopPropagation() }} value={name} onChange={changeVal} />
                </Row>
            </DragModel>
        </ConfigProvider>
    </div>
}