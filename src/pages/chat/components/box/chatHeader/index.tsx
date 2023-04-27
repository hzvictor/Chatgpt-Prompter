import styles from './index.less';
import { RedoOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useSnapshot } from 'valtio';
import botStore from '@/stores/bot';
import messageHistoryStore from '@/stores/messageHistory';
import { makeNodeId } from '@/utils/withNodeId';
import { storeMessageHistory } from '@/database/chatboxs/messageHistory'
import { activeBot,chatFunction } from '@/stores/chatboxs/activebot'
export default () => {
  const shotBotState = useSnapshot(botStore.botState);


  const  resetHistory = async () => {
    messageHistoryStore.messageHistoryState.list.splice(0, messageHistoryStore.messageHistoryState.list.length)
    botStore.botState.history.splice(0, botStore.botState.history.length)
    chatFunction.resetList()

    const id = makeNodeId();
    await storeMessageHistory(id, activeBot.activebotID)
    activeBot.activeMessageID = id

    chatFunction.resethistoryList(id)
    
    chatFunction.firstTimeEntry()
  }

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="Reset history">
          <RedoOutlined
            onMouseDown={(e) => e.stopPropagation()}
            className={styles.iconStyle}
            onClick={resetHistory}
          />
        </Tooltip>
      </div>
      <div>{shotBotState?.name}</div>
      <div></div>
    </div>
  );
};
