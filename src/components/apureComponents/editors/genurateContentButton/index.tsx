import activeMessagetore from '@/stores/activeMessage';
import conversationStore from '@/stores/conversation';
import { useEffect, useState } from 'react';
import { ReactEditor } from 'slate-react';
import { Button, Steps, Progress, Space } from 'antd';
import { Transforms } from 'slate';
import { useModel } from 'umi';
import styles from './index.less';
import { useSnapshot } from 'valtio';
import { CaretUpOutlined } from '@ant-design/icons';
import { messageFunction } from '@/stores/globalFunction';

export default ({ element, editor }: any) => {
  const [step, setStep] = useState<number>(3); // 0 -  selcting, // 1 -- loading, // 2 loading end // 3 - no state
  const [color, setColor] = useState<string>('');
  const [activeId, setActiveId] = useState<string>(' ');
  const { conversationState } = conversationStore;
  const { message } = useSnapshot(conversationState);
  const messageApi = messageFunction.messageApi;
  const {
    activeMessageState,
    genurateGroupMessageFirst,
    genurateGroupMessageSecond,
    changeGroupState,
  } = activeMessagetore;
  const { activeGroupId, activeMessageList } = useSnapshot(activeMessageState);

  const [show, setShow] = useState<boolean>(false);
  async function genurate(e: any) {
    e.stopPropagation();
    if (step == 3) {
      const { color, activeId } = genurateGroupMessageFirst(element.id);
      setActiveId(activeId);
      setColor(color);
      setStep(0);
      changeGroupState(activeId, 0);
      return;
    }

    if (step == 0) {
      if (activeGroupId == activeId) {
        setStep(1);
        changeGroupState(activeId, 1);
        const path = ReactEditor.findPath(editor, element);
        let ans;
        try {
          ans = await genurateGroupMessageSecond(activeId);
          Transforms.insertText(editor, ans, {
            at: { path: [path[0], 0], offset: 0 },
          });
          setStep(2);
          changeGroupState(activeId, 2);
        } catch (error) {
          messageApi.info('Build failed, try to rebuild');
          setStep(2);
          changeGroupState(activeId, 2);
        }
      } else {
        activeMessageState.activeGroupId = activeId;
        return;
      }
    }
  }
  useEffect(() => {
    const self = message.filter((item: any) => item.id == element.id);
    if (
      element.role == 'assistant' &&
      self[0]?.children[0]?.text == '' &&
      step != 2
    ) {
      setShow(true);
    } else {
      setShow(false);
    }
    if (activeMessageList[element.id]) {
      const selfGroup = activeMessageList[element.id];
      const selfClolorList = selfGroup.clolorList;
      setStep(selfGroup.state);
      setActiveId(element.id);
      if (selfClolorList) {
        const clolorListKeys = Object.keys(selfGroup.clolorList);
        if (clolorListKeys.length > 0) {
          if (selfClolorList[clolorListKeys[0]].color) {
            setColor(selfClolorList[clolorListKeys[0]].color);
          }
        }
      }
    }
  }, [message, element.role]);

  return (
    <>
      {' '}
      {show ? (
        <Button
          contentEditable={false}
          onClick={genurate}
          loading={step == 1}
          size="small"
          className={styles.generate}
          shape="round"
          // icon={activeGroupId == activeId ? <CaretUpOutlined /> : <></>}
          style={{
            borderColor: color,
            color: color,
            // padding: '0px',
            opacity: activeGroupId != activeId && step == 0 ? 0.5 : 1,
          }}
        >
          {step == 0 ? 'Selecting' : step == 1 ? 'Generate' : 'Generate'}

          {/* <Steps
            progressDot
            current={step == 0 ? 1 : step == 1 ? 2 : 0}
            items={[
              {
                description: '',
              },
              {
                description: '',
              },
              {
                description: '',
              },
            ]}
          /> */}

          <div className={styles.progressStyle}>
            <Progress
              percent={step == 0 ? 30 : step == 1 ? 60 : step == 2 ? 100 : 0}
              size="small"
              strokeColor={color}
              showInfo={false}
            />
          </div>
        </Button>
      ) : (
        <></>
      )}
    </>
  );
};
// 0 -  selcting, // 1 -- loading, // 2 loading end // 3 - no state
