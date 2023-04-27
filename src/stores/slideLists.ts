import { multProxyWithPersist } from '@/utils/persistence';
import { subscribe } from 'valtio';
import tiktoken from '@/utils/tiktoken';
import { isEnglish } from '@/utils/little';
// const slideListsState = proxy({
//     temperature: 0.7,
//     maximumLength: 256,
//     topP: 1,
//     frequencyPenalty: 0,
//     presencePenalty: 0,
// });

const slideListsState = multProxyWithPersist(
  {
    temperature: 0.7,
    maximumLength: 256,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  {
    // type: 'localStorage',
    dbName: 'slideLists',
    nanoid: 'slideListId',
  },
);

// less a subcrib function

const onChangeTemperature = (newValue: any) => {
  slideListsState.temperature = newValue;
};
const onChangeMaximumLength = (newValue: any) => {
  slideListsState.maximumLength = newValue;
};
const onChangeTopP = (newValue: any) => {
  slideListsState.topP = newValue;
};
const onChangeFrequencyPenalty = (newValue: any) => {
  slideListsState.frequencyPenalty = newValue;
};
const onChangePresencePenalty = (newValue: any) => {
  slideListsState.presencePenalty = newValue;
};

const Store = {
  slideListsState,
  onChangeTemperature,
  onChangeMaximumLength,
  onChangeTopP,
  onChangeFrequencyPenalty,
  onChangePresencePenalty,
};

export default Store;
