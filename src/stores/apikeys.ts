import { proxy, subscribe } from 'valtio';

import { proxyWithPersistEasy } from '@/utils/persistence';


export const apikeysState = proxyWithPersistEasy(
    {
        keys: [],
        currentuse:'',
        isUseServer:false
    },
    {
        key: 'apikeys',
    },
);
