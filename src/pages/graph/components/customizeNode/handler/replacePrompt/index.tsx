import styles from './index.less'
import { Input, Row, Col, Select, Popover, ConfigProvider } from 'antd';
import DragModel from '@/components/apureComponents/dragModel';
import React, { useEffect, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { tabData } from '@/stores/tablist'
import { useSnapshot, snapshot } from 'valtio';
import { getTargetsyStemsWithFatherid } from '@/database/system'
import { getTargetConversationsWithFatherid } from '@/database/conversation'
import { getTargetSlideListsWithFatherid } from '@/database/slideLists'
import { getTargetLogitBiasWithFatherid } from '@/database/logitBias'
import { activeProject } from '@/stores/project';
import LogitBias from '@/components/bpurecomponents/logitBias';
import SlideList from '@/components/bpurecomponents/slideList';

export default ({ node }: any) => {
    const { prompt } = node.getData()
    const [open, setOpen] = useState(false);
    const [ promptInfo, setPromptInfo ] = useState(prompt)
    const tablistData = useSnapshot(tabData)

    const updatePromptData = async () => {
        const tabDataInfo = snapshot(tabData)

        const systemStateResult = await getTargetsyStemsWithFatherid(
            tabDataInfo.activeTabListId.systemId,
            activeProject.activeProjectID,
        );
        const conversationStateResult = await getTargetConversationsWithFatherid(
            tabDataInfo.activeTabListId.conversationId,
            activeProject.activeProjectID,
        );
        const logitBiastate = await getTargetLogitBiasWithFatherid(
            tabDataInfo.activeTabListId.logitBiasId,
            activeProject.activeProjectID,
        );
        const slideListState = await getTargetSlideListsWithFatherid(
            tabDataInfo.activeTabListId.slideListId,
            activeProject.activeProjectID,
        );
        delete slideListState.fatherid
        delete slideListState.nanoid
        node.setData({
            prompt: {
                system: systemStateResult.message ? systemStateResult.message : [],
                conversation: conversationStateResult.message ? conversationStateResult.message : [],
                logitBiasArray: logitBiastate.logitBiasArray
                    ? logitBiastate.logitBiasArray
                    : [],
                parameter: slideListState ? slideListState : {
                    
                }
            }
        })

    }

    if (!prompt) {
        updatePromptData()
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

    const LogicbitsHoverContent = () => {
        console.log(promptInfo.logitBiasArray,1111111)
        return (
            <div className={styles.logitsContainer}>
                <LogitBias logitBiasArray={promptInfo.logitBiasArray}></LogitBias>
            </div>
        );
    };

    const SlideListHoverContent = () => {
        return (
            <div className={styles.slideContainer}>
                <SlideList slideListsData={promptInfo.parameter}></SlideList>
            </div>
        );
    };

    const ConversationHoverContent = () => {

        const conversationMessage = promptInfo.conversation.map((item: any) => {
            if (item.children[0].text.trim().length != 0) {
                return { role: item.role, content: item.children[0].text };
            }
        });

        const info = [...conversationMessage].filter(
            Boolean,
        );

        return (
            <div className={styles.promptsContainer}>
                <div className={styles.hoverCatageTitle}>Conversation</div>
                {info.length > 0 &&
                    info.map((item: any, index: number) => {
                        return (
                            <Row key={index}>
                                <div className={styles.hoverContentTitle}>
                                    <span>{item.role}</span> :{' '}
                                    <span className={styles.hoverContent}>{item.content}</span>
                                </div>
                            </Row>
                        );
                    })}
            </div>
        );
    };

    const SystemHoverContent = () => {

        const systemMessage = promptInfo.system.map((item: any) => {
            if (item.children[0].text.trim().length != 0) {
                return { role: item.role, content: item.children[0].text };
            }
        });
        const info = [...systemMessage].filter(
            Boolean,
        );

        return (
            <div className={styles.promptsContainer}>
                <div className={styles.hoverCatageTitle}>System</div>
                {info.length > 0 &&
                    info.map((item: any, index: number) => {
                        return (
                            <Row key={index}>
                                <div className={styles.hoverContentTitle}>
                                    <span>{item.role}</span> :{' '}
                                    <span className={styles.hoverContent}>{item.content}</span>
                                </div>
                            </Row>
                        );
                    })}
            </div>
        );
    };

    const handalChangeSelect = async (value: any, type: string) => {
        if (type == 'system') {
            const systemStateResult = await getTargetsyStemsWithFatherid(
                value,
                activeProject.activeProjectID,
            );
            const newPrompttData: any = Object.assign({}, prompt)
            newPrompttData.system = systemStateResult.message ? systemStateResult.message : [],
                node.setData({
                    prompt: newPrompttData
                })
                setPromptInfo(newPrompttData)
        } else if (type == 'conversation') {
            const conversationStateResult = await getTargetConversationsWithFatherid(
                value,
                activeProject.activeProjectID,
            );

            const newPrompttData: any = Object.assign({}, prompt)
            newPrompttData.conversation = conversationStateResult.message ? conversationStateResult.message : [],
                node.setData({
                    prompt: newPrompttData
                })
                setPromptInfo(newPrompttData)
        } else if (type == 'logitBias') {
            const logitBiastate = await getTargetLogitBiasWithFatherid(
                value,
                activeProject.activeProjectID,
            );
            console.log(logitBiastate,777777777)
            const newPrompttData: any = Object.assign({}, prompt)
            newPrompttData.logitBiasArray = logitBiastate.logitBiasArray
                ? logitBiastate.logitBiasArray
                : []
            node.setData({
                prompt: newPrompttData
            })
            setPromptInfo(newPrompttData)

        } else if (type == 'slideList') {
            const slideListState = await getTargetSlideListsWithFatherid(
                value,
                activeProject.activeProjectID,
            );
            delete slideListState.fatherid
            delete slideListState.nanoid
            const newPrompttData: any = Object.assign({}, prompt)
            newPrompttData.parameter = slideListState ? slideListState : {},
                node.setData({
                    prompt: newPrompttData
                })
                setPromptInfo(newPrompttData)
        }
    }


    return <div className={styles.nodeContainer} >
        <div className={styles.nodeTitle} >
            Replace Prompt
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
                {/* {string.substring(0, 5) + '...->' + replace.substring(0, 5) + '...'} */}
            </div>

            <DragModel open={open}
                mask={false}
                destroyOnClose={true}
                onOk={handleOk}
                footer={null}
                title="Replace Prompt"
                onCancel={handleCancel}>
                <Row  justify="space-between"  >
                    <Row align="middle">
                        <Col>
                            <Popover content={SystemHoverContent}>
                                <Popover content={SystemHoverContent} trigger="click">
                                    System:
                                </Popover>
                            </Popover> &nbsp; </Col>
                        <Col><Select
                            defaultValue={tablistData.activeTabListId.systemId}
                            // value={langType}
                            style={{ minWidth: 120 }}
                            onChange={(val: any) => { handalChangeSelect(val, 'system') }}
                            options={tablistData.slideListTabList.systemId.map((item: any) => {
                                return { value: item.key, label: item.label }
                            })}
                        /></Col>
                    </Row>
                    <Row align="middle">
                        <Col>
                            <Popover content={ConversationHoverContent}>
                                <Popover content={ConversationHoverContent} trigger="click">
                                    Conversation:
                                </Popover>
                            </Popover> &nbsp; </Col>
                        <Col><Select
                            defaultValue={tablistData.activeTabListId.conversationId}
                            style={{ minWidth: 150 }}
                            onChange={(val: any) => { handalChangeSelect(val, 'conversation') }}
                            options={tablistData.slideListTabList.conversationId.map((item: any) => {
                                return { value: item.key, label: item.label }
                            })}
                        /></Col>
                    </Row>
                </Row>
                <br />
                <Row  justify="space-between" >
                    <Row align="middle">
                        <Col>
                            <Popover
                                overlayStyle={{ padding: 0 }}
                                overlayInnerStyle={{ padding: 0, overflow: 'hidden' }}
                                content={LogicbitsHoverContent}
                            >
                                <Popover
                                    overlayStyle={{ padding: 0 }}
                                    overlayInnerStyle={{ padding: 0, overflow: 'hidden' }}
                                    content={LogicbitsHoverContent}
                                    trigger="click"
                                >
                                    Logic Bits:  &nbsp;
                                </Popover>
                            </Popover>
                        </Col>
                        <Col><Select
                            defaultValue={tablistData.activeTabListId.logitBiasId
                            }
                            style={{ minWidth: 120 }}
                            onChange={(val: any) => { handalChangeSelect(val, 'logitBias') }}
                            options={tablistData.slideListTabList.logitBiasId
                                .map((item: any) => {
                                    return { value: item.key, label: item.label }
                                })}
                        /></Col>
                    </Row>
                    <Row align="middle">
                        <Col>
                            <Popover
                                overlayStyle={{ padding: 0 }}
                                overlayInnerStyle={{ padding: 0, overflow: 'hidden' }}
                                content={SlideListHoverContent}
                            >
                                <Popover
                                    overlayStyle={{ padding: 0 }}
                                    overlayInnerStyle={{ padding: 0, overflow: 'hidden' }}
                                    content={SlideListHoverContent}
                                    trigger="click"
                                >
                                    Parameters:  &nbsp;
                                </Popover>
                            </Popover>
                        </Col>
                        <Col><Select
                            defaultValue={tablistData.activeTabListId.slideListId
                            }
                            style={{ minWidth: 120 }}
                            onChange={(val: any) => { handalChangeSelect(val, 'slideList') }}
                            options={tablistData.slideListTabList.slideListId
                                .map((item: any) => {
                                    return { value: item.key, label: item.label }
                                })}
                        /></Col>
                    </Row>
                </Row>
            </DragModel>
        </ConfigProvider>
    </div>
}