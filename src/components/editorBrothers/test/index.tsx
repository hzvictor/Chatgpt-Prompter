import {
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
} from 'react';
import { createEditor, Transforms, Editor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact, Editable, ReactEditor } from 'slate-react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import { withNodeIdAndRole } from '@/utils/withNodeId';
import testStore from '@/stores/test';
import styles from './index.less';
import { chatFunction } from '@/stores/globalFunction';
import { editors } from '@/stores/editors';
import {
  storeOperations,
  getTargetOperations,
  updateOperations,
  deleteTargetOperations,
} from '@/database/operation';
import editorComponents from '@/components/apureComponents/editors';
import { subscribe, useSnapshot } from 'valtio';
import { activeProject } from '@/stores/project';
import { Button, Switch, Tooltip, ConfigProvider, Row, Col } from 'antd';
import TabList from '@/components/apureComponents/tabList';
import {
  storeTest,
  getTargetTestsWithFatherid,
  deleteTargetTests,
} from '@/database/tests';
import { tabData } from '@/stores/tablist';
import { makeNodeId } from '@/utils/withNodeId';
const { DragOverlayContent, SortableElementTest, renderElementContent } =
  editorComponents;

const useEditor = () =>
  useMemo(
    () => withNodeIdAndRole(withHistory(withReact(createEditor())), 'test'),
    [],
  );

export default function App() {
  const ref: any = useRef(null);
  const { globalState } = useSnapshot(activeProject);
  const editor = useEditor();
  editors.test = editor;
  const { testState, updateTestMessage } = testStore;

  const { message } = testState;

  const { isAsync } = useSnapshot(testState);

  const [activeId, setActiveId] = useState(null);
  // const [isAsync, setIsAsync] = useState(false);
  const activeElement = editor.children.find((x) => x.id === activeId);

  const handleDragStart = (event: any) => {
    if (event.active) {
      clearSelection();
      setActiveId(event.active.id);
    }
  };

  const handleDragEnd = (event) => {
    const overId = event.over?.id;
    const overIndex = editor.children.findIndex((x) => x.id === overId);

    if (overId !== activeId && overIndex !== -1) {
      Transforms.moveNodes(editor, {
        at: [],
        match: (node) => node.id === activeId,
        to: [overIndex],
      });
    }
    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const clearSelection = () => {
    try {
      ReactEditor.blur(editor);
    } catch (error) {}
    Transforms.deselect(editor);
    window.getSelection()?.empty();
  };

  const renderElement = useCallback((props) => {
    let isTopLevel = true;
    try {
      isTopLevel = ReactEditor.findPath(editor, props.element).length === 1;
    } catch (error) {}

    return isTopLevel ? (
      <SortableElementTest
        {...props}
        editor={editor}
        renderElement={renderElementContent}
      />
    ) : (
      renderElementContent(props)
    );
  }, []);

  const items = useMemo(
    () => editor.children.map((element) => element.id),
    [editor.children],
  );
  const change = (val: any) => {
    updateTestMessage(val);
  };

  subscribe(testStore.testState, () => {
    if (globalState == 1) {
      updateOperations({
        type: 'test',
        fatherid: activeProject.activeProjectID,
        typeid: tabData.activeTabListId.testId,
        history: JSON.stringify(editor.history),
      });
    } else {
      // console.log('没写入');
    }
  });

  useEffect(() => {
    getTargetOperations({
      type: 'test',
      fatherid: activeProject.activeProjectID,
      typeid: tabData.activeTabListId.testId,
    }).then((res) => {
      if (!res) {
        storeOperations({
          nanoid: makeNodeId(),
          type: 'test',
          fatherid: activeProject.activeProjectID,
          typeid: tabData.activeTabListId.testId,
          history: '',
        });
      } else {
        if (res.history != '') {
          editor.history = JSON.parse(res.history);
        }
      }
    });
  }, []);

  useLayoutEffect(() => {
    ref.current.children[0].style.maxHeight = '10vh';
  }, []);

  const startTest = async () => {
    const message = testStore.testState.message;
    if (isAsync) {
      message.forEach((item: any) => {
        if (item.children[0].text.trim().length != 0) {
          chatFunction.handleSend('text', item.children[0].text, false);
        }
      });
    } else {
      for (let index = 0; index < message.length; index++) {
        const element = message[index];
        if (element.children[0].text.trim().length != 0) {
          await chatFunction.handleSend('text', element.children[0].text, true);
        }
      }
    }
  };

  chatFunction.startTest = startTest

  useHotkeys('ctrl+d', startTest);

  const addNewTab = async (id: string) => {
    await storeTest(id, {
      fatherid: activeProject.activeProjectID,
      isAsync: false,
      message: [],
    });

    activeProject.globalState = 0;
    const testStartNode = Editor.start(editors.test, []);
    const testEndNode = Editor.end(editors.test, []);
    Transforms.delete(editors.test, {
      at: {
        anchor: testStartNode,
        focus: testEndNode,
      },
    });
    testState.isAsync = false;
    editors.test.history = {
      redos: [],
      undos: [],
    };
    
    Transforms.setNodes(
      editor,
      { id: makeNodeId(), role: 'test', children: [{text:''}] },
      {
        at:[0]
      },
    );

    await storeOperations({
      nanoid: makeNodeId(),
      type: 'test',
      fatherid: activeProject.activeProjectID,
      typeid: id,
      history: '',
    });
    activeProject.globalState = 1;
  };
  const changeTab = async (id: string) => {
    const testStateResult = await getTargetTestsWithFatherid(
      id,
      activeProject.activeProjectID,
    );

    const operationHistory = await getTargetOperations({
      type: 'test',
      fatherid: activeProject.activeProjectID,
      typeid: id,
    });
    testState.isAsync = testStateResult.isAsync;
    activeProject.globalState = 0;
    const testStartNode = Editor.start(editors.test, []);
    const testEndNode = Editor.end(editors.test, []);

    Transforms.delete(editors.test, {
      at: {
        anchor: testStartNode,
        focus: testEndNode,
      },
    });
    if (testStateResult) {
      testStateResult.message.forEach((item: any, index: number) => {
        if (index == 0){
          Transforms.setNodes(
            editor,
            { id: item.id, role: item.role, children : [{text:""}] },
            {
              at:[0]
            },
          );
          Transforms.insertText(editor, item.children[0].text, {
            at: { path: [0, 0], offset: 0 },
          });
        }else{
          Editor.insertNode(editor, item);
        }
      });
    }



    if (operationHistory?.history) {
      editors.test.history = JSON.parse(operationHistory.history);
    }
    activeProject.globalState = 1;
    //
  };
  const removeTab = async (id: string) => {
    await deleteTargetTests(id, activeProject.activeProjectID);
    await  deleteTargetOperations({
      type: 'test',
      fatherid: activeProject.activeProjectID,
      typeid: id,
    });
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00AA90',
        },
      }}
    >
      <div  className={`componentContainer  ${styles.container}`}>
        <Row>
          {/* <Col className={styles.headerTitle} span={5} > Parameter</Col> */}
          <Col span={24}>
            <TabList
              defaultName="Test"
              addNewTab={addNewTab}
              changeTab={changeTab}
              removeTab={removeTab}
              activeKeyName="testId"
            ></TabList>
          </Col>
        </Row>
        <Row justify="end" style={{ paddingRight: '10px' }}>
          <Tooltip
            title="In synchronous mode, it will be tested according to the input order,
Asynchronous mode will send both"
            color="lime"
          >
            <div className={styles.model}>
              {' '}
              <span className={styles.modelName}>Synchronize</span>{' '}
              <Switch
                checked={isAsync}
                onChange={(val) => {
                  testState.isAsync = val;
                }}
                size="small"
              ></Switch>
            </div>
          </Tooltip>
        </Row>
        <div ref={ref} style={{ paddingRight: '10px' }}>
          <Slate editor={editor} value={message} onChange={change}>
            <DndContext
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={items}
                strategy={verticalListSortingStrategy}
              >
                <Editable
                  placeholder="请输入..."
                  renderElement={renderElement}
                />
              </SortableContext>

              {createPortal(
                <DragOverlay adjustScale={false}>
                  {activeElement && (
                    <DragOverlayContent element={activeElement} />
                  )}
                </DragOverlay>,
                document.body,
              )}
            </DndContext>
          </Slate>
        </div>
        <Tooltip title=" Hot Key ctrl + d" color="lime">
          <Button
            type="primary"
            onClick={startTest}
            className={styles.testButton}
          >
            {' '}
            Test
          </Button>
        </Tooltip>
      </div>
    </ConfigProvider>
  );
}
