import styles from './index.less';
import { useSnapshot } from 'valtio';
import activeMessagetore from '@/stores/activeMessage';
import { useEffect, useState } from 'react';
import { message } from 'antd';
export default ({ element, children }: any) => {
  const [messageApi, contextHolder] = message.useMessage();
  const { activeMessageState } = activeMessagetore;
  // const { activeMessageList } = activeMessageState;
  const { activeMessageList, activeGroupId } = useSnapshot(activeMessageState);

  const genurateBoxshadow = () => {
    if (!constisSelfCanModify()) return '';
    let boxShadow = '';
    const activeGroupData = activeMessageList[activeGroupId];
    if (!activeGroupData) return;
    const item = activeGroupData.clolorList[element.id];
    const active = item.active;
    const color = item.color;

    if (activeMessageList[activeGroupId].state != 2) {
      if (active) {
        boxShadow = `0 0 0 ${2}px ${color} inset`;
      } else {
        if (element.children[0].text.trim().length != 0) {
          boxShadow = `0 0 0 ${2}px #eee inset`;
        }
      }
    }

    return boxShadow;
  };

  const changeSelfState = () => {
    if (!constisSelfCanModify()) return;
    const loading = getIsLoading();
    const activeGroupData = activeMessageState.activeMessageList[activeGroupId];
    if (activeGroupData.state == 0) {
      if (element.children[0].text.trim().length == 0) {
        // messageApi.info('Cant select no text item');
        return;
      }
      if (loading) {
        // messageApi.info('Cant change loding element state');
        return;
      }

      activeGroupData.clolorList[element.id].active =
        !activeGroupData.clolorList[element.id].active;
    }
  };

  const constisSelfCanModify = () => {
    // if activeGroupId == ''
    if (activeGroupId) {
      const activeGroupData = activeMessageList[activeGroupId];
      if (activeGroupData?.clolorList) {
        const item = activeGroupData.clolorList[element.id];
        if (item) {
          return true;
        }
      }
    }
    return false;
  };

  const getIsLoading = () => {
    if (!constisSelfCanModify()) return false;
    const activeGroupData = activeMessageList[activeGroupId];
    if (activeMessageList[activeGroupId].state == 1) {
      if (activeGroupData.clolorList[element.id].active) {
        return true;
      }
    }
    return false;
  };

  const [boxShadow, setBoxshow] = useState(``);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const boxShadow = genurateBoxshadow();
    const loading = getIsLoading();
    setBoxshow(boxShadow);
    setLoading(loading);
  }, [activeMessageList, activeGroupId]);

  return (
    <>
      {contextHolder}
      <div
        onClick={changeSelfState}
        className={`${styles.itemBorder} ${loading && styles.breathAnimation}`}
        style={{ boxShadow: boxShadow }}
      >
        {children}
      </div>
    </>
  );
};
