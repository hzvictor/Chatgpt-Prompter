import styles from './index.less';
import Chat from '@/components/chat';
import Tuning from '@/components/tuning';
import SlideList from '@/components/parameter/components/slideList';
import Manager from '@/components/manager';
import Test from '@/components/editorBrothers/test';
import GridLayout from 'react-grid-layout';
import { Button } from 'antd';
import { RedoOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { KeepAlive } from 'umi';
import { connect } from 'umi';


const layoutGrid = [{ w: 13, h: 24, x: 5, y: 0, i: 'tuning', moved: false, static: false },
{ w: 6, h: 19, x: 18, y: 0, i: 'chat', moved: false, static: false },
{ w: 5, h: 9, x: 0, y: 10, i: 'slideList', moved: false, static: false },
{ w: 5, h: 2, x: 0, y: 0, i: 'manager', moved: false, static: false },
{ w: 6, h: 11, x: 18, y: 19, i: 'test', moved: false, static: false }]

function IndexPage({ match, layoutConfig, dispatch }: any) {

  const projectid = match.params.projectid ? match.params.projectid : '123'

  const ref: any = useRef(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);



  useLayoutEffect(() => {
    setWidth(ref?.current?.offsetWidth);
    setHeight(ref?.current?.offsetHeight);
    dispatch({
      type: 'layoutConfig/getlayoutConfig',
      payload: projectid,
    })
  }, []);

  // const onLayoutChange = (layout: any) => {
  //   const changeList = layout.filter((item: any) => {
  //     const result = layoutGrid.filter((grid: any) => {
  //       if (grid.i == item.i) {
  //         if (grid.w != item.w || grid.h != item.h) {
  //           return true;
  //         }
  //       }
  //       return false;
  //     });
  //     if (result.length > 0) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   });

  //   const newIsChangeLayout = {
  //     conversation: false,
  //     system: false,
  //     chat: false,
  //     parameter: false,
  //     slideList: false,
  //     logitBias: false,
  //     manager: false,
  //     logs: false,
  //     test: false,
  //   };

  //   changeList.forEach((item: any) => {
  //     newIsChangeLayout[item.i] = true;
  //   });

  //   // console.log(newIsChangeLayout, 6666666)
  //   setIsChangeLayout(newIsChangeLayout);

  //   editorLayout.layout = layout;
  //   // this.props.onLayoutChange(layout); // updates status display
  // };

  // const ChangeSize = ({ layoutKey }: any) => {
  //   const changeToSamll = (ksyString: string) => {
  //     if (!isChangeLayout[layoutKey]) {
  //       const newLayout = editorLayout.layout.concat([]);
  //       let keyLayOut = editorLayout.layout.find(
  //         (item: any) => item.i == ksyString,
  //       );
  //       let keyLayOutIndex = editorLayout.layout.findIndex(
  //         (item: any) => item.i == ksyString,
  //       );
  //       keyLayOut.h = 2;
  //       keyLayOut.w = 3;
  //       newLayout.splice(keyLayOutIndex, 1, keyLayOut);

  //       editorLayout.layout.splice(
  //         0,
  //         editorLayout.layout.length,
  //         ...JSON.parse(JSON.stringify(newLayout)),
  //       );
  //     } else {
  //       const newLayout = editorLayout.layout.concat([]);
  //       let keyLayOut = editorLayout.layout.find(
  //         (item: any) => item.i == ksyString,
  //       );
  //       const keyOrignLayOut = layoutGrid.find(
  //         (item: any) => item.i == ksyString,
  //       );
  //       let keyLayOutIndex = editorLayout.layout.findIndex(
  //         (item: any) => item.i == ksyString,
  //       );
  //       keyLayOut.h = keyOrignLayOut?.h;
  //       keyLayOut.w = keyOrignLayOut?.w;
  //       newLayout.splice(keyLayOutIndex, 1, keyLayOut);
  //       editorLayout.layout.splice(
  //         0,
  //         editorLayout.layout.length,
  //         ...JSON.parse(JSON.stringify(newLayout)),
  //       );
  //     }
  //   };
  //   // console.log(isChangeLayout[layoutKey],7777777)
  //   return (
  //     <Button
  //       onClick={() => {
  //         changeToSamll(layoutKey);
  //       }}
  //       type="primary"
  //       style={{
  //         position: 'fixed',
  //         borderBottomRightRadius: '15px',
  //         zIndex: 100,
  //         top: '4px',
  //         backgroundColor: 'rgb(129,207,183)',
  //         left: '4px',
  //         color: 'gray',
  //         transform: 'scale(0.55)',
  //       }}
  //       size="small"
  //       icon={isChangeLayout[layoutKey] ? <RedoOutlined /> : <MinusOutlined />}
  //     ></Button>
  //   );
  // };


  // console.log(layoutConfig,111111111)

  const onLayoutChange = (layout: any) => {
    const newLayoutConfig = JSON.parse(JSON.stringify(layoutConfig))
    // newLayoutConfig.layoutGrid = layoutGrid.map((item:any)=>{
    //   const target = layout.find((self:any)=>{self.i == item.i})
    //   if(target){
    //     return target
    //   }else{
    //     return item
    //   }
    // })
    newLayoutConfig.layoutGrid = JSON.parse(JSON.stringify(layout))
    dispatch({
      type: 'layoutConfig/updateLayoutConfig',
      payload: {
        nanoid: projectid,
        data: { layoutConfig: newLayoutConfig }
      },
    })

  }

  return (
    <div className={styles.container} ref={ref}>
      <KeepAlive>
        <GridLayout
          className={styles.gridContainer}
          layout={layoutConfig.layoutGrid}
          onLayoutChange={onLayoutChange}
          cols={24}
          margin={[0, 0]}
          rowHeight={height / 30}
          width={width}
          isDraggable={layoutConfig.isDraggable}
          isResizable={layoutConfig.isResizable}

        >
          {
            layoutConfig.showChat && <div className={styles.grad} key="chat">
              <Chat></Chat>
            </div>
          }
          {layoutConfig.showTuning && <div className={styles.grad} key="tuning">
            <Tuning projectid={projectid} ></Tuning>
          </div>}
          {layoutConfig.showParameter && <div className={styles.grad} key="slideList">
            <SlideList></SlideList>
          </div>}
          <div className={styles.grad} key="manager">
            <Manager projectid={projectid}></Manager>
          </div>
          {layoutConfig.showTest && <div className={styles.grad} key="test">
            <Test></Test>
          </div>}
        </GridLayout>
      </KeepAlive>
    </div>
  );
}

export default connect(({ layoutConfig }) => ({
  layoutConfig
}))(IndexPage) 
