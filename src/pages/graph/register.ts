import { graphState } from '@/stores/graph';
import { register } from "@antv/x6-react-shape";
import MessageIndex from './components/customizeNode/trigger/messageIndex'
import ShortcutStatement from './components/customizeNode/trigger/shortcutStatement'
import MatchString from './components/customizeNode/trigger/matchString';
import StringLength from './components/customizeNode/trigger/stringLength';
import SendString from './components/customizeNode/handler/sendString';
import SendPicture from './components/customizeNode/handler/sendPicture';
import StopGenerate from './components/customizeNode/handler/stopGenerate';
import ResetHistory from './components/customizeNode/handler/resetHistory';
import ClearHistory from './components/customizeNode/handler/clearHistory';
import ReplaceString from './components/customizeNode/handler/replaceString';
import ReplacePrompt from './components/customizeNode/handler/replacePrompt';
import ReplaceModify from './components/customizeNode/handler/replaceModify';
const ports = {
    groups: {
        top: {
            position: 'top',
            attrs: {
                circle: {
                    r: 6,
                    magnet: true,
                    stroke: '#00aa90',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
        right: {
            position: 'right',
            attrs: {
                circle: {
                    r: 6,
                    magnet: true,
                    stroke: '#00aa90',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
        bottom: {
            position: 'bottom',
            attrs: {
                circle: {
                    r: 6,
                    magnet: true,
                    stroke: '#00aa90',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
        left: {
            position: 'left',
            attrs: {
                circle: {
                    r: 6,
                    magnet: true,
                    stroke: '#00aa90',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
    },
    items: [
        {
            group: 'top',
        },
        // {
        //     group: 'right',
        // },
        {
            group: 'bottom',
        },
        // {
        //     group: 'left',
        // },
    ],
};

export default (Graph: any) => {
    register({
        shape: "replace-prompt-node",
        width: 160,
        height: 55,
        effect: ["data"],
        component: ReplacePrompt,
        ports: { ...ports },
    });
    register({
        shape: "replace-modify-node",
        width: 160,
        height: 55,
        effect: ["data"],
        component: ReplaceModify,
        ports: { ...ports },
    });
    register({
        shape: "replace-string-node",
        width: 160,
        height: 55,
        effect: ["data"],
        component: ReplaceString,
        ports: { ...ports },
    });
    register({
        shape: "send-picture-node",
        width: 160,
        height: 55,
        effect: ["data"],
        component: SendPicture,
        ports: { ...ports },
    });
    register({
        shape: "stop-genurate-node",
        width: 160,
        height: 55,
        effect: ["data"],
        component: StopGenerate,
        ports: { ...ports },
    });
    register({
        shape: "reset-history-node",
        width: 160,
        height: 55,
        effect: ["data"],
        component: ResetHistory,
        ports: { ...ports },
    });
    register({
        shape: "clear-history-node",
        width: 160,
        height: 55,
        effect: ["data"],
        component: ClearHistory,
        ports: { ...ports },
    });
    register({
        shape: "send-message-node",
        width: 160,
        height: 55,
        effect: ["data"],
        component: SendString,
        ports: { ...ports },
    });
    register({
        shape: "message-index-node",
        width: 160,
        height: 55,
        effect: ["data"],
        component: MessageIndex,
        ports: { ...ports },
    });
    register({
        shape: "string-length-node",
        width: 160,
        height: 55,
        effect: ["data"],
        component: StringLength,
        ports: { ...ports },
    });

    register({
        shape: "match-string-node",
        width: 160,
        height: 55,
        effect: ["data"],
        component: MatchString,
        ports: { ...ports },
    });
    register({
        shape: "shortcut-statement-node",
        width: 160,
        height: 55,
        effect: ["data"],
        component: ShortcutStatement,
        ports: { ...ports },
    });

    Graph.registerNode(
        'main-function',
        {
            inherit: 'rect',
            width: 160,
            height: 55,
            attrs: {
                body: {
                    strokeWidth: 1,
                    stroke: '#00aa90',
                    fill: '#EFF4FF',
                    rx: 25,
                    ry: 25,
                },
                text: {
                    fontSize: 14,
                    fill: '#00aa90',
                },
            },
            ports: {
                ...ports
            },
        },
        true,
    );

    Graph.registerNode(
        'main-function-trigger',
        {
            inherit: 'rect',
            width: 160,
            height: 55,
            attrs: {
                body: {
                    strokeWidth: 1,
                    stroke: '#00aa90',
                    fill: '#EFF4FF',
                    rx: 25,
                    ry: 25,
                },
                text: {
                    fontSize: 14,
                    fill: '#00aa90',
                },
            },
            ports: {
                ...ports
            },
            tools: ['node-editor',
                {
                    name: 'button',
                    args: {
                        markup: [
                            {
                                tagName: 'circle',
                                selector: 'button',
                                attrs: {
                                    r: 12,
                                    stroke: '#00aa90',
                                    'stroke-width': 3,
                                    fill: 'white',
                                    cursor: 'pointer',
                                },
                            },
                            {
                                tagName: 'text',
                                textContent: 'Edit',
                                selector: 'icon',
                                attrs: {
                                    fill: '#00aa90',
                                    'font-size': 8,
                                    'text-anchor': 'middle',
                                    'pointer-events': 'none',
                                    y: '0.3em',
                                },
                            },
                        ],
                        x: '100%',
                        y: '100%',
                        offset: { x: -20, y: -20 },
                        onClick({ view }: any) {
                            graphState.showDefaultCode(view.cell.id, 'trigger',);
                        },
                    },
                },
            ],
        },
        true,
    );

    Graph.registerNode(
        'function-replace-prompt',
        {
            inherit: 'rect',
            width: 160,
            height: 55,
            attrs: {
                body: {
                    strokeWidth: 1,
                    stroke: '#5F95FF',
                    fill: '#EFF4FF',
                    rx: 5,
                    ry: 5,
                },
                text: {
                    fontSize: 14,
                    fill: '#5F95FF',
                },
            },
            ports: {
                ...ports
            },
            tools: ['node-editor',
                {
                    name: 'button',
                    args: {
                        markup: [
                            {
                                tagName: 'circle',
                                selector: 'button',
                                attrs: {
                                    r: 12,
                                    stroke: '#5F95FF',
                                    'stroke-width': 3,
                                    fill: 'white',
                                    cursor: 'pointer',
                                },
                            },
                            {
                                tagName: 'text',
                                textContent: 'Edit',
                                selector: 'icon',
                                attrs: {
                                    fill: '#5F95FF',
                                    'font-size': 8,
                                    'text-anchor': 'middle',
                                    'pointer-events': 'none',
                                    y: '0.3em',
                                },
                            },
                        ],
                        x: '100%',
                        y: '100%',
                        offset: { x: -20, y: -20 },
                        onClick({ view }: any) {
                            graphState.showDefaultCode(view.cell.id, 'prompt');
                        },
                    },
                },
            ],
        },
        true,
    );
    Graph.registerNode(
        'function-replace-modify',
        {
            inherit: 'rect',
            width: 160,
            height: 55,
            attrs: {
                body: {
                    strokeWidth: 1,
                    stroke: '#5F95FF',
                    fill: '#EFF4FF',
                    rx: 5,
                    ry: 5,
                },
                text: {
                    fontSize: 14,
                    fill: '#5F95FF',
                },
            },
            ports: {
                ...ports
            },
            tools: ['node-editor',
                {
                    name: 'button',
                    args: {
                        markup: [
                            {
                                tagName: 'circle',
                                selector: 'button',
                                attrs: {
                                    r: 12,
                                    stroke: '#5F95FF',
                                    'stroke-width': 3,
                                    fill: 'white',
                                    cursor: 'pointer',
                                },
                            },
                            {
                                tagName: 'text',
                                textContent: 'Edit',
                                selector: 'icon',
                                attrs: {
                                    fill: '#5F95FF',
                                    'font-size': 8,
                                    'text-anchor': 'middle',
                                    'pointer-events': 'none',
                                    y: '0.3em',
                                },
                            },
                        ],
                        x: '100%',
                        y: '100%',
                        offset: { x: -20, y: -20 },
                        onClick({ view }: any) {
                            graphState.showDefaultCode(view.cell.id, 'modify');
                        },
                    },
                },
            ],
        },
        true,
    );
    Graph.registerNode(
        'function-replace-message',
        {
            inherit: 'rect',
            width: 160,
            height: 55,
            attrs: {
                body: {
                    strokeWidth: 1,
                    stroke: '#5F95FF',
                    fill: '#EFF4FF',
                    rx: 5,
                    ry: 5,
                },
                text: {
                    fontSize: 14,
                    fill: '#5F95FF',
                },
            },
            ports: {
                ...ports
            },
            tools: ['node-editor',
                {
                    name: 'button',
                    args: {
                        markup: [
                            {
                                tagName: 'circle',
                                selector: 'button',
                                attrs: {
                                    r: 12,
                                    stroke: '#5F95FF',
                                    'stroke-width': 3,
                                    fill: 'white',
                                    cursor: 'pointer',
                                },
                            },
                            {
                                tagName: 'text',
                                textContent: 'Edit',
                                selector: 'icon',
                                attrs: {
                                    fill: '#5F95FF',
                                    'font-size': 8,
                                    'text-anchor': 'middle',
                                    'pointer-events': 'none',
                                    y: '0.3em',
                                },
                            },
                        ],
                        x: '100%',
                        y: '100%',
                        offset: { x: -20, y: -20 },
                        onClick({ view }: any) {
                            graphState.showDefaultCode(view.cell.id, 'replaceMessage');
                        },
                    },
                },
            ],
        },
        true,
    );

    Graph.registerNode(
        'function-send-message',
        {
            inherit: 'rect',
            width: 160,
            height: 55,
            attrs: {
                body: {
                    strokeWidth: 1,
                    stroke: '#5F95FF',
                    fill: '#EFF4FF',
                    rx: 5,
                    ry: 5,
                },
                text: {
                    fontSize: 14,
                    fill: '#5F95FF',
                },
            },
            ports: {
                ...ports
            },
            tools: ['node-editor',
                {
                    name: 'button',
                    args: {
                        markup: [
                            {
                                tagName: 'circle',
                                selector: 'button',
                                attrs: {
                                    r: 12,
                                    stroke: '#5F95FF',
                                    'stroke-width': 3,
                                    fill: 'white',
                                    cursor: 'pointer',
                                },
                            },
                            {
                                tagName: 'text',
                                textContent: 'Edit',
                                selector: 'icon',
                                attrs: {
                                    fill: '#5F95FF',
                                    'font-size': 8,
                                    'text-anchor': 'middle',
                                    'pointer-events': 'none',
                                    y: '0.3em',
                                },
                            },
                        ],
                        x: '100%',
                        y: '100%',
                        offset: { x: -20, y: -20 },
                        onClick({ view }: any) {
                            graphState.showDefaultCode(view.cell.id, 'sendMessage');
                        },
                    },
                },
            ],
        },
        true,
    );

    Graph.registerNode(
        'replace-history-strategy',
        {
            inherit: 'rect',
            width: 160,
            height: 55,
            attrs: {
                body: {
                    strokeWidth: 1,
                    stroke: '#5F95FF',
                    fill: '#EFF4FF',
                    rx: 5,
                    ry: 5,
                },
                text: {
                    fontSize: 14,
                    fill: '#5F95FF',
                },
            },
            ports: {
                ...ports
            },
            tools: ['node-editor',
                {
                    name: 'button',
                    args: {
                        markup: [
                            {
                                tagName: 'circle',
                                selector: 'button',
                                attrs: {
                                    r: 12,
                                    stroke: '#5F95FF',
                                    'stroke-width': 3,
                                    fill: 'white',
                                    cursor: 'pointer',
                                },
                            },
                            {
                                tagName: 'text',
                                textContent: 'Edit',
                                selector: 'icon',
                                attrs: {
                                    fill: '#5F95FF',
                                    'font-size': 8,
                                    'text-anchor': 'middle',
                                    'pointer-events': 'none',
                                    y: '0.3em',
                                },
                            },
                        ],
                        x: '100%',
                        y: '100%',
                        offset: { x: -20, y: -20 },
                        onClick({ view }: any) {
                            graphState.showDefaultCode(view.cell.id, 'history');
                        },
                    },
                },
            ],
        },
        true,
    );

    Graph.registerNode(
        'main-rect',
        {
            inherit: 'rect',
            width: 160,
            height: 55,
            attrs: {
                body: {
                    strokeWidth: 1,
                    stroke: '#00aa90',
                    fill: '#EFF4FF',
                    rx: 25,
                    ry: 25,
                },
                text: {
                    fontSize: 15,
                    fill: '#262626',
                },
            },
            data: {
                disableSelect: false,
            },
            ports: { ...ports },
        },
        true,
    );

    return Graph;
};
