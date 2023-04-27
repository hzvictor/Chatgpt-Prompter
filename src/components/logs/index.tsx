import styles from './index.less';
import {
  SettingFilled,
  UserOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import { Timeline, Collapse, Descriptions, List, Avatar, Card } from 'antd';
import activeMessageStore from '@/stores/activeMessage';
import { useSnapshot } from 'valtio';
import { sortMessage } from '@/utils/sortMessage';
import dayjs from 'dayjs';

import { useRef, useEffect } from 'react';

const { Panel } = Collapse;
export default function LogsPage() {
  const { activeMessageState } = activeMessageStore;
  const { activeMessageList } = useSnapshot(activeMessageState);
  const contentRef = useRef(null);

  const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;
  useEffect(() => {
    const contentElement = contentRef.current;
    contentElement.scrollTop = contentElement.scrollHeight;
  }, [activeMessageList]);

  return (
    <div className={styles.container} ref={contentRef}>
      <div className={styles.title}> Logs</div>
      <Collapse ghost>
        {Object.values(activeMessageList).map((item: any, key: number) => {
          if (item.state == 2) {
            return (
              <Panel
                header={`Result :  ${
                  item.resultState == 1 && item.result?.length > 0
                    ? item?.result[0].content.slice(0, 25)
                    : 'Fail'
                }...`}
                key={key}
              >
                <Timeline
                  onMouseDown={(e) => e.stopPropagation()}
                  items={[
                    {
                      children: `Create a services
                      ${dayjs(item.creatDate).format('YYYY-MM-DD HH:mm:ss')}`,
                    },
                    {
                      children: `Genurate state a services site
                      ${dayjs(item.genurateStateDate).format(
                        'YYYY-MM-DD HH:mm:ss',
                      )}`,
                    },
                    {
                      children: ` Genurate End a services site
                      ${dayjs(item.genurateEndDatee).format(
                        'YYYY-MM-DD HH:mm:ss',
                      )}`,
                    },
                    {
                      children: ` Cost ${
                        item.genurateEndDatee - item.genurateStateDate
                      } ms ==
                      ${(
                        (item.genurateEndDatee - item.genurateStateDate) /
                        1000
                      ).toFixed(2)}`,
                    },
                    {
                      children: (
                        <>
                          <Card title="Result">
                            {
                              item.result?.length > 0 && item.resultState == 1
                                ? item.result.map(
                                    (item: any, index: number) => {
                                      return (
                                        // <Card type="inner" title="First" key={index}>
                                        item.content
                                      );
                                    },
                                  )
                                : // <Card type="inner" title="First" key={1}>
                                  'Fail'
                              // </Card>
                            }
                          </Card>
                        </>
                      ),
                    },
                    {
                      children: (
                        <>
                          <List
                            header={<h3>Prompts</h3>}
                            itemLayout="horizontal"
                            dataSource={sortMessage(item.clolorList)}
                            renderItem={(item: any, index) => (
                              <List.Item key={index}>
                                <List.Item.Meta
                                  avatar={
                                    item.role == 'user' ? (
                                      <UserOutlined />
                                    ) : item.role == 'asstant' ? (
                                      <CommentOutlined />
                                    ) : (
                                      <SettingFilled />
                                    )
                                  }
                                  title={
                                    <a href="https://ant.design">{item.role}</a>
                                  }
                                  description={item.content}
                                />
                              </List.Item>
                            )}
                          />
                        </>
                      ),
                    },
                    {
                      children: (
                        <>
                          <Descriptions title="Parameter" bordered column={1}>
                            {item.parameter && Object.keys(item.parameter).map(
                              (parameterItem, index) => {
                                if (
                                  parameterItem != 'logitBias' &&
                                  parameterItem != 'logitBiasArray'
                                ) {
                                  return (
                                    <Descriptions.Item
                                      label={parameterItem}
                                      key={index}
                                    >
                                      {item.parameter[parameterItem]}
                                    </Descriptions.Item>
                                  );
                                }
                              },
                            )}
                          </Descriptions>
                        </>
                      ),
                    },
                    {
                      children: (
                        <>
                          <Descriptions title="LogitBias" bordered column={1}>

                            {item.parameter&& item.parameter.logitBiasArray && item.parameter.logitBiasArray.length > 0 &&
                              item.parameter.logitBiasArray?.map(
                                (logItem: any, logIndex: number) => {
                                  return (
                                    <Descriptions.Item
                                      label={logItem.word}
                                      key={logIndex}
                                    >
                                      {logItem.value}
                                    </Descriptions.Item>
                                  );
                                },
                              )}
                          </Descriptions>
                        </>
                      ),
                    },
                  ]}
                />
              </Panel>
            );
          } else {
            return (
              <Panel
                onMouseDown={(e) => e.stopPropagation()}
                header={`Create a services
                    ${dayjs(item.creatDate).format('YYYY-MM-DD HH:mm:ss')}`}
                key={key}
              >
                <Timeline
                  items={[
                    {
                      children: ` Create a services
                      ${dayjs(item.creatDate).format('YYYY-MM-DD HH:mm:ss')}`,
                    },
                  ]}
                />
              </Panel>
            );
          }
        })}
      </Collapse>
    </div>
  );
}
