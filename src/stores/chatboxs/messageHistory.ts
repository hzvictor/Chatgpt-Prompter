import { proxy, subscribe } from 'valtio';
import { proxyWithoutLocal } from '@/utils/persistenceChatbox';

const messageHistoryState = proxyWithoutLocal(
  {
    list: [
    ],
  },
  {
    dbName: 'messageHistorys',
  },
);

const Store = {
  messageHistoryState,
};

export default Store;
