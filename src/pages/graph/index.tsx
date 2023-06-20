import styles from './index.less';
import { Button, Drawer, message } from 'antd';
import { Graph, Shape } from '@antv/x6';
import { willHaveCycle } from '@/utils/graph'
import {
  RightOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { getProjectChatbot, updateChatbotDetail } from '@/database/prompter/chatbot'
import CodeEditor from '@/components/apureComponents/codeEditor';
import Chat from '@/components/chat';
import Test from '@/components/test';
import FixHeader from './components/fixHeader';
import DndNode from './components/dndNode';
import initgraph from './init';

import { MiniMap } from '@antv/x6-plugin-minimap';
import registerGraph from './register';
import { updataInfoToBot, updateShotCut } from '@/utils/graphUtils';
import { fakeHooks } from '@/stores/fakehooks';
import { graphState } from '@/stores/graph';
const newGraph = registerGraph(Graph);

export default function IndexPage({ match }: any) {
  const ref: any = useRef(null);
  const refMiniMap: any = useRef(null);
  const timeIntervelPoint: any = useRef(null);
  const [openLeft, setOpenLeft] = useState(true);
  const [openRight, setOpenRight] = useState(true);
  const [openCode, setOpenCode] = useState(false);
  const [graph, setGraph] = useState()
  const [codeConfig, setCodeConfig] = useState()
  const projectid = match.params.projectid ? match.params.projectid : '123'
  const graphType = match.params.type ? match.params.type : '123'


  useEffect(() => {


    const graph = new newGraph({
      container: ref?.current?.childNodes[1],
      width: ref?.current?.offsetWidth,
      height: ref?.current?.offsetHeight,
      grid: true,
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
        minScale: 0.5,
        maxScale: 5,
      },
      connecting: {
        router: 'manhattan',
        connector: {
          name: 'rounded',
          args: {
            radius: 8,
          },
        },
        anchor: 'center',
        connectionPoint: 'anchor',
        allowBlank: false,
        allowMulti: false,
        allowLoop: false,
        snap: {
          radius: 20,
        },
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: '#A2B1C3',
                strokeWidth: 2,
                targetMarker: {
                  name: 'block',
                  width: 12,
                  height: 8,
                },
              },
            },
            zIndex: 0,
          });
        },
        validateConnection({
          sourceCell,
          targetCell,
          sourceMagnet,
          targetMagnet,
        }: any) {
          if (targetMagnet) {
            if (targetMagnet.getAttribute) {
              var fill = targetMagnet.getAttribute("fill");
              if (fill != '#fff') {
                return false
              }
            }
          }


          if (
            sourceCell.shape == 'main-rect' &&
            targetCell.shape == 'main-rect'
          ) {
            return false;
          }
          if (targetCell.shape == 'main-rect') {
            return false;
          }

          if (
            sourceCell.shape == 'shortcut-statement-node' &&
            targetCell.shape == 'shortcut-statement-node'
          ) {
            return false;
          }
          if (targetCell.shape == 'shortcut-statement-node') {
            return false;
          }

          if (willHaveCycle(graph, sourceCell, targetCell)) {
            return false;
          } else {
            return true;
          }


          return !!targetMagnet;
        },
      },
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#00aa90',
              stroke: '#00aa90',
            },
          },
        },
      },
      interacting: {
        vertexDeletable: true,
        arrowheadMovable: true,
        edgeMovable: true,
      },
      // interacting: function (cellView: any) {
      //   if (cellView.cell.getData() != undefined && !cellView.cell.getData().disableDelete) {
      //     return { vertexDeletable: false }
      //   }
      //   return true
      // }
    });

    setGraph(graph)

    graph.use(
      new MiniMap({
        container: refMiniMap?.current,
        width: ref?.current?.offsetWidth / 6,
        height: ref?.current?.offsetHeight / 6,
        padding: 10,
      }),
    );

    initgraph(graph, ref?.current?.childNodes[1]);

    console.log(projectid, graphType)

    if (graphType == 'chatbot') {

      getProjectChatbot(projectid).then((res: any) => {
        if (res) {
          if (res.graphJson) {
            graph.fromJSON(JSON.parse(res.graphJson));
          } else {
            init()
          }

          startUpdateInfo(res.nanoid)

        } else {
          message.info('chatbot not exit ')
        }
      })


    }



    const init = () => {
      const UserSendMessage = graph.addNode({
        x: -230,
        y: -360,
        shape: 'main-rect',
        label: 'User Send Message',
        data: {
          type: 'userInput'
        },
        ports: {
          items: [
            {
              id: 'port_1',
              group: 'top',
            },
            {
              id: 'port_6',
              group: 'right',
            },
            {
              id: 'port_7',
              group: 'bottom',
            },
            {
              id: 'port_8',
              group: 'left',
            },
          ],
        },

      });
      const UserMessageOutput = graph.addNode({
        x: -230,
        y: 360,
        shape: 'main-rect',
        label: 'User Message Output',
        data: {
          type: 'userOutput'
        },
        attrs: {
          body: {
            rx: 6,
            ry: 6,
          },
        },
        ports: {
          items: [
            {
              id: 'port_3',
              group: 'top',
            },
          ],
        },
        // tools: ['node-editor'],
      });

      graph.addEdge({
        source: { cell: UserSendMessage, port: 'port_7' }, // 源节点
        target: { cell: UserMessageOutput, port: 'port_3' }, // 源节点 , // 目标节点
        data: {
          disableSelect: false,
        },
      });


      const AssistanSendMessaget = graph.addNode({
        x: 170,
        y: -360,
        shape: 'main-rect',
        label: 'Assistant Send Message',
        attrs: {
          text: {
            fontSize: 13,
          },
        },
        data: {
          type: 'assistantInput'
        },
        ports: {
          items: [
            {
              id: 'port_11',
              group: 'top',
            },
            {
              id: 'port_16',
              group: 'right',
            },
            {
              id: 'port_17',
              group: 'bottom',
            },
            {
              id: 'port_18',
              group: 'left',
            },
          ],
        },
      });


      graph.addNode({
        x: 500,
        y: -360,
        shape: 'main-rect',
        label: 'First Time Entry',
        data: {
          type: 'firstTimeEntry'
        },
        ports: {
          items: [
            {
              id: 'port_11',
              group: 'top',
            },
            {
              id: 'port_16',
              group: 'right',
            },
            {
              id: 'port_17',
              group: 'bottom',
            },
            {
              id: 'port_18',
              group: 'left',
            },
          ],
        },
      });

      const AssistanMessageOutput = graph.addNode({
        x: 170,
        y: 360,
        shape: 'main-rect',
        label: 'Assistant Message Output',
        data: {
          type: 'assistantOutput'
        },
        attrs: {
          text: {
            fontSize: 13,
          },
          body: {
            rx: 6,
            ry: 6,
          },
        },
        ports: {
          items: [
            {
              id: 'port_19',
              group: 'top',
            },
          ],
        },
        // tools: ['node-editor'],
      });

      graph.addEdge({
        source: { cell: AssistanSendMessaget, port: 'port_17' }, // 源节点
        target: { cell: AssistanMessageOutput, port: 'port_19' }, // 源节点 , // 目标节点
        data: {
          disableSelect: false,
        },
      });
    }


    const startUpdateInfo = (nanoid: string) => {
      timeIntervelPoint.current = setInterval(async () => {
        // console.log('update')
        const graphJson = graph.toJSON()
        const shotCut = await updateShotCut(graphJson.cells)
        const allOfTree = await updataInfoToBot(graphJson.cells)

        updateChatbotDetail(nanoid, { graphJson: JSON.stringify(graphJson), quickReplies: shotCut, ...allOfTree });
        fakeHooks.setQuickReplies(shotCut)
      }, 1000);
    }

    graph.centerContent();

  }, [projectid]);





  const showDefaultDrawerRight = () => {
    setOpenRight(true);
  };

  const onCloseRight = () => {
    setOpenRight(false);
  };
  const showDefaultDrawerLeft = () => {
    setOpenLeft(true);
  };

  const onCloseLeft = () => {
    setOpenLeft(false);
  };

  const showCodeDrawer = (id: string, type: string) => {
    setCodeConfig({
      id, type
    })
    setOpenCode(true);
  };
  graphState.showDefaultCode = showCodeDrawer

  const onCloseCode = () => {
    setOpenCode(false);
  };

  const clearAllInterval = () => {
    clearInterval(timeIntervelPoint.current);
  };



  return (
    <div className={styles.container} ref={ref}>
      <FixHeader graph={graph} clearAllInterval={clearAllInterval}></FixHeader>
      <div id="container"></div>
      <Drawer
        closeIcon={null}
        headerStyle={{ border: 'none', height: 0, padding: 0 }}
        mask={false}
        placement="left"
        onClose={onCloseLeft}
        open={openLeft}
      >
        {openLeft && (
          <Button
            style={{ position: 'absolute', right: '-38px', top: '12px' }}
            type="primary"
            icon={<LeftOutlined />}
            shape="circle"
            onClick={onCloseLeft}
            className={styles.hoverButton}
          ></Button>
        )}
        <DndNode graph={graph}></DndNode>
      </Drawer>
      {!openLeft && (
        <Button
          onClick={showDefaultDrawerLeft}
          style={{ position: 'fixed', left: '10px', top: '10px' }}
          type="primary"
          shape="circle"
          icon={<RightOutlined />}
        ></Button>
      )}

      <Drawer
        closeIcon={null}
        mask={false}
        headerStyle={{ border: 'none', height: 0, padding: 0 }}
        placement="right"
        onClose={onCloseRight}
        open={openRight}
        width={390}
      >
        {openRight && (
          <Button
            type="primary"
            className={styles.hoverButton}
            icon={<RightOutlined />}
            shape="circle"
            style={{ position: 'absolute', left: '-38px', top: '12px' }}
            onClick={onCloseRight}
          ></Button>
        )}
        <div className={styles.chatContainer}>
          <Chat projectid={projectid}></Chat>
        </div>
        <br />
        <div className={styles.testContainer}>
          <Test projectid={projectid} ></Test>
        </div>
      </Drawer>
      {!openRight && (
        <Button
          onClick={showDefaultDrawerRight}
          style={{ position: 'fixed', right: '10px', top: '10px' }}
          type="primary"
          shape="circle"
          icon={<LeftOutlined />}
        ></Button>
      )}

      <Drawer
        closeIcon={null}
        mask={false}
        headerStyle={{ border: 'none', height: 0, padding: 0 }}
        placement="right"
        onClose={onCloseCode}
        bodyStyle={{ padding: '0px' }}
        // open={true}
        open={openCode}
        size="large"
      >
        <CodeEditor codeConfig={codeConfig} onCloseCode={onCloseCode}></CodeEditor>
        {openCode && (
          <Button
            type="primary"
            className={styles.hoverButton}
            icon={<RightOutlined />}
            shape="circle"
            style={{ position: 'absolute', left: '-38px', bottom: '10px' }}
            onClick={onCloseCode}
          ></Button>
        )}
      </Drawer>
      <div className={styles.minimap} ref={refMiniMap}></div>
    </div>
  );
}
