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

import { SelectOutlined, DragOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
export default ({ clearAllInterval , graph}: any) => {

    const [selectValue, setSelectValue] = useState('select')

    const jumpToEditor = () => {
        upOrLeftState.upOrLeft = true;
        // upOrLeftState.lastLocation.push('/editor')
        history.goBack();
        clearAllInterval();
    };




    const changeSelect = (val: string) => {
        if (val == 'panning') {
            graph.disableSelection()
            graph.enablePanning()
        } else {
            graph.enableSelection()
            graph.disablePanning()
        }
        setSelectValue(val)

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
                <Button type="primary"  >Test</Button>
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
