import { db } from '../database/root';
// import systemStore from '@/stores/system';
// import conversationStore from '@/stores/conversation';
// import testStore from '@/stores/test';
import activeStore from '@/stores/activeMessage';
import logitBiasStore from '@/stores/logitBias';
import slideListsStore from '@/stores/slideLists';
import modifyStore from '@/stores/modify';
import messageHistoryStore from '@/stores/messageHistory';
import botStore from '@/stores/bot';
import { tabData } from '@/stores/tablist';
import testStore from './test'
// import { proxyWithBotPersist } from '@/utils/persistence';
import { proxy } from 'valtio';

export function resetAllState(initTabId: string) {

  testStore.testState.isAsync = false;

  (tabData.activeTabListId.slideListId = initTabId),
    (tabData.activeTabListId.logitBiasId = initTabId),
    (tabData.activeTabListId.testId = initTabId),
    (tabData.activeTabListId.systemId = initTabId),
    (tabData.activeTabListId.conversationId = initTabId),
    tabData.slideListTabList.slideListId.splice(
      0,
      tabData.slideListTabList.slideListId.length,
      {
        label: 'Parameter',
        key: initTabId,
        isEdite: false,
        closable: false,
      },
    );
  tabData.slideListTabList.logitBiasId.splice(0, tabData.slideListTabList.logitBiasId.length, {
    label: 'Logit Bias',
    key: initTabId,
    isEdite: false,
    closable: false,
  });
  tabData.slideListTabList.testId.splice(0, tabData.slideListTabList.testId.length, {
    label: 'Test',
    key: initTabId,
    isEdite: false,
    closable: false,
  });
  tabData.slideListTabList.systemId.splice(0, tabData.slideListTabList.systemId.length, {
    label: 'System',
    key: initTabId,
    isEdite: false,
    closable: false,
  });
  tabData.slideListTabList.conversationId.splice(
    0,
    tabData.slideListTabList.conversationId.length,
    {
      label: 'Conversation',
      key: initTabId,
      isEdite: false,
      closable: false,
    },
  );

  activeStore.activeMessageState.activeMessageList = {};
  activeStore.activeMessageState.activeGroupId = '';
  activeStore.activeMessageState.selectGroupIdList.splice(0, activeStore.activeMessageState.selectGroupIdList.length)

  slideListsStore.slideListsState.temperature = 0.7;
  slideListsStore.slideListsState.maximumLength = 256;
  slideListsStore.slideListsState.topP = 1;
  slideListsStore.slideListsState.frequencyPenalty = 0;
  slideListsStore.slideListsState.presencePenalty = 0;
  logitBiasStore.logitBiasState.logitBiasArray.splice(
    0,
    logitBiasStore.logitBiasState.logitBiasArray.length,
  );

  botStore.botState.botFunctionTree = {},
    botStore.botState.userFunctionTree = {},
    botStore.botState.firstTimeEntryTree = {},
    botStore.botState.quickRepliesFunctionTree = {},
    botStore.botState.historyFunction = {
      lang: 'javascript',
      code: ''
    },
    botStore.botState.functionmap = {},
    botStore.updataLogitBias([])
  // botStore.botState.modify = {},
  // botStore.botState.prompt = {
  //   system: [],
  //   conversation: [],
  //   slideLists: [],
  //   logitBiasArray: [],
  //   logitBias: {},
  // },
  botStore.botState.history.splice(0, botStore.botState.history.length),
    botStore.botState.strategy = 'all',
    botStore.botState.strategyId = '';
  botStore.botState.avatar = '';
  botStore.botState.quickReplies.splice(0, botStore.botState.quickReplies.length),
    botStore.botState.name = 'Prompter';
    botStore.botState.describe = '...';

  modifyStore.modifyState.list.splice(0, modifyStore.modifyState.list.length);

  messageHistoryStore.messageHistoryState.list.splice(
    0,
    messageHistoryStore.messageHistoryState.list.length,
  );
}

export const updateAllState = (
  activeMessageState: any,
  slideListState: any,
  logitBiastate: any,
  bot: any,
  messageHistory: any,
  modifyList: any,
  tabList: any,
  tests: any
) => {
  if (tests) {
    testStore.testState.isAsync = tests.isAsync
  }

  if (activeMessageState) {
    if (activeMessageState.activeMessageList) {
      activeStore.activeMessageState.activeMessageList =
        activeMessageState.activeMessageList;
    }

    if (activeMessageState.activeGroupId) {
      activeStore.activeMessageState.activeGroupId =
        activeMessageState.activeGroupId;
    }
    if (activeMessageState.selectGroupIdList) {
      activeStore.activeMessageState.selectGroupIdList.splice(0, activeStore.activeMessageState.selectGroupIdList.length, ...activeMessageState.selectGroupIdList)
    }
  }

  tabData.activeTabListId.slideListId = tabList.activeTabListId.slideListId;
  (tabData.activeTabListId.logitBiasId = tabList.activeTabListId.logitBiasId),
    (tabData.activeTabListId.testId = tabList.activeTabListId.testId),
    (tabData.activeTabListId.systemId = tabList.activeTabListId.systemId),
    (tabData.activeTabListId.conversationId = tabList.activeTabListId.conversationId),
    tabData.slideListTabList.slideListId.splice(
      0,
      tabData.slideListTabList.slideListId.length,
      ...tabList.slideListTabList.slideListId,
    );
  tabData.slideListTabList.logitBiasId.splice(
    0,
    tabData.slideListTabList.logitBiasId.length,
    ...tabList.slideListTabList.logitBiasId,
  );
  tabData.slideListTabList.testId.splice(
    0,
    tabData.slideListTabList.testId.length,
    ...tabList.slideListTabList.testId,
  );
  tabData.slideListTabList.systemId.splice(
    0,
    tabData.slideListTabList.systemId.length,
    ...tabList.slideListTabList.systemId,
  );
  tabData.slideListTabList.conversationId.splice(
    0,
    tabData.slideListTabList.conversationId.length,
    ...tabList.slideListTabList.conversationId,
  );

  if (slideListState) {
    slideListsStore.slideListsState.temperature = slideListState.temperature;
    slideListsStore.slideListsState.maximumLength =
      slideListState.maximumLength;
    slideListsStore.slideListsState.topP = slideListState.topP;
    slideListsStore.slideListsState.frequencyPenalty =
      slideListState.frequencyPenalty;
    slideListsStore.slideListsState.presencePenalty =
      slideListState.presencePenalty;
  }
  if (logitBiastate) {
    logitBiasStore.logitBiasState.logitBiasArray.splice(
      0,
      logitBiasStore.logitBiasState.logitBiasArray.length,
      ...logitBiastate.logitBiasArray,
    );
  }

  // console.log(modifyList, 'modifyList');
  // console.log(bot, 'bot');
  // console.log(messageHistory, 'messageHistory');
  if (bot) {
    botStore.botState.botFunctionTree = bot.botFunctionTree,
      botStore.botState.userFunctionTree = bot.userFunctionTree,
      botStore.botState.firstTimeEntryTree = bot.firstTimeEntryTree,
      botStore.botState.quickRepliesFunctionTree = bot.quickRepliesFunctionTree,
      botStore.botState.historyFunction = bot.historyFunction,
      botStore.botState.functionmap = bot.functionmap,

      botStore.updataLogitBias([])
    botStore.botState.history.splice(0, botStore.botState.history.length, ...bot.history),
      botStore.botState.strategy = 'all',
      botStore.botState.strategyId = bot.strategyId;
    botStore.botState.avatar = bot.avatar;
    botStore.botState.quickReplies.splice(0, botStore.botState.quickReplies.length, ...bot.quickReplies),
      botStore.botState.name = bot.name;
      botStore.botState.describe = bot.describe;

  }
  if (modifyList.list) {
    modifyStore.modifyState.list.splice(
      0,
      modifyStore.modifyState.list.length,
      ...modifyList.list,
    );
  }

  if (messageHistory.list) {
    messageHistoryStore.messageHistoryState.list.splice(
      0,
      messageHistoryStore.messageHistoryState.list.length,
      ...messageHistory.list,
    );
  }
};
