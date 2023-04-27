import styles from './index.less';
import { useSnapshot } from 'valtio';
import activeMessagetore from '@/stores/activeMessage';
import { useEffect, useState } from 'react';
import { ReactEditor } from 'slate-react';
import { message } from 'antd';
export default ({ element, sortable, editor }: any) => {
  const { activeMessageState } = activeMessagetore;
  const { activeMessageList, activeGroupId } = useSnapshot(activeMessageState);

  const changeSelfState = () => {
    if (!constisSelfCanModify()) return;
    const path = ReactEditor.findPath(editor, element);
    const activeGroupData = activeMessageState.activeMessageList[activeGroupId];
    activeGroupData.clolorList[element.id].path = path;
  };

  const constisSelfCanModify = () => {
    // if activeGroupId == ''
    if (activeGroupId) {
      const activeGroupData = activeMessageList[activeGroupId];
      if (!activeGroupData) return;
      const item = activeGroupData.clolorList[element.id];
      if (item) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    changeSelfState();
  }, [sortable]);

  return (
    <>
      <button {...sortable?.listeners} className={styles.control}>
        ⠿
      </button>
    </>
  );
};
