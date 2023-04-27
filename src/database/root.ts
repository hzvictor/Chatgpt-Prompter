import Dexie from 'dexie';
export const db: any = new Dexie('promptDB');
import {
  storeMessageHistory,
  getTargetMessageHistory,
} from '@/database/messageHistory';
import { makeNodeId } from '@/utils/withNodeId';
import { storeBot, getTargetBot } from '@/database/bot';
import { storeModifys, getTargetModifys } from '@/database/modify';
import { newProjectDB } from '@/database/project';
import {
  storeSlideLists,
  getTargetSlideLists,
  getTargetSlideListsWithFatherid,
} from '@/database/slideLists';
import {
  storeLogitBias,
  getTargetLogitBias,
  getTargetLogitBiasWithFatherid,
} from '@/database/logitBias';
import {
  storeActiveMessage,
  getTargetActiveMessage,
} from '@/database/activeMessage';
import {
  storeSystem,
  getTargetSystem,
  getTargetsyStemsWithFatherid,
} from '@/database/system';
import {
  storeTest,
  getTargetTest,
  getTargetTestsWithFatherid,
} from '@/database/tests';
import { storeTablist, getTargetTablist } from './tablist';
import {
  storeConversation,
  getTargetConversation,
  getTargetConversationsWithFatherid,
} from '@/database/conversation';

import { storeOperations, getTargetOperations } from './operation';

// id 2
db.version(37).stores({
  activeMessages: 'nanoid, activeMessageList, activeGroupId, selectGroupIdList', // Primary key and indexed props
  bots: 'nanoid, describe,name,quickReplies,botPromptFunction, firstTimeEntryTree,avatar,strategyId,strategy,history,prompt,modify,functionmap,historyStorage,historyFunction, quickRepliesFunctionTree, userFunctionTree,botFunctionTree',
  conversations: 'nanoid, fatherid,message',
  systems: 'nanoid, fatherid, message',
  messageHistorys: 'nanoid,list',
  modifys: 'nanoid,list',
  tests: 'nanoid, fatherid, message, isAsync',
  slideLists:
    'nanoid, fatherid,temperature,maximumLength,topP,frequencyPenalty,presencePenalty',
  logitBias: 'nanoid,fatherid,logitBiasArray',
  operations: 'nanoid, type, fatherid, typeid, history',
  projectDetails:
    'nanoid, name, descripe, cover, creatData, updateDate, publishDate',
  tabData: 'nanoid, activeTabListId,slideListTabList',
  graphs: 'nanoid, json',
  functions:'nanoid, lang, type, code, testData, output, expected, isPass,creatData'
});

export const addNewProgect = (
  id: string,
  projectName: string,
  description: string,
  initTabId: string,
) => {
  newProjectDB(id, projectName, description);

  storeTablist(id, {
    activeTabListId: {
      slideListId: initTabId,
      logitBiasId: initTabId,
      testId: initTabId,
      systemId: initTabId,
      conversationId: initTabId,
    },
    slideListTabList: {
      slideListId: [
        {
          label: 'Parameter',
          key: initTabId,
          isEdite: false,
          closable: false,
        },
      ],
      logitBiasId: [
        {
          label: 'Logit Bias',
          key: initTabId,
          isEdite: false,
          closable: false,
        },
      ],
      testId: [
        {
          label: 'Test',
          key: initTabId,
          isEdite: false,
          closable: false,
        },
      ],
      systemId: [
        {
          label: 'System',
          key: initTabId,
          isEdite: false,
          closable: false,
        },
      ],
      conversationId: [
        {
          label: 'Conversation',
          key: initTabId,
          isEdite: false,
          closable: false,
        },
      ],
    },
  });

  storeOperations({
    nanoid: makeNodeId(),
    type: 'conversation',
    fatherid: id,
    typeid: initTabId,
    history: '',
  });
  storeOperations({
    nanoid: makeNodeId(),
    type: 'test',
    fatherid: id,
    typeid: initTabId,
    history: '',
  });
  storeOperations({
    nanoid: makeNodeId(),
    type: 'system',
    fatherid: id,
    typeid: initTabId,
    history: '',
  });
  // db.operations.put({ nanoid: id });
  // db.operations.put({ nanoid: id });
  // db.operations.put({ nanoid: id });

  storeMessageHistory(id, { list: [] });
  storeBot(id, {
    botFunctionTree: {},
    userFunctionTree: {},
    firstTimeEntryTree: {},
    quickRepliesFunctionTree: {},
    historyFunction: {
      lang: 'javascript',
      code: ''
    },
    functionmap: {},
    modify:  { prefix: '', suffix: '' },
    prompt: {
      system: [],
      conversation: [],
      slideLists: [],
      logitBiasArray: [],
      logitBias: {},
    },
    history: [],
    strategy: 'all',
    strategyId: '',
    avatar: '',
    quickReplies: [],
    name: 'Prompter',
    describe: '...',
  });
  storeModifys(id, { list: [] });

  storeSlideLists(initTabId, {
    fatherid: id,
    temperature: 0.7,
    maximumLength: 256,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  });
  storeLogitBias(initTabId, {
    fatherid: id,
    logitBiasArray: [
      {
        key: '1111',
        word: `call`,
        value: 0,
      },
    ],
  });
  storeActiveMessage(id, {
    activeMessageList: {},
    activeGroupId: '',
    selectGroupIdList: [],
  });
  storeSystem(initTabId, { fatherid: id, message: [] });
  storeTest(initTabId, { message: [], fatherid: id, isAsync: false });
  storeConversation(initTabId, { fatherid: id, message: [] });
};

export const getTargetProgectInfo = async (nanoid: string) => {
  const modifys = await getTargetModifys(nanoid);
  const activeMessages = await getTargetActiveMessage(nanoid);
  console.log(activeMessages,'activeMessages')
  const bots = await getTargetBot(nanoid);
  const messageHistorys = await getTargetMessageHistory(nanoid);
  const tabList = await getTargetTablist(nanoid);

  const activeTabListId = tabList?.activeTabListId;
  const logitBias = await getTargetLogitBiasWithFatherid(
    activeTabListId.logitBiasId,
    nanoid,
  );
  const systems = await getTargetsyStemsWithFatherid(
    activeTabListId.systemId,
    nanoid,
  );
  const tests = await getTargetTestsWithFatherid(
    activeTabListId.testId,
    nanoid,
  );
  const conversations = await getTargetConversationsWithFatherid(
    activeTabListId.conversationId,
    nanoid,
  );
  const slideLists = await getTargetSlideListsWithFatherid(
    activeTabListId.slideListId,
    nanoid,
  );
  const testHistory = await getTargetOperations({
    type: 'test',
    fatherid: nanoid,
    typeid: activeTabListId.testId,
  });
  const systemHistory = await getTargetOperations({
    type: 'system',
    fatherid: nanoid,
    typeid: activeTabListId.systemId,
  });
  const conversationHistory = await getTargetOperations({
    type: 'test',
    fatherid: nanoid,
    typeid: activeTabListId.conversationId,
  });
  return {
    modifys,
    bots,
    messageHistorys,
    slideLists,
    logitBias,
    activeMessages,
    systems,
    tests,
    conversations,
    tabList,
    testHistory,
    systemHistory,
    conversationHistory,
  };
};

export async function deleteProjectDB(nanoid: string) {
  try {
    await db.projectDetails.delete(nanoid);
    await db.modifys.delete(nanoid);
    await db.messageHistorys.delete(nanoid);
    await db.bots.delete(nanoid);
    await db.tabData.delete(nanoid);
    await db.activeMessages.delete(nanoid);
    await db.graphs.delete(nanoid);

    await db.operations.where({ fatherid: nanoid }).delete();
    await db.conversations.where({ fatherid: nanoid }).delete();
    await db.tests.where({ fatherid: nanoid }).delete();
    await db.logitBias.where({ fatherid: nanoid }).delete();
    await db.slideLists.where({ fatherid: nanoid }).delete();
    await db.systems.where({ fatherid: nanoid }).delete();

    return true;
  } catch (error) {
    console.error(error);
  }
}
