import { proxy, subscribe, snapshot } from 'valtio';
import tiktoken from '@/utils/tiktoken';
import { newProxyWithPersist } from '@/utils/persistence';
import conversationStore from '@/stores/conversation';
import systemStore from '@/stores/system';
import logitBiasStore from '@/stores/logitBias';
import slideListsStore from '@/stores/slideLists';
import modifyStore from '@/stores/modify';
import messageHistoryStore from '@/stores/messageHistory';
import { handelhistoryFunction } from '@/utils/handelFunction';
const { conversationState } = conversationStore;
const { slideListsState } = slideListsStore;
const { logitBiasState } = logitBiasStore;
const { systemState } = systemStore;
const { messageHistoryState } = messageHistoryStore;
const { modifyState } = modifyStore;





function filterMessage(list: any) {
  const message = snapshot(list)
  return message.map((item: any) => {
    if (item.children[0].text.trim().length != 0) {
      return { role: item.role, content: item.children[0].text };
    }
  }).filter(Boolean)
}

function filterHistory(list: any) {

  const data = snapshot(list);
  const history = data.map((item: any) => {
    if (item.isComplete == true || item.role == 'user') {
      return { role: item.role, content: item.content.text };
    }
  });
  return history.filter(Boolean)
}


const botState = newProxyWithPersist(
  {
    botFunctionTree: {},
    userFunctionTree: {},
    firstTimeEntryTree: {},
    quickRepliesFunctionTree: {},
    historyFunction: {
      lang: 'javascript',
      code: ''
    },
    functionmap: {},
    modify: snapshot(modifyState.list)[0] ? snapshot(modifyState.list)[0] : { prefix: '', suffix: '' },
    prompt: {
      system: filterMessage(systemState.message),
      conversation: filterMessage(conversationState.message),
      slideLists: snapshot(slideListsState),
      logitBiasArray: snapshot(logitBiasState.logitBiasArray),
      logitBias: {},
    },
    history: filterHistory(messageHistoryState.list),
    strategy: 'all',
    strategyId: '',
    avatar: '',
    quickReplies: [],
    name: 'Prompter',
    describe: '...',
  },
  {
    dbName: 'bots',
  },
);

subscribe(modifyState, () => {
  const { list } = snapshot(modifyState);
  botState.modify = list[0]
})



async function updataHistory(message: any) {
  const messageList = filterHistory(messageHistoryState.list)

  if (messageList.length == 0) {
    return
  }
  const { prompt, modify } = snapshot(botState)
  const messageindex = {
    all: 0,
    assistant: 0,
    user: 0,
  }
  for (let index = 0; index < messageList.length; index++) {
    const element = messageList[index];
    messageindex.all = messageindex.all + 1
    if (element.role == 'user') {
      messageindex.user = messageindex.user + 1
    } else {
      messageindex.assistant = messageindex.assistant + 1
    }
  }

  const InputData = {
    input: message.content.text,
    role: message.role,
    index: messageindex,
    history: filterHistory(messageHistoryState.list),
    modify,
    ...prompt,
  }

  if (message.isComplete == true || message.role == 'user') {
    if (botState.historyFunction.code == '') {
      botState.history.push({ role: message.role, content: message.content.text })
    } else {
      const result = await handelhistoryFunction(botState.historyFunction.lang, botState.historyFunction.code, InputData)
      if (result) {
        botState.history.push({ role: message.role, content: message.content.text })
      }
    }
  }
}


async function resetHistory() {
  if (botState.historyFunction.code == '') {
    botState.history.splice(0, botState.history.length, ...filterHistory(messageHistoryState.list));
  } else {
    const messageList = snapshot(messageHistoryState.list)
    const { prompt, modify } = snapshot(botState)
    const messageindex = {
      all: 0,
      assistant: 0,
      user: 0,
    }
    const historyPrompt = []
    for (let index = 0; index < messageList.length; index++) {
      const element = messageList[index];
      // console.log(element, 999)

      messageindex.all = messageindex.all + 1
      if (element.role == 'user') {
        messageindex.user = messageindex.user + 1
      } else {
        messageindex.assistant = messageindex.assistant + 1
      }

      const InputData = {
        input: element.content.text,
        role: element.role,
        index: messageindex,
        history: filterHistory(messageHistoryState.list),
        modify,
        ...prompt,

      }
      const result = await handelhistoryFunction(botState.historyFunction.lang, botState.historyFunction.code, InputData)
      if (result) {
        historyPrompt.push({ role: element.role, content: element.content.text })
      }
    }

    botState.history.splice(0, botState.history.length, ...historyPrompt)
  }
}






subscribe(conversationState, () => {
  botState.prompt.conversation = filterMessage(conversationState.message)
})

subscribe(systemState, () => {
  botState.prompt.system = filterMessage(systemState.message)
})

subscribe(slideListsState, () => {
  let slideListsData = snapshot(slideListsState);
  botState.prompt.slideLists.frequencyPenalty = slideListsData.frequencyPenalty
  botState.prompt.slideLists.maximumLength = slideListsData.maximumLength
  botState.prompt.slideLists.presencePenalty = slideListsData.presencePenalty
  botState.prompt.slideLists.temperature = slideListsData.temperature
  botState.prompt.slideLists.topP = slideListsData.topP
})



subscribe(logitBiasState, () => {

  const { logitBiasArray } = snapshot(logitBiasState);

  botState.prompt.logitBiasArray.splice(0, botState.prompt.logitBiasArray.length, ...logitBiasArray)
  
  updataLogitBias(logitBiasArray)

});


// 

async function updataLogitBias (array:any){
  // console.log('updata logibias')
  for (let key of Object.keys(botState.prompt.logitBias)) {
    delete botState.prompt.logitBias[key];
  }

  array.forEach(async (itemBig: any) => {
    if (itemBig.word.trim().length != 0) {
      const tokens = await tiktoken(itemBig.word);
      tokens.forEach((itemSmell: any) => {
        botState.prompt.logitBias[`${itemSmell}`] = itemBig.value;
      });
    }
  });
}


const Store = {
  botState,
  updataHistory,
  resetHistory,
  updataLogitBias,
  filterMessage
};

export default Store;
