import { Col, Row, Switch, Space, Segmented, ConfigProvider } from 'antd';
import { useSnapshot } from 'valtio';
import activeMessageStore from '@/stores/activeMessage';
import styles from './index.less';
import { useEffect, useState } from 'react';
import { activeProject } from '@/stores/project';
import conversationStore from '@/stores/conversation'

export default () => {
    const { activeMessageState } = activeMessageStore;
    const { conversationState  } = conversationStore
    const snapConversationState = useSnapshot(conversationState)
    const { activeGroupId, selectGroupIdList, activeMessageList } =
        useSnapshot(activeMessageState);
    const activeProjectSnap = useSnapshot(activeProject)
    const [colorPrimary, setColorPrimary] = useState('#00AA90');
    const [systemSwitchState, setSystemSwitchState] = useState(true);
    const [assistantSwitchState, setAssistantSwitchState] = useState(true);
    const [userSwitchState, setUserSwitchState] = useState(true);

    useEffect(()=>{
        // console.log(11111111)
        // console.log(conversationState,11111111)
        // console.log(selectGroupIdList,222222)
        selectGroupIdList.forEach((item:any,index:number)=>{
                const messageIndex =  conversationState.message.findIndex((self:any)=> item.activeId == self.id )
                if(messageIndex == -1){
                    activeMessageState.selectGroupIdList.splice(index,1)
                }
        })
    },[snapConversationState])

    useEffect(() => {
        if (selectGroupIdList.length > 0) {
            const activeItem = selectGroupIdList.filter(
                (item: any) => item.activeId == activeGroupId,
            );
            if (activeItem.length > 0) {
                setColorPrimary(activeItem[0].color);
            }
        } else {
            setColorPrimary('#00aa90');
        }
    }, [activeProjectSnap]);

    useEffect(() => {
        if (activeMessageList) {
            const selfActiveMessageList = activeMessageState.activeMessageList;
            const groupData = selfActiveMessageList[activeGroupId];
            if (groupData) {
                const groupClolorData = selfActiveMessageList[activeGroupId].clolorList;
                const groupClolorDataKeys = Object.keys(groupClolorData);
                const systemItemList: any = [];
                const userItemList: any = [];
                const assistantItemList: any = [];
                groupClolorDataKeys.map((item: any) => {
                    const groupClolorDataItem = groupClolorData[item];
                    if (groupClolorDataItem.content.trim().length != 0) {
                        if (groupClolorDataItem.role == 'user') {
                            userItemList.push(groupClolorDataItem);
                        } else if (groupClolorDataItem.role == 'system') {
                            systemItemList.push(groupClolorDataItem);
                        } else if (groupClolorDataItem.role == 'assistant') {
                            assistantItemList.push(groupClolorDataItem);
                        }
                    }
                });
                const isAllsystemItemListTrue = systemItemList.every(
                    (item: any) => item.active,
                );
                setSystemSwitchState(isAllsystemItemListTrue);
                const isAllUserItemListTrue = userItemList.every(
                    (item: any) => item.active,
                );
                setUserSwitchState(isAllUserItemListTrue);
                const isAllAssistantItemListTrue = assistantItemList.every(
                    (item: any) => item.active,
                );
                setAssistantSwitchState(isAllAssistantItemListTrue);
            }
        }
    }, [activeMessageList, activeGroupId]);

    const changActiveId = (activeGroupId: any) => {
        activeMessageState.activeGroupId = activeGroupId;
    };

    const options = selectGroupIdList.map((item: any) => {
        return {
            label: (
                <div
                    className={styles.selectCicle}
                    style={{
                        backgroundColor: item.color,
                        transform:
                            item.activeId == activeGroupId ? 'scale(.9)' : 'scale(.7)',
                    }}
                ></div>
            ),
            value: item.activeId,
        };
    });

    const changeAllItemTo = (type: string) => {
        if (type == 'user') {
            setUserSwitchState(!userSwitchState);
        } else if (type == 'system') {
            setSystemSwitchState(!systemSwitchState);
        } else if (type == 'assistant') {
            setAssistantSwitchState(!assistantSwitchState);
        }
        if (activeMessageList) {
            const selfActiveMessageList = activeMessageState.activeMessageList;
            const groupData = selfActiveMessageList[activeGroupId];
            if (groupData) {
                const groupClolorData = selfActiveMessageList[activeGroupId].clolorList;
                const groupClolorDataKeys = Object.keys(groupClolorData);
                groupClolorDataKeys.map((item: any) => {
                    const groupClolorDataItem = groupClolorData[item];
                    if (groupClolorDataItem.content.trim().length != 0) {
                        if (type == groupClolorDataItem.role) {
                            if (type == 'user') {
                                groupClolorDataItem.active = !userSwitchState;
                            } else if (type == 'system') {
                                groupClolorDataItem.active = !systemSwitchState;
                            } else if (type == 'assistant') {
                                groupClolorDataItem.active = !assistantSwitchState;
                            }
                        }
                    }
                });
            }
        }
    };

    if (selectGroupIdList.length > 0) {
        return (
            <Space onMouseDown={(e) => e.stopPropagation()}>
                <Segmented
                    value={activeGroupId}
                    onChange={changActiveId}
                    size="small"
                    options={options}
                />
                <Switch
                    size="small"
                    checkedChildren="user"
                    unCheckedChildren="user"
                    onClick={() => {
                        changeAllItemTo('user');
                    }}
                    checked={userSwitchState}
                    className={styles.colorTransion}
                    style={{
                        backgroundColor: userSwitchState
                            ? colorPrimary
                            : 'rgba(0, 0, 0, 0.25)',
                    }}
                />

                <Switch
                    size="small"
                    checkedChildren="syst"
                    unCheckedChildren="syst"
                    onClick={() => {
                        changeAllItemTo('system');
                    }}
                    checked={systemSwitchState}
                    className={styles.colorTransion}
                    style={{
                        backgroundColor: systemSwitchState
                            ? colorPrimary
                            : 'rgba(0, 0, 0, 0.25)',
                    }}
                />

                <Switch
                    size="small"
                    checkedChildren="assi"
                    unCheckedChildren="assi"
                    onClick={() => {
                        changeAllItemTo('assistant');
                    }}
                    checked={assistantSwitchState}
                    className={styles.colorTransion}
                    style={{
                        backgroundColor: assistantSwitchState
                            ? colorPrimary
                            : 'rgba(0, 0, 0, 0.25)',
                    }}
                />
            </Space>
        );
    } else {
        return <></>;
    }
};
