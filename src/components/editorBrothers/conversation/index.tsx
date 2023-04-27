import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
} from 'react';
import { createEditor, Transforms, Editor } from 'slate';
import {
  Slate,
  withReact,
  Editable,
  ReactEditor,
  DefaultElement,
} from 'slate-react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { withHistory } from 'slate-history';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSnapshot, subscribe } from 'valtio';
import { activeProject } from '@/stores/project';
import editorComponents from '@/components/apureComponents/editors';
import { createPortal } from 'react-dom';
import { withNodeIdAndRole } from '@/utils/withNodeId';
import conversationStore from '@/stores/conversation';
import ColorOptionList from '@/components/apureComponents/colorOptionList';
import styles from './index.less';
import { editors } from '@/stores/editors';
import { Col, Row, Switch, Space, Segmented, Button } from 'antd';
import {
  storeOperations,
  getTargetOperations,
  updateOperations,
  deleteTargetOperations,
} from '@/database/operation';
import TabList from '@/components/apureComponents/tabList';
import {
  storeConversation,
  getTargetConversationsWithFatherid,
  deleteTargetConversations,
} from '@/database/conversation';
import { tabData,activeTabListId } from '@/stores/tablist';
import { makeNodeId } from '@/utils/withNodeId';
import { async } from '@antv/x6/lib/registry/marker/async';

const { DragOverlayContent, SortableElement, renderElementContent } =
  editorComponents;

const useEditor = () =>
  useMemo(
    () =>
      withNodeIdAndRole(withHistory(withReact(createEditor())), 'conversation'),
    [],
  );
export default function App() {
  const editor = useEditor();
  const { globalState } = useSnapshot(activeProject);

  const ref: any = useRef(null);
  editors.conversation = editor;
  const { conversationState, updateConversationMessage } = conversationStore;

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
    // console.log(val,'changele')
    updateConversationMessage(val);
  };
  useEffect(() => {
    getTargetOperations({
      type: 'conversation',
      fatherid: activeProject.activeProjectID,
      typeid: tabData.activeTabListId.conversationId,
    }).then((res) => {
      if (!res) {
        storeOperations({
          nanoid: makeNodeId(),
          type: 'conversation',
          fatherid: activeProject.activeProjectID,
          typeid: tabData.activeTabListId.conversationId,
          history: '',
        });
      } else {
        if (res.history != '') {
          editor.history = JSON.parse(res.history);
        }
      }
    });
  }, []);

  subscribe(conversationStore.conversationState, () => {
    if (globalState == 1) {
      updateOperations({
        type: 'conversation',
        fatherid: activeProject.activeProjectID,
        typeid: tabData.activeTabListId.conversationId,
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
    // console.log('addd',id,activeProject.activeProjectID)
    await storeConversation(id, {
      fatherid: activeProject.activeProjectID,
      message: [],
    });
    
    activeProject.globalState = 0;
    const conversationStartNode = Editor.start(editors.conversation, []);
    const conversationEndNode = Editor.end(editors.conversation, []);
    Transforms.delete(editors.conversation, {
      at: {
        anchor: conversationStartNode,
        focus: conversationEndNode,
      },
    });
    // conversationStore.conversationState.message.splice(0,conversationStore.conversationState.message.length)
    Transforms.setNodes(
      editor,
      { id: makeNodeId(), role: 'user', children: [{text:''}] },
      {
        at:[0]
      },
    );

    editors.conversation.history = {
      redos: [],
      undos: [],
    };
    await storeOperations({
      nanoid: makeNodeId(),
      type: 'conversation',
      fatherid: activeProject.activeProjectID,
      typeid: id,
      history: '',
    });
    activeProject.globalState = 1;
  };
  const changeTab = async (id: string) => {
    const conversationStateResult = await getTargetConversationsWithFatherid(
      id,
      activeProject.activeProjectID,
    );
    // console.log('switch',activeProject.activeProjectID,id,conversationStateResult)
    const operationHistory = await getTargetOperations({
      type: 'conversation',
      fatherid: activeProject.activeProjectID,
      typeid: id,
    });
    activeProject.globalState = 0;
    const conversationStartNode = Editor.start(editors.conversation, []);
    const conversationEndNode = Editor.end(editors.conversation, []);

    await Transforms.delete(editors.conversation, {
      at: {
        anchor: conversationStartNode,
        focus: conversationEndNode,
      },
    });
    if (conversationStateResult) {
      conversationStateResult.message.forEach((item: any, index: number) => {
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
      editors.conversation.history = JSON.parse(operationHistory.history);
    }
    activeProject.globalState = 1;
  };

  const removeTab = async (id: string) => {
    await deleteTargetConversations(id, activeProject.activeProjectID);
    await deleteTargetOperations({
      type: 'conversation',
      fatherid: activeProject.activeProjectID,
      typeid: id,
    });
  };

  return (
    <div className={styles.container}>
      <Row>
        <Col span={24}>
          <TabList
            defaultName="Conversation"
            addNewTab={addNewTab}
            changeTab={changeTab}
            removeTab={removeTab}
            activeKeyName="conversationId"
          ></TabList>
        </Col>
      </Row>
      <Row
        justify="space-between"
        align="middle"
        // style={{ marginTop: '10px', height: '30px' }}
      >
        <Col>
          <ColorOptionList></ColorOptionList>
        </Col>
      </Row>
      <div ref={ref}>
        <Slate
          editor={editor}
          value={conversationState.message}
          onChange={change}
        >
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
                onKeyDown={(event) => {
                  if (event.key === '&') {
                    // 防止插入 `&` 字符。
                    // event.preventDefault();
                    // 事件发生时执行 `insertText` 方法。
                    // editor.insertText('and');
                  }
                }}
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
    </div>
  );
}
