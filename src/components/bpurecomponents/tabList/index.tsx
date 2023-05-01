import React, { useEffect, useRef, useState } from 'react';
import { Tabs, Input } from 'antd';
import styles from './index.less';
type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

const initialItems = [
    { label: 'Tab 1', key: '1' },
];

const App: React.FC = ({
    allitem,
    activeItem,
    addNewTab,
    changeTab,
    removeTab,
    saveTab,
    changeTabName
}: any) => {


    const [activeKey, setActiveKey] = useState('');
    const [items, setItems] = useState([]);

    useEffect(() => {
        setActiveKey(activeItem.nanoid)
        setItems(allitem.map((item: any) => {
            return {
                label: (
                    <span
                        className={styles.tabLab}
                        onClick={(e) => {
                            handleClick(e, item.nanoid);
                        }}
                    >
                        {`${item.name}`}
                    </span>
                ),
                key: item.nanoid
            }
        }))
    }, [allitem, activeItem])


    const handleClick = (event: any, key: string) => {
        if (event.detail === 2) {
            const newNewPanes = allitem.map((item: any) => {
                return {
                    label:
                        item.nanoid == key ? (
                            <Input
                                value={item.name}
                                style={{ minWidth: '80px' }}
                                onChange={(e) => {
                                    onChangeInputValue(e, item.nanoid);
                                }}
                            ></Input>
                        ) : (
                            <span
                                className={styles.tabLab}
                                onClick={(e) => {
                                    handleClick(e, item.nanoid);
                                }}
                            >
                                {item.name}
                            </span>
                        ),
                    key: item.nanoid
                };
            });
            setItems(newNewPanes);
        }
    };



    const onChangeInputValue = (event: any, key: any) => {
        changeTabName( event.target.value )

        const newNewPanes = allitem.map((item: any) => {
            return {
                label:
                    item.nanoid == key ? (
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
                                onChangeInputValue(e, item.nanoid);
                            }}
                        ></Input>
                    ) : (
                        <span
                            className={styles.tabLab}
                            onClick={(e) => {
                                handleClick(e, item.nanoid);
                            }}
                        >
                            {item.name}
                        </span>
                    ),
                key: item.nanoid
            };
        });
        
        // change Store State

        setItems(newNewPanes);
    };


    const save = () => {
        const newNewPanes = allitem.map((item: any) => {
            return {
                label: (
                    <span
                        className={styles.tabLab}
                        onClick={(e) => {
                            handleClick(e, item.nanoid);
                        }}
                    >
                        {item.name}
                    </span>
                ),
                key: item.nanoid,
            };
        });


        setItems(newNewPanes);
        saveTab()
    };


    const onChange = (newActiveKey: string) => {
        setActiveKey(newActiveKey)
        changeTab(newActiveKey);
    };

    const add = () => {
        addNewTab();
    };



    const remove = (targetKey: TargetKey) => {
        let newActiveKey = activeKey;
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
        removeTab(targetKey, newActiveKey);
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
            onChange={onChange}
            activeKey={activeKey}
            onEdit={onEdit}
            items={items}
        />
    );
};

export default App;