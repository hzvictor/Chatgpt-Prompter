
import { chatToOpenai } from '@/services/openai'
import conversationStore from '@/stores/conversation';
import systemStore from '@/stores/system';
import logitBiasStore from '@/stores/logitBias';
import slideListsStore from '@/stores/slideLists';
import { sortMessage } from '@/utils/sortMessage';
const { conversationState } = conversationStore;
const { systemState } = systemStore;
import { newProxyWithPersist } from '@/utils/persistence';
const { slideListsState } = slideListsStore;
const { logitBiasState } = logitBiasStore;
import dayjs from 'dayjs';
import { snapshot } from 'valtio';

const borderColorList = [
  '#00aa90',
  '#D0104C',
  '#2EA9DF',
  '#91B493',
  '#8A6BBE',
  '#1E88A8',
  '#00aa90',
  '#D0104C',
  '#FBE251',
  '#2EA9DF',
  '#00aa90',
  '#D0104C',
  '#FBE251',
  '#2EA9DF',
];
// const activeMessageList =  {
//     groupID:{
//         creatDate:'',
//         genurateStateDate:'',
//         genurateEndDatee:'',
//         result:[]
//         resultState: 0 -- fail ,1 success
//         state: 0, 1 2,  // 0 -  selcting, // 1 -- loading, // 2 loading end // 3 - no state
//         clolorList:{
//             elementId :{
//                 color:'red',
//                 content:‘’,
//                 role:'',
//                 path: [],
//                 active: false : true,
//             }
//             elementId :{
//                 color:'red',
//                 content:‘’
//                 path: [],
//                 active: false : true,
//             }
//             elementId :{
//                 color:'red',
//                 content:‘’,
//                 path: [],
//                 active: false : true,
//             }
//         }
//     }
// }
const empty: any = {};
const emptylist: any = [];
// const activeMessageState = proxy({
//     activeMessageList: empty,
//     activeGroupId: '',
//     selectGroupIdList: emptylist
// });

const activeMessageState = newProxyWithPersist(
  {
    activeMessageList: empty,
    activeGroupId: '',
    selectGroupIdList: emptylist,
  },
  {
    dbName: 'activeMessages',
  },
);

// mainly for select
const genurateGroupMessageFirst = (elementID: string) => {
  const activeId = elementID;
  const activeMessageList: any = activeMessageState.activeMessageList;
  const length: number = activeMessageState.selectGroupIdList.length;
  const color = borderColorList[length];
  const colorHash: any = {};

  conversationState.message.forEach((item: any, index: any) => {
    colorHash[item.id] = {
      color: color,
      content: item.children[0].text,
      role: item.role,
      active: item.children[0].text.trim().length == 0 ? false : true,
    };
  });
  systemState.message.forEach((item: any) => {
    colorHash[item.id] = {
      color: color,
      content: item.children[0].text,
      role: item.role,
      active: item.children[0].text.trim().length == 0 ? false : true,
    };
  });

  activeMessageList[activeId] = {
    state: 0,
    creatDate: dayjs().valueOf(),
    clolorList: colorHash,
  };

  activeMessageState.activeGroupId = activeId;
  activeMessageState.selectGroupIdList.push({ color, activeId });
  return { color, activeId };
};

// mainly for Genurate message

async function genurateGroupMessageSecond(activeId: string) {
  const activeMessageList: any = activeMessageState.activeMessageList;
  const activeGroup = activeMessageList[activeId];
  const clolorList = activeGroup.clolorList;
  activeMessageList[activeId].resultState = 1;

  activeMessageList[activeId].genurateStateDate = dayjs().valueOf();
  for (const key in clolorList) {
    if (Object.prototype.hasOwnProperty.call(clolorList, key)) {
      // const element = clolorList[key];
      const systemStateShot = snapshot(systemState)
      systemStateShot.message.forEach((item: any, index: any) => {
        if (item.id == key) {
          clolorList[key].content = item.children[0].text;
          clolorList[key].role = item.role;
        }
      });
      const conversationStateShot = snapshot(conversationState)
      conversationStateShot.message.forEach((item: any, index: any) => {
        if (item.id == key) {
          clolorList[key].content = item.children[0].text;
          clolorList[key].role = item.role;
        }
      });
    }
  }
  const messages = sortMessage(clolorList);
  const filterMessage = messages.map((item: any) => {
    return { role: item.role, content: item.content };
  });

  const {
    temperature,
    maximumLength,
    topP,
    frequencyPenalty,
    presencePenalty,
  } = slideListsState;
  const { logitBias } = logitBiasState;

  const finalInfo = {
    messages: filterMessage,
    parameter: {
      frequency_penalty: frequencyPenalty,
      temperature: temperature,
      max_tokens: maximumLength,
      presence_penalty: presencePenalty,
      top_p: topP,
      logit_bias: logitBias,
    },
  };
  const ans = await chatToOpenai(finalInfo);

  activeMessageState.selectGroupIdList.pop();

  let index = activeMessageState.selectGroupIdList.findIndex(
    (item: any) => item.activeId === activeId,
  ); // 获取值为'c'的元素索引
  if (index !== -1) {
    activeMessageState.selectGroupIdList.splice(index, 1); // 从获取的索引开始删除1个元素
  }
  if (activeMessageState.selectGroupIdList.length != 0) {
    activeMessageState.activeGroupId =
      activeMessageState.selectGroupIdList[0].activeId;
  }

  activeMessageList[activeId].genurateEndDatee = dayjs().valueOf();
  activeMessageList[activeId].parameter = Object.assign({}, {...snapshot(slideListsState),...snapshot(logitBiasState)});

  if (ans.data) {
    if (ans.code == 0) {
      activeMessageList[activeId].result = [ans.data.message];
      activeMessageList[activeId].resultState = 1;
      return ans.data.message.content;
    } else {
      activeMessageList[activeId].resultState = 0;
      return '';
    }
  }
}

const changeGroupState = (activeid: string, state: number) => {
  // Synchronize information to active Message
  const activeMessageList: any = activeMessageState.activeMessageList;
  activeMessageList[activeid].state = state;
};

const Store = {
  activeMessageState,
  genurateGroupMessageFirst,
  genurateGroupMessageSecond,
  changeGroupState,
};

export default Store;
