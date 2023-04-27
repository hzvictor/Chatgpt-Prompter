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
import { useModel } from 'umi';
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
    if (activeProjectID == nanoid) {
      messageApi.open({
        type: 'warning',
        content: 'Already in the target project',
      });
    } else {
      activeProject.globalState = 0;
      const systemStartNode = Editor.start(editors.system, []);
      const systemEndNode = Editor.end(editors.system, []);
      const conversationStartNode = Editor.start(editors.conversation, []);
      const conversationEndNode = Editor.end(editors.conversation, []);
      const testStartNode = Editor.start(editors.test, []);
      const testEndNode = Editor.end(editors.test, []);
      // const project = await getTargetProjectDB(nanoid);
      const allInfo = await getTargetProgectInfo(nanoid);

      const {
        modifys,
        bots,
        messageHistorys,
        slideLists,
        logitBias,
        activeMessages,
        systems,
        tests,
        conversations,
        tabList,
        testHistory,
        systemHistory,
        conversationHistory,
      } = allInfo;
      // 处理下没查询到
      // if (project.length == 0) {
      //   messageApi.info('Project information is lost');
      //   return;
      // }

      editors.system.history = {
        redos: [],
        undos: [],
      };
      editors.conversation.history = {
        redos: [],
        undos: [],
      };
      editors.test.history = {
        redos: [],
        undos: [],
      };

      Transforms.delete(editors.system, {
        at: {
          anchor: systemStartNode,
          focus: systemEndNode,
        },
      });

      Transforms.delete(editors.conversation, {
        at: {
          anchor: conversationStartNode,
          focus: conversationEndNode,
        },
      });
      Transforms.delete(editors.test, {
        at: {
          anchor: testStartNode,
          focus: testEndNode,
        },
      });

      changeActiveProjectID(nanoid);

      updateAllState(
        activeMessages,
        slideLists,
        logitBias,
        bots,
        messageHistorys,
        modifys,
        tabList,
        tests
      );

      if (conversations) {
        const conversationReal = conversations;

        conversationReal.message.forEach((item: any, index: number) => {
          if (index == 0){
            Transforms.setNodes(
              editors.conversation,
              { id: item.id, role: item.role, children : [{text:""}] },
              {
                at:[0]
              },
            );
            Transforms.insertText( editors.conversation, item.children[0].text, {
              at: { path: [0, 0], offset: 0 },
            });
          }else{
            Editor.insertNode( editors.conversation, item);
          }
        });
      }
      if (systems) {
        const systemReal = systems;
        systemReal.message.forEach((item: any, index: number) => {
          if (index == 0){
            Transforms.setNodes(
              editors.system,
              { id: item.id, role: item.role, children : [{text:""}] },
              {
                at:[0]
              },
            );
            Transforms.insertText( editors.system, item.children[0].text, {
              at: { path: [0, 0], offset: 0 },
            });
          }else{
            Editor.insertNode( editors.system, item);
          }
        });
      }
      if (tests) {
        const testReal = tests;
        testReal.message.forEach((item: any, index: number) => {
          if (index == 0){
            Transforms.setNodes(
              editors.test,
              { id: item.id, role: item.role, children : [{text:""}] },
              {
                at:[0]
              },
            );
            Transforms.insertText(editors.test, item.children[0].text, {
              at: { path: [0, 0], offset: 0 },
            });
          }else{
            Editor.insertNode(editors.test, item);
          }
        });
      }


      if (testHistory?.history) {
        editors.test.history = JSON.parse(testHistory.history);
      }
      if (conversationHistory?.history) {
        editors.conversation.history = JSON.parse(conversationHistory.history);
      }
      if (systemHistory?.history) {
        editors.system.history = JSON.parse(systemHistory.history);
      }
      activeProject.globalState = 1;
      onClose();
    }
  };

  const confirmEditWrap = (nanoid: string) => {
    try {
      confirmEdit(nanoid);
    } catch (error) {
      activeProject.globalState = 1;
      onClose();
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
    <Space size="large" wrap>
      {list?.map((item: any, index) => {
        return (
          <Card
            hoverable
            style={{ width: 300 }}
            key={index}
            style={{
              border:
                activeProjectID == item.nanoid ? '3px solid #00AA90 ' : '',
            }}
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
              <Popconfirm
                placement="bottomLeft"
                key="delete"
                icon={<EditOutlined />}
                title={editText}
                description={editDescription}
                onConfirm={() => {
                  confirmEditWrap(item.nanoid);
                }}
                okText="Yes"
                cancelText="No"
              >
                <EditOutlined key="edit" />
              </Popconfirm>,
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
    </Space>
  );
};
// .fromNow()
