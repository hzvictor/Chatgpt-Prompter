import { proxy, subscribe } from 'valtio';
import { proxyWithPersistEasy } from '@/utils/persistence';
export const chatLayout = proxyWithPersistEasy(
  {
    layout: [{"w":6,"h":30,"x":0,"y":0,"i":"chatlist","moved":false,"static":false},{"w":14,"h":30,"x":6,"y":0,"i":"chatbox","moved":false,"static":false},{"w":4,"h":30,"x":20,"y":0,"i":"historylist","moved":false,"static":false}],
  },
  {
    key: 'chat-layout',
  },
);
