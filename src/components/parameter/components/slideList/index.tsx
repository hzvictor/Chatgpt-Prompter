import styles from './index.less';
import { Slider, Row, Col, Tooltip, InputNumber } from 'antd';
import TabList from '@/components/apureComponents/tabList';
import slideListsStore from '@/stores/slideLists';
import { useSnapshot } from 'valtio';

import {
  storeSlideLists,
  getTargetSlideListsWithFatherid,
  deleteTargetSlideLists,
} from '@/database/slideLists';
import { activeProject } from '@/stores/project';
import { async } from '@antv/x6/lib/registry/marker/async';
export default function IndexPage() {
  const {
    slideListsState,
    onChangeTemperature,
    onChangeMaximumLength,
    onChangeTopP,
    onChangeFrequencyPenalty,
    onChangePresencePenalty,
  } = slideListsStore;
  const {
    temperature,
    maximumLength,
    topP,
    frequencyPenalty,
    presencePenalty,
  } = useSnapshot(slideListsState);

  const addNewTab =  async (id: string) => {
     await storeSlideLists(id, {
      fatherid: activeProject.activeProjectID,
      temperature: 0.7,
      maximumLength: 256,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    });
    slideListsStore.slideListsState.temperature = 0.7;
    slideListsStore.slideListsState.maximumLength = 256;
    slideListsStore.slideListsState.topP = 1;
    slideListsStore.slideListsState.frequencyPenalty = 0;
    slideListsStore.slideListsState.presencePenalty = 0;
  };

  const changeTab = async (id: string) => {
    const slideListState = await getTargetSlideListsWithFatherid(
      id,
      activeProject.activeProjectID,
    );
    console.log('switch', slideListState, id);
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
  };
  const removeTab = async (id: string) => {
    console.log('remove', id);
    await deleteTargetSlideLists(id, activeProject.activeProjectID);
  };

  return (
    <div className={styles.container}>
      <Row>
        {/* <Col className={styles.headerTitle} span={5} > Parameter</Col> */}
        <Col span={24}>
          <TabList
            defaultName="Parameter"
            addNewTab={addNewTab}
            changeTab={changeTab}
            removeTab={removeTab}
            activeKeyName="slideListId"
          ></TabList>
        </Col>
      </Row>
      <div className={styles.rowLine}>
        <Row>
          <Tooltip
            color="pink"
            title="Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive."
          >
            <Col className={styles.title}>Temperature</Col>
          </Tooltip>
        </Row>
        <Row
          onMouseDown={(e) => e.stopPropagation()}
          align="middle"
          gutter={16}
        >
          <Col span={16}>
            <Slider
              onChange={onChangeTemperature}
              value={temperature}
              min={0}
              max={1}
              step={0.01}
              defaultValue={0.5}
            />
          </Col>
          <Col span={4}>
            <InputNumber
              min={0}
              max={1}
              step={0.01}
              size="small"
              value={temperature}
              style={{}}
              onChange={onChangeTemperature}
            />
          </Col>
        </Row>
      </div>
      <div className={styles.rowLine}>
        <Row>
          <Tooltip
            color="volcano"
            title="The maximum number of tokens to generate. Requests can use up to 2,048 or 4,000 tokens shared between prompt and completion. The exact limit varies by model. One token is roughly 4 characters for normal English text)"
          >
            <Col className={styles.title}>Maximum length</Col>
          </Tooltip>
        </Row>
        <Row
          onMouseDown={(e) => e.stopPropagation()}
          align="middle"
          gutter={16}
        >
          <Col span={16}>
            <Slider
              value={maximumLength}
              onChange={onChangeMaximumLength}
              min={10}
              max={2048}
              step={1}
              defaultValue={100}
            />
          </Col>
          <Col span={4}>
            <InputNumber
              min={10}
              max={2048}
              step={1}
              size="small"
              value={maximumLength}
              style={{}}
              onChange={onChangeMaximumLength}
            />
          </Col>
        </Row>
      </div>
      <div className={styles.rowLine}>
        <Row>
          <Tooltip
            color="green"
            title="Controls diversity via nucleus sampling:
0.5 means half of all likelihood-weighted options are considered.
Tor
Fre"
          >
            <Col className={styles.title}>Top P</Col>
          </Tooltip>
        </Row>
        <Row
          onMouseDown={(e) => e.stopPropagation()}
          align="middle"
          gutter={16}
        >
          <Col span={16}>
            <Slider
              value={topP}
              onChange={onChangeTopP}
              min={0}
              max={1}
              step={0.01}
              defaultValue={0.5}
            />
          </Col>
          <Col span={4}>
            <InputNumber
              min={0}
              max={1}
              step={0.01}
              size="small"
              value={topP}
              style={{}}
              onChange={onChangeTopP}
            />
          </Col>
        </Row>
      </div>
      <div className={styles.rowLine}>
        <Row>
          <Tooltip
            color="cyan"
            title="Controls diversity via nucleus sampling:
0.5 means half of all likelihood-weighted options are considered.
Tor
Fre"
          >
            <Col className={styles.title}>Frequency penalty</Col>
          </Tooltip>
        </Row>
        <Row
          onMouseDown={(e) => e.stopPropagation()}
          align="middle"
          gutter={16}
        >
          <Col span={16}>
            <Slider
              value={frequencyPenalty}
              onChange={onChangeFrequencyPenalty}
              min={0}
              max={1}
              step={0.01}
              defaultValue={0}
            />
          </Col>
          <Col span={4}>
            <InputNumber
              min={0}
              max={1}
              step={0.01}
              size="small"
              value={frequencyPenalty}
              style={{}}
              onChange={onChangeFrequencyPenalty}
            />
          </Col>
        </Row>
        <Row>
          <Tooltip
            color="yellow"
            title="How much to penalize new tokens based on whether they appear in the text so far. Increases the model's likelihood to talk about new topics."
          >
            <Col className={styles.title}>Presence penalty</Col>
          </Tooltip>
        </Row>
        <Row align="middle" gutter={16}>
          <Col span={16}>
            <Slider
              value={presencePenalty}
              onChange={onChangePresencePenalty}
              min={0}
              max={1}
              step={0.01}
              defaultValue={0}
            />
          </Col>
          <Col span={4}>
            <InputNumber
              min={0}
              max={1}
              step={0.01}
              size="small"
              value={presencePenalty}
              style={{}}
              onChange={onChangePresencePenalty}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
}
