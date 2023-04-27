import styles from './index.less';
import Chat from '../../components/chat';
import System from '../../components/editorBrothers/system';
import Conversation from '../../components/editorBrothers/conversation';
// import Parameter from '../../components/parameter';
import SlideList from '@/components/parameter/components/slideList';
import LogitBias from '@/components/parameter/components/logitBias';
import Manager from '../../components/manager';
import Logs from '../../components/logs';
import Test from '../../components/editorBrothers/test';
import CodeSnap from '@/components/apureComponents/codeSnap';
import GridLayout from 'react-grid-layout';
import { Button } from 'antd';
import { RedoOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { KeepAlive } from 'umi';
import { editorLayout } from '@/stores/editors';
import { useSnapshot } from 'valtio';

const layoutGrid = [
  { w: 13, h: 24, x: 5, y: 0, i: 'conversation', moved: false, static: false },
  { w: 5, h: 8, x: 0, y: 2, i: 'system', moved: false, static: false },
  { w: 6, h: 19, x: 18, y: 0, i: 'chat', moved: false, static: false },
  { w: 5, h: 9, x: 0, y: 10, i: 'slideList', moved: false, static: false },
  { w: 5, h: 11, x: 0, y: 19, i: 'logitBias', moved: false, static: false },
  { w: 5, h: 2, x: 0, y: 0, i: 'manager', moved: false, static: false },
  { w: 13, h: 6, x: 5, y: 24, i: 'logs', moved: false, static: false },
  { w: 6, h: 11, x: 18, y: 19, i: 'test', moved: false, static: false },
];
export default function IndexPage() {
  const ref: any = useRef(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const { layout } = useSnapshot(editorLayout);
  const [isChangeLayout, setIsChangeLayout] = useState({
    conversation: false,
    system: false,
    chat: false,
    parameter: false,
    slideList: false,
    logitBias: false,
    manager: false,
    logs: false,
    test: false,
  });

  useLayoutEffect(() => {
    setWidth(ref?.current?.offsetWidth);
    setHeight(ref?.current?.offsetHeight);
  }, []);

  const onLayoutChange = (layout: any) => {
    const changeList = layout.filter((item: any) => {
      const result = layoutGrid.filter((grid: any) => {
        if (grid.i == item.i) {
          if (grid.w != item.w || grid.h != item.h) {
            return true;
          }
        }
        return false;
      });
      if (result.length > 0) {
        return true;
      } else {
        return false;
      }
    });

    const newIsChangeLayout = {
      conversation: false,
      system: false,
      chat: false,
      parameter: false,
      slideList: false,
      logitBias: false,
      manager: false,
      logs: false,
      test: false,
    };

    changeList.forEach((item: any) => {
      newIsChangeLayout[item.i] = true;
    });

    // console.log(newIsChangeLayout, 6666666)
    setIsChangeLayout(newIsChangeLayout);

    editorLayout.layout = layout;
    // this.props.onLayoutChange(layout); // updates status display
  };

  const ChangeSize = ({ layoutKey }: any) => {
    const changeToSamll = (ksyString: string) => {
      if (!isChangeLayout[layoutKey]) {
        const newLayout = editorLayout.layout.concat([]);
        let keyLayOut = editorLayout.layout.find(
          (item: any) => item.i == ksyString,
        );
        let keyLayOutIndex = editorLayout.layout.findIndex(
          (item: any) => item.i == ksyString,
        );
        keyLayOut.h = 2;
        keyLayOut.w = 3;
        newLayout.splice(keyLayOutIndex, 1, keyLayOut);

        editorLayout.layout.splice(
          0,
          editorLayout.layout.length,
          ...JSON.parse(JSON.stringify(newLayout)),
        );
      } else {
        const newLayout = editorLayout.layout.concat([]);
        let keyLayOut = editorLayout.layout.find(
          (item: any) => item.i == ksyString,
        );
        const keyOrignLayOut = layoutGrid.find(
          (item: any) => item.i == ksyString,
        );
        let keyLayOutIndex = editorLayout.layout.findIndex(
          (item: any) => item.i == ksyString,
        );
        keyLayOut.h = keyOrignLayOut?.h;
        keyLayOut.w = keyOrignLayOut?.w;
        newLayout.splice(keyLayOutIndex, 1, keyLayOut);
        editorLayout.layout.splice(
          0,
          editorLayout.layout.length,
          ...JSON.parse(JSON.stringify(newLayout)),
        );
      }
    };
    // console.log(isChangeLayout[layoutKey],7777777)
    return (
      <Button
        onClick={() => {
          changeToSamll(layoutKey);
        }}
        type="primary"
        style={{
          position: 'fixed',
          borderBottomRightRadius: '15px',
          zIndex: 100,
          top: '4px',
          backgroundColor: 'rgb(129,207,183)',
          left: '4px',
          color: 'gray',
          transform: 'scale(0.55)',
        }}
        size="small"
        icon={isChangeLayout[layoutKey] ? <RedoOutlined /> : <MinusOutlined />}
      ></Button>
    );
  };

  return (
    <div className={styles.container} ref={ref}>
      <KeepAlive>
        <GridLayout
          className={styles.gridContainer}
          layout={layout}
          onLayoutChange={onLayoutChange}
          cols={24}
          margin={[0, 0]}
          rowHeight={height / 30}
          width={width}
          isDraggable={true}
        >
          <div className={styles.grad} key="conversation">
            <ChangeSize layoutKey="conversation"></ChangeSize>
            <Conversation></Conversation>
          </div>
          <div className={styles.grad} key="system">
            <ChangeSize layoutKey="system"></ChangeSize>
            <System></System>
          </div>
          <div className={styles.grad} key="chat">
            <ChangeSize layoutKey="chat"></ChangeSize>
            <Chat></Chat>
          </div>
          {/* <div className={styles.grad} key="parameter">
            <ChangeSize layoutKey="parameter"></ChangeSize>
            <Parameter></Parameter>
          </div> */}
          <div className={styles.grad} key="slideList">
            <ChangeSize layoutKey="slideList"></ChangeSize>
            <SlideList></SlideList>
          </div>
          <div className={styles.grad} key="logitBias">
            <ChangeSize layoutKey="logitBias"></ChangeSize>
            <LogitBias></LogitBias>
          </div>
          <div className={styles.grad} key="manager">
            <ChangeSize layoutKey="manager"></ChangeSize>
            <Manager></Manager>
          </div>
          <div className={styles.grad} key="logs">
            <ChangeSize layoutKey="logs"></ChangeSize>
            <Logs></Logs>
          </div>
          <div className={styles.grad} key="test">
            <ChangeSize layoutKey="test"></ChangeSize>
            <Test></Test>
          </div>
        </GridLayout>
      </KeepAlive>
    </div>
  );
}
