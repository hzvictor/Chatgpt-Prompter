import styles from './index.less'
import { Input, Row, Col, Select, Popover, ConfigProvider } from 'antd';
import DragModel from '@/components/apureComponents/dragModel';
import React, { useEffect, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { useSnapshot, snapshot } from 'valtio';
import modifyStore from '@/stores/modify'

const { modifyState } = modifyStore;
export default ({ node }: any) => {
    const { modify } = node.getData()
    const [open, setOpen] = useState(false);
    const modifyData = useSnapshot(modifyState)

    const updateModifytData = async () => {
        const modifyDataInfo = snapshot(modifyState)
        node.setData({
            modify: modifyDataInfo.list[0],
        })
    }

    if (modify.prefix == "") {
        updateModifytData()
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



    const ModifyHoverConten = () => {
        return <div className={styles.promptsContainer}>
            <div className={styles.hoverCatageTitle}>Modify</div>
            <div>Prefix: {modify?.prefix} </div>
            <div>Suffix:  {modify?.suffix} </div>
        </div>
    }


    const handalChangeSelect = async (value: any) => {
        const newModify = modifyData.list.find((item: any) => item.key == value)
        node.setData({
            modify: newModify
        })
    }


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
                {modify.prefix.substring(0, 5) + '... ' + modify.suffix.substring(0, 5) + '...'}
            </div>

            <DragModel open={open}
                mask={false}
                destroyOnClose={true}
                onOk={handleOk}
                footer={null}
                title="Replace Modify"
                width={300}
                onCancel={handleCancel}>
                <Row align="middle">
                    <Col>
                        <Popover content={ModifyHoverConten}>
                            <Popover content={ModifyHoverConten} trigger="click">
                                Modify:
                            </Popover>
                        </Popover> &nbsp; </Col>
                    <Col><Select
                        defaultValue={modifyData.list[0]?.key}
                        style={{ minWidth: "150px", maxWidth: "160px" }}
                        onChange={(val: any) => { handalChangeSelect(val) }}
                        options={modifyData.list.map((item: any) => {
                            return { value: item.key, label: `${item.prefix}-${item.suffix}` }
                        })}
                    /></Col>
                </Row>


            </DragModel>
        </ConfigProvider>
    </div>
}