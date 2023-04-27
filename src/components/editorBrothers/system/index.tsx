import {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from 'react';
import { createEditor, Transforms, Editor } from 'slate';
import { withHistory } from 'slate-history';
import {
  Slate,
  withReact,
  Editable,
  ReactEditor,
  DefaultElement,
} from 'slate-react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { makeNodeId } from '@/utils/withNodeId';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { withNodeIdAndRole } from '@/utils/withNodeId';
import systemStore from '@/stores/system';
import styles from './index.less';
import { useModel } from 'umi';
import { useSnapshot, subscribe } from 'valtio';
import { activeProject } from '@/stores/project';
import { editors } from '@/stores/editors';
import editorComponents from '@/components/apureComponents/editors';
import { tabData } from '@/stores/tablist';
import {
  storeSystem,
  getTargetsyStemsWithFatherid,
  deleteTargetSystems,
} from '@/database/system';
import { Row, Col } from 'antd';
import TabList from '@/components/apureComponents/tabList';
import {
  storeOperations,
  getTargetOperations,
  updateOperations,
  deleteTargetOperations,
} from '@/database/operation';
import { async } from '@antv/x6/lib/registry/marker/async';
const { DragOverlayContent, SortableElement, renderElementContent } =
  editorComponents;
const useEditor = () =>
  useMemo(
    () => withNodeIdAndRole(withHistory(withReact(createEditor())), 'system'),
    [],
  );

export default function App() {
  const ref: any = useRef(null);
  const { globalState } = useSnapshot(activeProject);
  const editor = useEditor();
  editors.system = editor;
  const { systemState, updateSystemMessage } = systemStore;

  const { message } = systemState;

  const [activeId, setActiveId] = useState(null);
  const activeElement = editor.children.find((x) => x.id === activeId);

  const handleDragStart = (event: any) => {
    // event.nativeEvent.stopImmediatePropagation()
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
    ReactEditor.blur(editor);
    Transforms.deselect(editor);
    window.getSelection()?.empty();
  };

  const renderElement = useCallback((props) => {
    const isTopLevel = ReactEditor.findPath(editor, props.element).length === 1;

    return isTopLevel ? (
      <SortableElement
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
    updateSystemMessage(val);
  };

  useEffect(() => {
    getTargetOperations({
      type: 'system',
      fatherid: activeProject.activeProjectID,
      typeid: tabData.activeTabListId.systemId,
    }).then((res) => {
      if (!res) {
        storeOperations({
          nanoid: makeNodeId(),
          type: 'system',
          fatherid: activeProject.activeProjectID,
          typeid: tabData.activeTabListId.systemId,
          history: '',
        });
      } else {
        if (res.history != '') {
          editor.history = JSON.parse(res.history);
        }
      }
    });
  }, []);

  subscribe(systemStore.systemState, () => {
    if (globalState == 1) {
      updateOperations({
        type: 'system',
        fatherid: activeProject.activeProjectID,
        typeid: tabData.activeTabListId.systemId,
        history: JSON.stringify(editor.history),
      });
    } else {
      // console.log('没写入');
    }
  });

  useLayoutEffect(() => {
    ref.current.children[0].style.maxHeight = '30vh';
  }, []);

  const addNewTab = async (id: string) => {
    await storeSystem(id, {
      fatherid: activeProject.activeProjectID,
      isAsync: false,
      message: [],
    });

    activeProject.globalState = 0;
    const systemStartNode = Editor.start(editors.system, []);
    const systemEndNode = Editor.end(editors.system, []);
    Transforms.delete(editors.system, {
      at: {
        anchor: systemStartNode,
        focus: systemEndNode,
      },
    });
    editors.system.history = {
      redos: [],
      undos: [],
    };
    Transforms.setNodes(
      editor,
      { id: makeNodeId(), role: 'system', children: [{text:''}] },
      {
        at:[0]
      },
    );
    await  storeOperations({
      nanoid: makeNodeId(),
      type: 'system',
      fatherid: activeProject.activeProjectID,
      typeid: id,
      history: '',
    });
    activeProject.globalState = 1;
  };
  const changeTab = async (id: string) => {
    const systemStateResult = await getTargetsyStemsWithFatherid(
      id,
      activeProject.activeProjectID,
    );

    const operationHistory = await getTargetOperations({
      type: 'system',
      fatherid: activeProject.activeProjectID,
      typeid: id,
    });
    activeProject.globalState = 0;
    const systemStartNode = Editor.start(editors.system, []);
    const systemEndNode = Editor.end(editors.system, []);

    Transforms.delete(editors.system, {
      at: {
        anchor: systemStartNode,
        focus: systemEndNode,
      },
    });
    if (systemStateResult) {
      systemStateResult.message.forEach((item: any, index: number) => {
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

    if (operationHistory.history) {
      editors.system.history = JSON.parse(operationHistory.history);
    }
    activeProject.globalState = 1;
    //
  };

  const removeTab = async (id: string) => {
    await deleteTargetSystems(id, activeProject.activeProjectID);
    await  deleteTargetOperations({
      type: 'system',
      fatherid: activeProject.activeProjectID,
      typeid: id,
    });
  };

  return (
    <div className={styles.container}>
      {/* <div className={styles.title}> System</div> */}
      <Row>
        {/* <Col className={styles.headerTitle} span={5} > Parameter</Col> */}
        <Col span={24}>
          <TabList
            defaultName="System"
            addNewTab={addNewTab}
            changeTab={changeTab}
            removeTab={removeTab}
            activeKeyName="systemId"
          ></TabList>
        </Col>
      </Row>
      <div ref={ref}>
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
              <Editable renderElement={renderElement} />
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
    </div>
  );
}
