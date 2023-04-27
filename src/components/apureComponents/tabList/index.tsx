import React, { useRef, useEffect, useState } from 'react';
import { Tabs, Input } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { makeNodeId } from '@/utils/withNodeId';
import {tabData, slideListTabList, activeTabListId } from '@/stores/tablist';
import './index.css';
import styles from './index.less';
import { useSnapshot } from 'valtio';
type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { css } from '@emotion/css';
import { activeProject } from '@/stores/project';

interface DraggableTabPaneProps extends React.HTMLAttributes<HTMLDivElement> {
    'data-node-key': string;
    onActiveBarTransform: (className: string) => void;
}

const DraggableTabNode = ({
    className,
    onActiveBarTransform,
    ...props
}: DraggableTabPaneProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isSorting,
    } = useSortable({
        id: props['data-node-key'],
    });

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'move',
    };

    useEffect(() => {
        if (!isSorting) {
            onActiveBarTransform('');
        } else if (className?.includes('ant-tabs-tab-active')) {
            onActiveBarTransform(
                css`
          .ant-tabs-ink-bar {
            transform: ${CSS.Transform.toString(transform)};
            transition: ${transition} !important;
          }
        `,
            );
        }
    }, [className, isSorting, transform]);

    return React.cloneElement(props.children as React.ReactElement, {
        ref: setNodeRef,
        style,
        ...attributes,
        ...listeners,
    });
};

export default ({
    defaultName,
    activeKeyName,
    addNewTab,
    changeTab,
    removeTab,
}: any) => {
    // const handleClick = (event: any, key: string) => {
    //     if (event.detail === 2) {
    //         console.log('double click', key, items);
    //     }
    // };

    const [className, setClassName] = useState('');
    const sensor = useSensor(PointerSensor, {
        activationConstraint: { distance: 10 },
    });
    const onDragEnd = ({ active, over }: DragEndEvent) => {
        if (active.id !== over?.id) {
            setItems((prev) => {
                const activeIndex = prev.findIndex((i) => i.key === active.id);
                const overIndex = prev.findIndex((i) => i.key === over?.id);

                [tabListData[activeIndex], tabListData[overIndex]] = [
                    tabListData[overIndex],
                    tabListData[activeIndex],
                ];

                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };
    // const [activeKey, setActiveKey] = useState(initialItems[0].key);
    const tabListData = tabData.slideListTabList[activeKeyName];
    const alltabData = useSnapshot(tabData);


    const [items, setItems] = useState(
        tabListData.map((item: any) => {
            return {
                label: item.isEdite ? (
                    <Input
                        style={{ minWidth: '80px' }}
                        value={item.label}
                        onBlur={() => {
                            save();
                        }}
                        onPressEnter={() => {
                            save();
                        }}
                        onChange={(e) => {
                            onChangeInputValue(e, item.key);
                        }}
                    ></Input>
                ) : (
                    <span
                        className={styles.tabLab}
                        onClick={(e) => {
                            handleClick(e, item.key);
                        }}
                    >
                        {item.label}
                    </span>
                ),
                key: item.key,
                closable: item.closable,
            };
        }),
    );

        useEffect(()=>{
            setItems(tabListData.map((item: any) => {
                return {
                    label: item.isEdite ? (
                        <Input
                            style={{ minWidth: '80px' }}
                            value={item.label}
                            onBlur={() => {
                                save();
                            }}
                            onPressEnter={() => {
                                save();
                            }}
                            onChange={(e) => {
                                onChangeInputValue(e, item.key);
                            }}
                        ></Input>
                    ) : (
                        <span
                            className={styles.tabLab}
                            onClick={(e) => {
                                handleClick(e, item.key);
                            }}
                        >
                            {item.label}
                        </span>
                    ),
                    key: item.key,
                    closable: item.closable,
                };
            }))
        },[activeProject.activeProjectID])

    const newTabIndex = useRef(0);

    const onChange = (newActiveKey: string) => {
        tabData.activeTabListId[activeKeyName] = newActiveKey;
        changeTab(newActiveKey);
    };

    const add = () => {
        const newActiveKey = makeNodeId();
        const newPanes = [...items];

        newPanes.push({
            label: (
                <span
                    className={styles.tabLab}
                    onClick={(e) => {
                        handleClick(e, newActiveKey);
                    }}
                >
                    {`${defaultName} ${items.length}`}
                </span>
            ),
            key: newActiveKey,
            closable: true,
        });
        // tabListData.push({
        //     label: `${defaultName} ${items.length}`,
        //     key: newActiveKey,
        //     isEdite: false,
        //     closable: true,
        // });
        tabData.slideListTabList[activeKeyName].push({
            label: `${defaultName} ${items.length}`,
            key: newActiveKey,
            isEdite: false,
            closable: true,
        });
        setItems(newPanes);
        tabData.activeTabListId[activeKeyName] = newActiveKey;
        addNewTab(newActiveKey);
    };

    const handleClick = (event: any, key: string) => {
        if (event.detail === 2) {
            const newNewPanes = tabListData.map((item: any) => {
                return {
                    label:
                        item.key == key ? (
                            <Input
                                value={item.label}
                                style={{ minWidth: '80px' }}
                                onChange={(e) => {
                                    onChangeInputValue(e, item.key);
                                }}
                            ></Input>
                        ) : (
                            <span
                                className={styles.tabLab}
                                onClick={(e) => {
                                    handleClick(e, item.key);
                                }}
                            >
                                {item.label}
                            </span>
                        ),
                    key: item.key,
                    closable: item.closable,
                };
            });

            const newTabListData = tabListData.map((item: any) => {
                return {
                    label: item.label,
                    isEdite: item.key == key ? true : false,
                    key: item.key,
                    closable: item.closable,
                };
            });

            // change Store State
            tabListData.splice(0, tabListData.length, ...newTabListData);

            setItems(newNewPanes);
        }
    };

    const onChangeInputValue = (event: any, key: any) => {
        const newNewPanes = tabListData.map((item: any) => {
            return {
                label:
                    item.key == key ? (
                        <Input
                            style={{ minWidth: '80px' }}
                            onBlur={() => {
                                save();
                            }}
                            onPressEnter={() => {
                                save();
                            }}
                            value={event.target.value}
                            onChange={(e) => {
                                onChangeInputValue(e, item.key);
                            }}
                        ></Input>
                    ) : (
                        <span
                            className={styles.tabLab}
                            onClick={(e) => {
                                handleClick(e, item.key);
                            }}
                        >
                            {item.label}
                        </span>
                    ),
                key: item.key,
                closable: item.closable,
            };
        });

        const newTabListData = tabListData.map((item: any) => {
            return {
                label: item.key == key ? event.target.value : item.label,
                isEdite: item.key == key ? true : false,
                key: item.key,
                closable: item.closable,
            };
        });
        // change Store State
        tabListData.splice(0, tabListData.length, ...newTabListData);

        setItems(newNewPanes);
    };

    const save = () => {
        const newNewPanes = tabListData.map((item: any) => {
            return {
                label: (
                    <span
                        className={styles.tabLab}
                        onClick={(e) => {
                            handleClick(e, item.key);
                        }}
                    >
                        {item.label}
                    </span>
                ),
                key: item.key,
                closable: item.closable,
            };
        });

        const newTabListData = tabListData.map((item: any) => {
            return {
                label: item.label,
                isEdite: false,
                key: item.key,
                closable: item.closable,
            };
        });
        // change Store State
        tabListData.splice(0, tabListData.length, ...newTabListData);

        setItems(newNewPanes);
    };

    const remove = (targetKey: TargetKey) => {
        let newActiveKey = tabData.activeTabListId[activeKeyName];
        let lastIndex = -1;
        items.forEach((item, i) => {
            if (item.key === targetKey) {
                lastIndex = i - 1;
            }
        });
        const newPanes = items.filter((item) => item.key !== targetKey);
        if (newPanes.length && newActiveKey === targetKey) {
            if (lastIndex >= 0) {
                newActiveKey = newPanes[lastIndex].key;
            } else {
                newActiveKey = newPanes[0].key;
            }
        }

        const targetIndex = items.findIndex((item) => item.key == targetKey);

        tabListData.splice(targetIndex, 1);

        setItems(newPanes);
        tabData.activeTabListId[activeKeyName] = newActiveKey;
        changeTab(newActiveKey);
        removeTab(targetKey);
    };

    const onEdit = (
        targetKey: React.MouseEvent | React.KeyboardEvent | string,
        action: 'add' | 'remove',
    ) => {
        if (action === 'add') {
            add();
        } else {
            remove(targetKey);
        }
    };

    return (
        <Tabs
            type="editable-card"
            className={className}
            onChange={onChange}
            activeKey={alltabData.activeTabListId[activeKeyName]}
            onEdit={onEdit}
            size="small"
            items={items}
            animated={false}
            onMouseDown={(e) => e.stopPropagation()}
            renderTabBar={(tabBarProps, DefaultTabBar) => (
                <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                    <SortableContext
                        items={items.map((i) => i.key)}
                        strategy={horizontalListSortingStrategy}
                    >
                        <DefaultTabBar {...tabBarProps}>
                            {(node) => (
                                <DraggableTabNode
                                    {...node.props}
                                    key={node.key}
                                    onActiveBarTransform={setClassName}
                                >
                                    {node}
                                </DraggableTabNode>
                            )}
                        </DefaultTabBar>
                    </SortableContext>
                </DndContext>
            )}
        />
    );
};
