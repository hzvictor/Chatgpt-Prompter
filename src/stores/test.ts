import { proxy, subscribe } from 'valtio';
import { makeNodeId } from '../utils/withNodeId';
import { multProxyWithPersist } from '@/utils/persistence';

const testState = multProxyWithPersist(
  {
    message: [
      {
        id: makeNodeId(),
        role: 'test',
        children: [
          {
            text: '',
          },
        ],
      },
    ],
    isAsync: false,
  },
  {
    dbName: 'tests',
    nanoid: 'testId',
  },
);

const updateTestMessage = (newValue: any) => {
  testState.message = newValue;
};

const Store = {
  testState,

  updateTestMessage,
};

export default Store;
