import { proxy, subscribe } from 'valtio';
import { proxyWithoutLocal } from '@/utils/persistence';

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
