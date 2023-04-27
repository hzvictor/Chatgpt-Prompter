import styles from './index.less';
import { Slider, Row, Col, Tooltip, InputNumber } from 'antd';
import LogitBias from './components/logitBias';
import SlideList from './components/slideList';
// import parameterStore from '@/stores/parameter';
import { useSnapshot } from 'valtio';
import { useRef, useLayoutEffect } from 'react';
export default function IndexPage() {
  // const {
  //   parameterState,
  //   onChangeTemperature,
  //   onChangeMaximumLength,
  //   onChangeTopP,
  //   onChangeFrequencyPenalty,
  //   onChangePresencePenalty,
  // } = parameterStore;
  // const {
  //   temperature,
  //   maximumLength,
  //   topP,
  //   frequencyPenalty,
  //   presencePenalty,
  // } = useSnapshot(parameterState);

  return (
    <div className={styles.container}>
      <div className={styles.title}> Parameter </div>
      <SlideList></SlideList>
      <LogitBias></LogitBias>
    </div>
  );
}
