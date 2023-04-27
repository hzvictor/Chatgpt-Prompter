import { proxy, subscribe } from 'valtio';
import { newProxyWithPersist } from '@/utils/persistence';

const modifyState = newProxyWithPersist(
  {
    list: [
      {
        key: '1',
        prefix: 'translate',
        suffix: '为英语',
      },
    ],
  },
  {
    // type: 'localStorage',
    dbName: 'modifys',
  },
);

const Store = {
  modifyState,
};

export default Store;
