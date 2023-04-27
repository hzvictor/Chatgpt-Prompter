import styles from './index.less';
import { Slider, Row, Col, Tooltip, InputNumber } from 'antd';
import TabList from '@/components/apureComponents/tabList';
import slideListsStore from '@/stores/slideLists';
import { useSnapshot } from 'valtio';

export default function IndexPage({slideListsData}:any) {

  const {
    temperature,
    maximumLength,
    topP,
    frequencyPenalty,
    presencePenalty,
  } = slideListsData;


  return (
    <div className={styles.container}>
      <Row>
        <Col className={styles.headerTitle} span={5} > Parameter</Col>
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
              value={temperature}
              min={0}
              max={1}
              step={0.01}
              defaultValue={0.5}
              disabled={true}
            />
          </Col>
          <Col span={4}>
            <InputNumber
              min={0}
              max={1}
              step={0.01}
              size="small"
              value={temperature}
              disabled={true}
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
              disabled={true}
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
              disabled={true}
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
              disabled={true}
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
              disabled={true}
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
              disabled={true}
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
              disabled={true}
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
              disabled={true}
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
              disabled={true}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
}
