import styles from './index.less'
import { Input, Row, Col, Select, ConfigProvider } from 'antd';
import DragModel from '@/components/apureComponents/dragModel';
import React, { useRef, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';

export default ({ node }: any) => {


    return <div className={styles.nodeContainer} >
        <div className={styles.nodeTitle} >
            Stop Genurate
        </div>
    </div>
}