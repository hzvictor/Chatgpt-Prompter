import styles from './index.less';
import { Button, Drawer, message } from 'antd';
import { KeepAlive, history } from 'umi';
import { Graph, Shape } from '@antv/x6';
import { register } from '@antv/x6-react-shape';
import { Color, NodeView } from '@antv/x6';
import { willHaveCycle } from '@/utils/graph'
import {
  RightOutlined,
  LeftOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import CodeEditor from '@/components/apureComponents/codeEditor';
import Chat from '@/components/chats';
import Test from '@/components/editorBrothers/test';
import { upOrLeftState } from '@/stores/globalFunction';
import { graphState, dreawerState } from '@/stores/graph';
import FixHeader from './components/fixHeader';
import { debounce } from '@/utils/little';
import DndNode from './components/dndNode';
import initgraph from './init';
import { storeGraphs, getTargetGraphs } from '@/database/graph';
import { activeProject } from '@/stores/project';
import { MiniMap } from '@antv/x6-plugin-minimap';
import registerGraph from './register';
import { currentFunction } from '@/stores/function'
import botStore from '@/stores/bot'
const { botState } = botStore
import { getGraphTree, getFunctionMap, updateShotCut, piplineAllFunction, getRealData, filterUsefulInfo } from '@/utils/graphUtils';
import { chatFunction } from '@/stores/globalFunction';
const newGraph = registerGraph(Graph);

export default function IndexPage() {
  const ref: any = useRef(null);
  const refMiniMap: any = useRef(null);
  const timeIntervelPoint: any = useRef(null);
  const [openLeft, setOpenLeft] = useState(dreawerState.openLeft);
  const [openRight, setOpenRight] = useState(dreawerState.openRight);
  const [openCode, setOpenCode] = useState(dreawerState.openCode);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);





  // function createTreeFromList(list: any) {
  //   [
  //     { sourceid: 12, targetid: 15 },
  //     { sourceid: 12, targetid: 18 },
  //     { sourceid: 15, targetid: 19 },
  //     { sourceid: 23, targetid: 25 },
  //   ]
  // {
  //   '12':{
  //     "15":{
  //       "19":{}
  //     },
  //     "18":{},
  //   },
  //   "23":{
  //     "25":{}
  //   }
  // }
  // }


  useEffect(() => {
    setWidth(ref?.current?.offsetWidth);
    setHeight(ref?.current?.offsetHeight);

    graphState.graph = new newGraph({
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

          if (willHaveCycle(graphState.graph, sourceCell, targetCell)) {
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
    const graph = graphState.graph;
    graph.use(
      new MiniMap({
        container: refMiniMap?.current,
        width: ref?.current?.offsetWidth / 6,
        height: ref?.current?.offsetHeight / 6,
        padding: 10,
      }),
    );

    initgraph(graph, ref?.current?.childNodes[1]);

    // console.log(graph, 11111)
    getTargetGraphs(activeProject.activeProjectID).then((res: any) => {


      // console.log(JSON.parse(res[0].json), 6666)
      if (res && res[0]) {
        graph.fromJSON(JSON.parse(res[0].json));
      } else {
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

        // test.appendLabel({
        //   attrs: {
        //     text: {
        //       text: 'hahha',
        //     },
        //   },
        //   position: {
        //     distance: 0.25,
        //   },
        // })

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


        const FirstTimeEntry = graph.addNode({
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
    });

    // const storeGraphJsonDebonce = () => {
    //   console.log('change debouns');
    //   return debounce(() => {
    //     console.log('change debouns');
    //     // console.log(graph.toJSON())
    //     storeGraphs('1111', { json: JSON.stringify(graph.toJSON()) });
    //   }, 200)();
    // };
    timeIntervelPoint.current = setInterval(async () => {
      const graphJson = graph.toJSON()

      storeGraphs(activeProject.activeProjectID, { json: JSON.stringify(graphJson) });
      updateShotCut(graphJson.cells)
      await updataInfoTOBot()
    }, 1000);

    // graph.on('view:mounted', () => {
    //   updateShotCut(graph.toJSON().cells)
    // });
    // graph.on('cell:change:*', () => {

    // });
    // graph.on('cell:selected', storeGraphJsonDebonce());

    // graph.on('cell:removed', ({ cell, index, options }: any) => {
    //   storeGraphJsonDebonce();
    // });

    graph.centerContent();
  }, []);

  // function deleteTimeIntervel(e:any) {
  //   console.log("delete timeout")
  //   clearInterval( timeIntervelPoint.current)
  // }

  // useEffect(() => {
  //   // 拦截判断是否离开当前页面
  //   window.addEventListener('beforeunload', deleteTimeIntervel);
  // }, [])

  const showDefaultDrawerRight = () => {
    setOpenRight(true);
    dreawerState.openRight = true;
  };

  const onCloseRight = () => {
    setOpenRight(false);
    dreawerState.openRight = false;
  };
  const showDefaultDrawerLeft = () => {
    setOpenLeft(true);
    dreawerState.openLeft = true;
  };

  const onCloseLeft = () => {
    setOpenLeft(false);
    dreawerState.openLeft = false;
  };
  const showDefaultCode = (id = '', type = 'trigger',) => {
    setOpenCode(true);
    currentFunction.id = id
    currentFunction.type = type
    dreawerState.openCode = true;
  };

  async function updataInfoTOBot() {
    const nodeList = graphState.graph.toJSON()
    const { tree, nodes, relationshp } = getGraphTree(nodeList.cells)
    const functionMap = await getFunctionMap(nodeList.cells, nodes)
    botState.functionmap = Object.fromEntries(functionMap);

    const quickRepliesFunctionTree: any = {}
    for (let index = 0; index < Object.keys(tree).length; index++) {
      
      const element = Object.keys(tree)[index];
      // console.log(element,111111)
      // console.log(functionMap.get(element).type,111111)
      if (functionMap.get(element).type == 'userInput') {
        botState.userFunctionTree = tree[element]
      } else if (functionMap.get(element).type == 'assistantInput') {
        botState.botFunctionTree = tree[element]
      } else if (functionMap.get(element).type == 'firstTimeEntry') {
        botState.firstTimeEntryTree = tree[element]
      } else if (functionMap.get(element).type == 'shortcutStatement') {
        quickRepliesFunctionTree[functionMap.get(element).id] = tree[element]
      }
    }
    botState.quickRepliesFunctionTree = quickRepliesFunctionTree
  }

  const playTest = async () => {
    await updataInfoTOBot()
    showDefaultDrawerRight()

    chatFunction.startTest()
  }

  const pauseTest = () => {
    console.log('pauseTest')
  }

  graphState.showDefaultCode = showDefaultCode;

  graphState.playTest = playTest
  graphState.pauseTest = pauseTest

  const onCloseCode = () => {
    setOpenCode(false);
    dreawerState.openCode = false;
  };

  const closeAllDreaw = () => {
    setOpenCode(false);
    setOpenLeft(false);
    setOpenRight(false);
    clearInterval(timeIntervelPoint.current);
  };

  useEffect(() => {
    setOpenCode(dreawerState.openCode);
    setOpenLeft(dreawerState.openLeft);
    setOpenRight(dreawerState.openRight);
  }, []);

  return (
    <div className={styles.container} ref={ref}>
      <FixHeader closeAllDreaw={closeAllDreaw}></FixHeader>
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
        <DndNode></DndNode>
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
          <Chat></Chat>
        </div>
        <br />
        <div className={styles.testContainer}>
          <Test></Test>
        </div>
      </Drawer>
      {!openRight && (
        <Button
          // onClick={showDefaultCode}
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
        <CodeEditor onCloseCode={onCloseCode}></CodeEditor>
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
