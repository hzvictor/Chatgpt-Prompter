import { multProxyWithPersist } from '@/utils/persistence';
import { subscribe } from 'valtio';
import tiktoken from '@/utils/tiktoken';
import { isEnglish } from '@/utils/little';
// const logitBiasState = proxy({
//     temperature: 0.7,
//     maximumLength: 256,
//     topP: 1,
//     frequencyPenalty: 0,
//     presencePenalty: 0,
// });

const logitBiasState = multProxyWithPersist(
  {
    logitBiasArray: [
      {
        key: '1111',
        word: `call`,
        value: 0,
      },
    ],
  },
  {
    nanoid: 'logitBiasId',
    dbName: 'logitBias',
  },
);

// less a subcrib function

// subscribe(logitBiasState.logitBiasArray, () => {
//   for (let key of Object.keys(logitBiasState.logitBias)) {
//     delete logitBiasState.logitBias[key];
//   }
//   logitBiasState.logitBiasArray.forEach(async (itemBig: any) => {
//     if (itemBig.word.trim().length != 0) {
//       const tokens = await tiktoken(itemBig.word);
//       tokens.forEach((itemSmell: any) => {
//         logitBiasState.logitBias[`${itemSmell}`] = itemBig.value;
//       });
//     }
//   });
// });

const Store = {
  logitBiasState,
};

export default Store;
