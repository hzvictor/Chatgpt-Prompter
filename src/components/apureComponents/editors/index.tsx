import { useCallback, useEffect, useMemo, useState } from 'react';
import { createEditor, Transforms } from 'slate';
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

import BorderColor from '@/components/apureComponents/borderColor';
import SortControl from '@/components/apureComponents/editors/sortControl';
import RoleControl from '@/components/apureComponents/editors/roleControl';
import GenurateContentButton from '@/components/apureComponents/editors/genurateContentButton';
import { createPortal } from 'react-dom';
import { withNodeId } from '@/utils/withNodeId';
import conversationStore from '@/stores/conversation';
import styles from './index.less';
import { useModel } from 'umi';
import { toPx } from '@/utils/editor.js';

const useEditor = () =>
  useMemo(() => withNodeId(withHistory(withReact(createEditor()))), []);

export const DragOverlayContent = ({ element }: any) => {
  const editor = useEditor();
  const [value] = useState([JSON.parse(JSON.stringify(element))]); // clone
  return (
    <BorderColor element={element}>
      <div className={styles.dragOverlay}>
        <div className={styles.itemWrap}>
          <div style={{ display: 'flex' }}>
            <SortControl editor={editor} element={element} />
            <RoleControl element={element} editor={editor} />
            <GenurateContentButton element={element} editor={editor} />
          </div>
          <div
            className={
              element.role == 'user' || element.role == 'assistant'
                ? styles.elementStyleConversation
                : element.role == 'test'
                ? styles.elementStyleTest
                : styles.elementStyleSystem
            }
          >
            <Slate editor={editor} value={value}>
              <Editable readOnly={true} renderElement={renderElementContent} />
            </Slate>
          </div>
        </div>
      </div>
    </BorderColor>
  );
};

const SortableElement = ({
  attributes,
  element,
  children,
  renderElement,
  editor,
}: any) => {
  const sortable = useSortable({ id: element.id });
  return (
    <div onMouseDown={(e) => e.stopPropagation()} {...attributes}>
      <div
        className={styles.sortable}
        {...sortable.attributes}
        ref={sortable.setNodeRef}
        style={{
          transition: sortable.transition,
          '--translate-y': toPx(sortable.transform?.y),
          pointerEvents: sortable.isSorting ? 'none' : undefined,
          opacity: sortable.isDragging ? 0 : 1,
        }}
      >
        <BorderColor element={element}>
          <div className={styles.itemWrap}>
            <div contentEditable={false} style={{ display: 'flex' }}>
              <SortControl
                editor={editor}
                element={element}
                sortable={sortable}
              />
              <RoleControl element={element} editor={editor} />
              <GenurateContentButton element={element} editor={editor} />
            </div>
            <div
              className={
                element.role == 'user' || element.role == 'assistant'
                  ? styles.elementStyleConversation
                  : element.role == 'test'
                  ? styles.elementStyleTest
                  : styles.elementStyleSystem
              }
            >
              {renderElement({ element, children })}
            </div>
          </div>
        </BorderColor>
      </div>
    </div>
  );
};

const SortableElementTest = ({
  attributes,
  element,
  children,
  renderElement,
  editor,
}: any) => {
  const sortable = useSortable({ id: element.id });
  return (
    <div onMouseDown={(e) => e.stopPropagation()} {...attributes}>
      <div
        className={styles.sortable}
        {...sortable.attributes}
        ref={sortable.setNodeRef}
        style={{
          transition: sortable.transition,
          '--translate-y': toPx(sortable.transform?.y),
          pointerEvents: sortable.isSorting ? 'none' : undefined,
          opacity: sortable.isDragging ? 0 : 1,
        }}
      >
        <div className={styles.itemTestWrap}>
          <div contentEditable={false} style={{ display: 'flex' }}>
            <SortControl
              editor={editor}
              element={element}
              sortable={sortable}
            />
            <RoleControl element={element} editor={editor} />
            <GenurateContentButton element={element} editor={editor} />
          </div>
          <div
            className={
              element.role == 'user' || element.role == 'assistant'
                ? styles.elementStyleConversation
                : element.role == 'test'
                ? styles.elementStyleTest
                : styles.elementStyleSystem
            }
          >
            {renderElement({ element, children })}
          </div>
        </div>
      </div>
    </div>
  );
};

const renderElementContent = (props: any) => {
  return <DefaultElement {...props} />;
};

export default {
  SortableElement,
  SortableElementTest,
  DragOverlayContent,
  renderElementContent,
};
