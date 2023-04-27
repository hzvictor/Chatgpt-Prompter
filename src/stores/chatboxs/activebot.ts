import { proxy } from 'valtio';
import { makeNodeId } from '../../utils/withNodeId';
import { newProjectDB } from '@/database/project';

import { proxyWithPersistEasy } from '@/utils/persistence'
import { db } from '@/database/root';


export const activeBot = proxyWithPersistEasy({
  activebotID: makeNodeId(),
  activeMessageID: makeNodeId(),
  globalState: 1, //  0----- new projecting and change project 1--- normal
}, {
  key: 'activeChatbox'
});


export const chatFunction = proxy({
  handleSend: async (type: any, val: any, isAsyn: boolean) => { },
  assistantSend: async (type: any, val: any) => { },
  resetList:  () => { },
  startTest: async () => {},
  resethistoryList:()=>{},
  firstTimeEntry: async () => {},
});