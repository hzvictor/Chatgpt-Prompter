import styles from './index.less';
import Chat from '@/components/chat';
import Tuning from '@/components/tuning';
import SlideList from '@/components/slideList2';
import Manager from '@/components/manager';
import Test from '@/components/test';
import Prompt from '@/components/prompt';
import GridLayout from 'react-grid-layout';
import { Button } from 'antd';
import { updateProjectDetail } from '@/database/prompter/project'
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { KeepAlive } from 'umi';
import { connect } from 'umi';



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

  }, [projectid]);



  const onLayoutChange = (layout: any) => {
    const newLayoutConfig = JSON.parse(JSON.stringify(layoutConfig))

    newLayoutConfig.layoutGrid = JSON.parse(JSON.stringify(layout))

    updateProjectDetail( {
      nanoid: projectid,
      data: { layoutConfig: newLayoutConfig }
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
              <Chat  projectid={projectid} ></Chat>
            </div>
          }
          {layoutConfig.showPrompt && <div className={styles.grad} key="prompt">
            <Prompt projectid={projectid} ></Prompt>
          </div>}
          {layoutConfig.showParameter && <div className={styles.grad} key="slideList">
            <SlideList  projectid={projectid} ></SlideList>
          </div>}
          <div className={styles.grad} key="manager">
            <Manager projectid={projectid}></Manager>
          </div>
          {layoutConfig.showTest && <div className={styles.grad} key="test">
            <Test projectid={projectid} ></Test>
          </div>}
        </GridLayout>
      </KeepAlive>
    </div>
  );
}

export default connect(({ layoutConfig }) => ({
  layoutConfig
}))(IndexPage) 
