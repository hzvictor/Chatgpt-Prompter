import Dexie from 'dexie';
export const chatbox: any = new Dexie('chatboxDB');
// id 2
chatbox.version(38).stores({
  bots: 'nanoid, name,lastData, lastMessage, quickReplies,botPromptFunction, firstTimeEntryTree,avatar,strategyId,strategy,history,prompt,modify,functionmap,historyStorage,historyFunction, quickRepliesFunctionTree, userFunctionTree,botFunctionTree',
  messageHistorys: 'nanoid, fatherid, list',
});
