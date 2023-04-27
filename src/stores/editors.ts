import { proxy, subscribe } from 'valtio';
import { proxyWithPersistEasy } from '@/utils/persistence';
const emptySystem: any = {};
const emptyConversation: any = {};
const emptyTest: any = {};

export const editors = {
  system: emptySystem,
  conversation: emptyConversation,
  test: emptyTest,
};

export const editorLayout = proxyWithPersistEasy(
  {
    layout: [
      {
        w: 13,
        h: 24,
        x: 5,
        y: 0,
        i: 'conversation',
        moved: false,
        static: false,
      },
      { w: 5, h: 8, x: 0, y: 2, i: 'system', moved: false, static: false },
      { w: 6, h: 19, x: 18, y: 0, i: 'chat', moved: false, static: false },
      { w: 5, h: 9, x: 0, y: 10, i: 'slideList', moved: false, static: false },
      { w: 5, h: 11, x: 0, y: 19, i: 'logitBias', moved: false, static: false },
      { w: 5, h: 2, x: 0, y: 0, i: 'manager', moved: false, static: false },
      { w: 13, h: 6, x: 5, y: 24, i: 'logs', moved: false, static: false },
      { w: 6, h: 11, x: 18, y: 19, i: 'test', moved: false, static: false },
    ],
  },
  {
    key: 'prompter-editor-layout',
  },
);
