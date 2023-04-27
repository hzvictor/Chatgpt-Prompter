import { proxy, subscribe } from 'valtio';
import { makeNodeId } from '../utils/withNodeId';
import { proxyWithPersist } from '@/utils/persistence';

const keywordsState = proxy({
  top: 0,
  left: 0,
  show: false,
  wordList: [],
});

// subscribe(testState, () => {
//   genurateTestMessageRole();
// });

const Store = {
  keywordsState,
};

export default Store;
