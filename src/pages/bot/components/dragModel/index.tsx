import styles from './index.less';
import React, { useRef, useState } from 'react';
import { Button, Modal,InputNumber } from 'antd';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
import { graphState, dreawerState } from '@/stores/graph';


export default () => {

    const [open, setOpen] = useState(false);
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
    const draggleRef = useRef<HTMLDivElement>(null);
    const [ title, setTitle ] = useState('Model')
    const [ val, setVal ] = useState()
    const [ cellSelf, setCellSelf] = useState({})
    const showModal = () => {
        setOpen(true);
    };

    graphState.updataModel = (cell: any) => {
        setCellSelf(cell)
        setVal(cell.getData().index)
        setTitle(cell.label)
        showModal()
    }

    const handleOk = (e: React.MouseEvent<HTMLElement>) => {
        
        setOpen(false);
    };

    const handleCancel = (e: React.MouseEvent<HTMLElement>) => {
        
        setOpen(false);
    };

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

    const changval = (val:any) => {
        // setVal(val)
        // const {items } = cellSelf.getProp("tools");
        // console.log(items,88888888)
        // items[1].args.markup[1].textContent = String(val)
        // console.log(items)
        // cellSelf.setProp({
        //     data:{
        //         index:val,
        //         type:cellSelf.getData().type
        //     },
        //     tools:{items}
        // })

        // cellSelf.setAttrs()
    }
    return (<Modal
        title={title}
        style={{
            cursor: 'move',
        }}
        className={styles.modelStyle}
        open={open}
        width={100}
        mask={false}
        destroyOnClose={true}
        onOk={handleOk}
        footer={null}
        onCancel={handleCancel}
        modalRender={(modal) => (
            <Draggable
                bounds={bounds}
                onStart={(event, uiData) => onStart(event, uiData)}
            >
                <div ref={draggleRef}>{modal}</div>
            </Draggable>
        )}
    >
        <InputNumber value={val} onChange={changval} style={{ width: "80px" }} />
    </Modal>)
}