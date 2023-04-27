import { proxy, subscribe } from 'valtio';

import { proxyWithPersistEasy } from '@/utils/persistence';

const graphPoint: any = null;
const dndPoint: any = null;
const showDefaultCodePoint: any = null;
const updataModelPoint: any = null;
const playTestPoint: any = null;
const pauseTestPoint: any = null;

export const graphState = {
    graph: graphPoint,
    dnd: dndPoint,
    showDefaultCode: showDefaultCodePoint,
    updataModel: updataModelPoint,
    playTest:playTestPoint,
    pauseTest:pauseTestPoint,
};

export const dreawerState = proxyWithPersistEasy(
    {
        openLeft: true,
        openRight: false,
        openCode: false,
    },
    {
        key: 'dreawerState',
    },
);
