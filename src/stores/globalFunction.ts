import { proxy, subscribe } from 'valtio';
import { proxyWithPersistEasy } from '@/utils/persistence';

export const chatFunction = proxy({
    handleSend: async (type: any, val: any, isAsyn: boolean) => { },
    assistantSend: async (type: any, val: any) => { },
    resetList:  () => { },
    startTest: async () => {},
    firstTimeEntry: async () => {},
});

const message: any = null;
export const messageFunction = proxy({
    messageApi: message,
});

export const upOrLeftState = proxyWithPersistEasy(
    {
        upOrLeft: false,
        // lastLocation: [],
    },
    {
        key: 'upOrLeftState',
    },
);
