import styles from './index.less';
import { Button, Space, Segmented } from 'antd';
import { KeepAlive, history } from 'umi';
import {
    RightOutlined,
    LeftOutlined,
    ArrowUpOutlined,
} from '@ant-design/icons';
import { upOrLeftState } from '@/stores/globalFunction';
import { Popover, Row, Col, Divider } from 'antd';
import conversationStore from '@/stores/conversation';
import systemStore from '@/stores/system';
import { useSnapshot } from 'valtio';
const { conversationState } = conversationStore;
const { systemState } = systemStore;
import LogitBias from '@/components/parameter/components/logitBias';
import SlideList from '@/components/parameter/components/slideList';
import ModifyString from '@/components/chat/components/modifyString';
import { SelectOutlined, DragOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { graphState } from '@/stores/graph';
import { useState } from 'react';
export default ({ closeAllDreaw }: any) => {

    const [selectValue, setSelectValue] = useState('select')

    const jumpToEditor = () => {
        upOrLeftState.upOrLeft = true;
        // upOrLeftState.lastLocation.push('/editor')
        history.goBack();
        closeAllDreaw();
    };

    const LogicbitsHoverContent = () => {
        return (
            <div className={styles.logitsContainer}>
                <LogitBias></LogitBias>
            </div>
        );
    };

    const SlideListHoverContent = () => {
        return (
            <div className={styles.slideContainer}>
                <SlideList></SlideList>
            </div>
        );
    };
    const ModifyHoverContent = () => {
        return (
            <div  className={` tableContainer ${styles.modifyContainer}`}>
                <ModifyString></ModifyString>
            </div>
        );
    };

    const PromptListHoverContent = () => {
        let systemMessage = useSnapshot(systemState.message);
        let conversationMessage = useSnapshot(conversationState.message);

        systemMessage = systemMessage.map((item: any) => {
            if (item.children[0].text.trim().length != 0) {
                return { role: item.role, content: item.children[0].text };
            }
        });
        conversationMessage = conversationMessage.map((item: any) => {
            if (item.children[0].text.trim().length != 0) {
                return { role: item.role, content: item.children[0].text };
            }
        });

        const promptInfo = [...systemMessage, ...conversationMessage].filter(
            Boolean,
        );

        return (
            <div className={styles.promptsContainer}>
                <div className={styles.hoverCatageTitle}>Prompts</div>
                {promptInfo.length > 0 &&
                    promptInfo.map((item: any, index: number) => {
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

    const changeSelect = (val: string) => {
        if (val == 'panning') {
            graphState.graph.disableSelection()
            graphState.graph.enablePanning()
        } else {
            graphState.graph.enableSelection()
            graphState.graph.disablePanning()
        }
        setSelectValue(val)

    }


    const playTest = () => {
        graphState.playTest()
    }

    return (
        <div className={styles.graphHeader}>
            <Space>
                <Button
                    onClick={jumpToEditor}
                    style={{}}
                    type="primary"
                    shape="circle"
                    icon={<ArrowUpOutlined />}
                ></Button>
                <Divider type="vertical" />
                <Button type="primary" onClick={playTest}  >Test</Button>
                <Divider type="vertical" />
                <Popover content={PromptListHoverContent}>
                    <Popover content={PromptListHoverContent} trigger="click">
                        <Button> Prompts </Button>
                    </Popover>
                </Popover>
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
                        <Button> Parameters </Button>
                    </Popover>
                </Popover>
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
                        <Button> Logic Bits </Button>
                    </Popover>
                </Popover>
                <Popover
                    overlayStyle={{ padding: 0 }}
                    overlayInnerStyle={{ padding: 0, overflow: 'hidden' }}
                    content={ModifyHoverContent}
                >
                    <Popover
                        overlayStyle={{ padding: 0 }}
                        overlayInnerStyle={{ padding: 0, overflow: 'hidden' }}
                        content={ModifyHoverContent}
                        trigger="click"
                    >
                        <Button> Modify </Button>
                    </Popover>
                </Popover>

                {/* <Button type="primary" onClick={playTest} icon={<PlayCircleOutlined />} >Test</Button> */}
                {/* <Button type="primary"  icon={<PauseCircleOutlined />} >Test</Button> */}
                <Divider type="vertical" />
                <Segmented
                    value={selectValue}
                    onChange={changeSelect}
                    options={[
                        {
                            value: 'select',
                            icon: <SelectOutlined />
                        },
                        {
                            value: 'panning',
                            icon: <DragOutlined />
                        },
                    ]}
                />
            </Space>
        </div>
    );
};
