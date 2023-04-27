import { Button } from 'antd';
import styles from './index.less';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createEditor, Transforms, Editor } from 'slate';
import { useSnapshot } from 'valtio';
import conversationStore from '@/stores/conversation';
import testStore from '@/stores/test';
import systemStore from '@/stores/system';
import { useModel } from 'umi';
import { editors } from '@/stores/editors';

export default ({ element }: any) => {
  const [role, setRole] = useState<string>('user');

  const changeRole = () => {
    if (element?.role == 'user') {
      Transforms.setNodes(
        editors.conversation,
        { id: element.id, role: 'assistant', children: element.children },
        {
          at: [],
          match: (node) => {
            return node.id === element.id;
          },
        },
      );
    } else if (element?.role == 'assistant') {
      Transforms.setNodes(
        editors.conversation,
        { id: element.id, role: 'user', children: element.children },
        {
          at: [],
          match: (node) => {
            return node.id === element.id;
          },
        },
      );
    }
  };

  return (
    <>
      {element?.role == 'user' || element?.role == 'assistant' ? (
        <Button
          onClick={changeRole}
          size="small"
          type="text"
          style={{ padding: '0px' }}
          className={styles.role}
        >
          {' '}
          {element?.role} :{' '}
        </Button>
      ) : (
        <></>
      )}
    </>
  );
};
