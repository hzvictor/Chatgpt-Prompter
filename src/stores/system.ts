import { proxy, subscribe } from 'valtio';
import { makeNodeId } from '../utils/withNodeId';
import { multProxyWithPersist } from '@/utils/persistence';

const systemState = multProxyWithPersist(
  {
    message: [
      {
        id: makeNodeId(),
        role: 'system',
        children: [
          {
            text: 'you are chinese teacher',
          },
        ],
      },
    ],
  },
  {
    nanoid: 'systemId',
    dbName: 'systems',
  },
);

const updateSystemMessage = (newValue: any) => {
  systemState.message = newValue;
};

const Store = {
  systemState,
  updateSystemMessage,
};

export default Store;
