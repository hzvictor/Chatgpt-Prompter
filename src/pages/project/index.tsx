import styles from './index.less';
import { Button, Space, message, Card, Popconfirm } from 'antd';
import { useSnapshot } from 'valtio';
import {
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  BranchesOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Transforms, Editor } from 'slate';
import { getAllProjectListDB } from '@/database/project';
import Jazzicon from 'react-jazzicon';
const { Meta } = Card;
import { history, useModel } from 'umi';
import dayjs from 'dayjs';
import { getTargetOperations } from '@/database/operation';
import { getTargetProgectInfo, deleteProjectDB } from '@/database/root';
import relativeTime from 'dayjs/plugin/relativeTime';
import { activeProject, changeActiveProjectID } from '@/stores/project';
import { editors } from '@/stores/editors';
import { updateAllState } from '@/stores/index';
import { messageFunction } from '@/stores/globalFunction';
dayjs.extend(relativeTime);
const deleteText = 'Are you sure to delete this project';
const deleteDescription = 'cannot be restored after deletion.';

const editText = 'Do you need to switch editing items';
const editDescription = 'The current project is automatically saved';

export default ({
  showChildrenLogDrawer,
  childrenDetailDrawer,
  showChildrenDetailDrawer,
  open,
  onClose,
}: any) => {
  const { activeProjectID } = useSnapshot(activeProject);
  const messageApi = messageFunction.messageApi;

  const confirmDelete = (nanoid: string) => {
    // message.info('Clicked on Yes.');
    if (activeProjectID == nanoid) {
      messageApi.open({
        type: 'warning',
        content: 'Cannot delete the item being operated on',
      });
    } else {
      deleteProjectDB(nanoid).then((res) => {
        if (res) {
          messageApi.info('Delete success');
          getAllProjectListDB().then((arr) => {
            setList(arr);
          });
        }
      });
    }
  };


  const confirmEdit = async (nanoid: string) => {

  };

  const confirmEditWrap = async (nanoid: string) => {
    try {
      await confirmEdit(nanoid);
      history.push('/editor/chat/3.5/prompt');
    } catch (error) {
      activeProject.globalState = 1;
      // onClose();
      console.log(error)
      messageApi.info('Change error');
    }
  };

  const [list, setList] = useState([]);

  useEffect(() => {
    getAllProjectListDB().then((arr) => {
      setList(arr);
    });
  }, [open, childrenDetailDrawer]);

  function textToDecimal(text: string) {
    let decimal = '';
    // Step 1: 截取前五个字符
    let substring = text.substring(0, 5);
    for (let i = 0; i < substring.length; i++) {
      // Step 2
      let charCode = substring.charCodeAt(i);
      // Step 3
      let charDecimal = charCode.toString(10);
      // Step 4
      decimal += charDecimal;
    }
    return parseInt(decimal);
  }

  return (
    <div className={styles.projectContainer}>
      <div className={styles.cardContainer} >
        {list?.map((item: any, index) => {
          return (
            <Card
              hoverable
              style={{ width: 300 }}
              key={index}
              // style={{
              //   border:
              //     activeProjectID == item.nanoid ? '3px solid #00AA90 ' : '',
              // }}
              cover={
                <div className={styles.cover}>
                  <Jazzicon
                    diameter={300}
                    paperStyles={{ marginTop: '-55px' }}
                    seed={textToDecimal(item.nanoid)}
                  />
                </div>
              }
              actions={[
                <EditOutlined key="edit" onClick={() => { confirmEditWrap(item.nanoid) }} />,
                <BranchesOutlined
                  key="branches"
                  onClick={showChildrenLogDrawer}
                />,
                <SettingOutlined
                  key="setting"
                  onClick={() => {
                    showChildrenDetailDrawer(item);
                  }}
                />,
                <Popconfirm
                  placement="bottomLeft"
                  key="delete"
                  title={deleteText}
                  description={deleteDescription}
                  onConfirm={() => {
                    confirmDelete(item.nanoid);
                  }}
                  okText="Yes"
                  cancelText="No"
                >
                  <DeleteOutlined />
                </Popconfirm>,
              ]}
            >
              <Meta
                //   avatar={
                //     <Jazzicon diameter={30} seed={textToDecimal(item.nanoid)} />
                //   }
                title={item.name}
                description={
                  <>
                    <div>{item.descripe != '' ? item.descripe : '...'}</div>
                    <div>{dayjs(item.creatData).fromNow()}</div>
                  </>
                }
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
};
// .fromNow()
