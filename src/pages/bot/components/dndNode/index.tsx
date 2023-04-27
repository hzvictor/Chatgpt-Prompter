import { graphState } from '@/stores/graph';
import styles from './index.less';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Dnd } from '@antv/x6-plugin-dnd';
import { Stencil } from '@antv/x6-plugin-stencil';
import { tabData } from '@/stores/tablist'
import { Space } from 'antd';
import './index.css';
const commonAttrs = {
    body: {
        fill: '#fff',
        stroke: '#8f8f8f',
        strokeWidth: 1,
    },
};

export default () => {
    const dndContainerRef: any = useRef(null);
    const graph = graphState.graph;

    const stencil = new Stencil({
        title: 'Components',
        target: graph,
        search(cell, keyword) {
            return cell.shape.indexOf(keyword) !== -1;
        },
        stencilGraphWidth: 378,
        stencilGraphHeight: 300,
        // collapsable: true,
        groups: [
            {
                title: 'Trigger',
                name: 'trigger',
                collapsable: false,
                graphHeight: 250,
            },
            {
                title: 'Send',
                name: 'send',
                graphHeight: 160,
                collapsable: false
            },
            {
                title: 'Replace',
                name: 'replace',
                collapsable: false,
                graphHeight: 239,
            },
            {
                title: 'History',
                name: 'history',
                graphHeight: 160,
                collapsable: false
            },
        ],
        layoutOptions: {
            columns: 2,
            columnWidth: 170,
            rowHeight: 70,
        },
    });



    useEffect(() => {

        const r3 = graph.createNode({
            shape: 'main-function-trigger',
            label: 'Trigger Func',
            ports: {
                items: [
                    {
                        group: 'top',
                    },
                    {
                        group: 'bottom',
                        attrs: {
                            circle: {
                                magnet: true,
                                stroke: '#096148',
                                fill: '#096148',
                                r: 6,
                            },

                        },
                        data: {
                            bol: true
                        }
                    },
                    {
                        group: 'bottom',
                        attrs: {
                            circle: {
                                magnet: true,
                                stroke: '#AB3B3A',
                                fill: '#AB3B3A',
                                r: 6,
                            },
                        },
                        data: {
                            bol: false
                        }
                    },
                ],
            },
        });

        const r1 = graph.createNode({
            shape: 'message-index-node',
            data: {
                index: 0,
                formula: 'equal',
                role: 'all'
            }
        });

        const r6 = graph.createNode({
            shape: 'match-string-node',
            data: {
                string: '',
                formula: 'contains'
            }
        });

        const r7 = graph.createNode({
            shape: 'string-length-node',
            data: {
                length: 0,
                formula: 'equal'
            }
        });
        const r9 = graph.createNode({
            shape: 'shortcut-statement-node',
            data: {
                name: 'hello',
                icon: 'message',
                isNew: false,
                isHighlight: false,
            }
        });

        stencil.load([r1, r6, r3, r7, r9], 'trigger');
        const r13 = graph.createNode({
            shape: 'send-picture-node',
            data: {
                fileList: [

                ]
            }
        });
        const r12 = graph.createNode({
            shape: 'send-message-node',
            data: {
                string: 'hello'
            }
        });

        const r99 = graph.createNode({
            shape: 'function-send-message',
            label: 'Message Func'
        });

        const r19 = graph.createNode({
            shape: 'stop-genurate-node',
            // data: {
            //     string: 'hello'
            // }
        });
        stencil.load([r13, r12, r99, r19], 'send');

        const r15 = graph.createNode({
            shape: 'replace-string-node',
            data: {
                string: 'hello',
                replace: 'world'
            }
        });
        const r16 = graph.createNode({
            shape: 'replace-prompt-node',
            data: {

            }
        });
        const r17 = graph.createNode({
            shape: 'replace-modify-node',
            data: {
                modify: {
                    prefix: "",
                    suffix: ""
                }
            }
        });

        const r11 = graph.createNode({
            shape: 'function-replace-message',
            label: 'Message Func'
        });

        const r20 = graph.createNode({
            shape: 'function-replace-modify',
            label: 'Modify Func'
        });
        const r21 = graph.createNode({
            shape: 'function-replace-prompt',
            label: 'Prompt Func'
        });

        stencil.load([r15, r16, r17, r11, r20, r21], 'replace');


        const r33 = graph.createNode({
            shape: 'clear-history-node',
        });
        const r36 = graph.createNode({
            shape: 'reset-history-node',
        });
        const r35 = graph.createNode({
            shape: 'replace-history-strategy',
            label: 'Change History Func'
        });

        stencil.load([r36,r33, r35], 'history');
        dndContainerRef.current.appendChild(stencil.container);
    }, [dndContainerRef]);

    return (
        <div className="dnd-wrap" ref={dndContainerRef}>
        </div>
    );
};
