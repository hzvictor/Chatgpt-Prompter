import styles from './index.less';
import React, { useRef, useState } from 'react';
import { Button, Modal, InputNumber } from 'antd';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
import { graphState, dreawerState } from '@/stores/graph';


export default (props: any) => {


    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
    const draggleRef = useRef<HTMLDivElement>(null);




    const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
        const { clientWidth, clientHeight } = window.document.documentElement;
        const targetRect = draggleRef.current?.getBoundingClientRect();
        if (!targetRect) {
            return;
        }
        setBounds({
            left: -targetRect.left + uiData.x,
            right: clientWidth - (targetRect.right - uiData.x),
            top: -targetRect.top + uiData.y,
            bottom: clientHeight - (targetRect.bottom - uiData.y),
        });
    };

    return (<Modal
        style={{
            cursor: 'move',
        }}
        {...props}
        className={styles.modelStyle}
        modalRender={(modal) => (
            <Draggable
                bounds={bounds}
                onStart={(event, uiData) => onStart(event, uiData)}
            >
                <div ref={draggleRef}>{modal}</div>
            </Draggable>
        )
        }
    >
        {props.children}
    </Modal>)
}