import { proxy, subscribe } from 'valtio';
import { makeNodeId } from '../utils/withNodeId';
import { multProxyWithPersist } from '@/utils/persistence';

const conversationState = multProxyWithPersist(
  {
    message: [
      {
        id: makeNodeId(),
        role: 'user',
        children: [
          {
            text: 'teach me use lanuage',
          },
        ],
      },
      {
        id: makeNodeId(),
        role: 'assistant',
        children: [
          {
            text: '',
          },
        ],
      },
    ],
  },
  {
    nanoid: 'conversationId',
    dbName: 'conversations',
  },
);

const updateConversationMessage = (newValue: any) => {
  conversationState.message = newValue;
};

const Store = {
  conversationState,
  //   conversationWithRoleState,
  //   genurateConversationMessageRole,
  updateConversationMessage,
};

export default Store;
