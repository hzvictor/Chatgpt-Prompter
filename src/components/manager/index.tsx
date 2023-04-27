import styles from './index.less';
import {
  Button,
  Space,
  message,
  Drawer,
  Modal,
  Tour,
  Input,
  Row,
  Col,
} from 'antd';
import { Transforms, Editor } from 'slate';
import ProjectList from '../apureComponents/projectList';
import LogList from '@/components/apureComponents/logList';
import { makeNodeId } from '@/utils/withNodeId';
import { useModel } from 'umi';
import { useState, useRef } from 'react';
import type { TourProps } from 'antd';
import { updateProjectDetailDB } from '@/database/project';
import { addNewProgect } from '@/database/root';
import { resetAllState } from '@/stores/index';
import { activeProject, changeActiveProjectID } from '@/stores/project';
import { editors } from '@/stores/editors';
import { messageFunction } from '@/stores/globalFunction';
import { RedoOutlined } from '@ant-design/icons';
import { editorLayout } from '@/stores/editors';
import KeyTable from './keysTable'
import PublishModal from './publishModal';
const layoutGrid = [
  { w: 13, h: 24, x: 5, y: 0, i: 'conversation', moved: false, static: false },
  { w: 5, h: 8, x: 0, y: 2, i: 'system', moved: false, static: false },
  { w: 6, h: 19, x: 18, y: 0, i: 'chat', moved: false, static: false },
  { w: 5, h: 9, x: 0, y: 10, i: 'slideList', moved: false, static: false },
  { w: 5, h: 11, x: 0, y: 19, i: 'logitBias', moved: false, static: false },
  { w: 5, h: 2, x: 0, y: 0, i: 'manager', moved: false, static: false },
  { w: 13, h: 6, x: 5, y: 24, i: 'logs', moved: false, static: false },
  { w: 6, h: 11, x: 18, y: 19, i: 'test', moved: false, static: false },
];

const { TextArea } = Input;
export default function IndexPage() {
  const messageApi = messageFunction.messageApi;
  const [open, setOpen] = useState(false);
  const [openGuid, setOpenGuid] = useState<boolean>(false);
  const [childrenLogDrawer, setChildrenLogDrawer] = useState(false);
  const [childrenDetailDrawer, setChildrenDetailDrawer] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKeysModalOpen, setIsKeysModalOpen] = useState(false);
  const [isNewProjectModalOpen, setisNewProjectModalOpen] = useState(false);
  const [projecctName, setProjecctName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [activeItem, setActiveItem] = useState<Object>({});
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);

  const steps: TourProps['steps'] = [
    {
      title: 'Upload File',
      description: 'Put your files here.',
      cover: (
        <img
          alt="tour.png"
          src="https://user-images.githubusercontent.com/5378891/197385811-55df8480-7ff4-44bd-9d43-a7dade598d70.png"
        />
      ),
      target: () => ref1.current,
    },
    {
      title: 'Save',
      description: 'Save your changes.',
      target: () => ref2.current,
    },
    {
      title: 'Other Actions',
      description: 'Click to see other actions.',
      target: () => ref3.current,
    },
  ];

  const newProject = (projectName: string, description: string) => {
    activeProject.globalState = 0;

    const systemStartNode = Editor.start(editors.system, []);
    const systemEndNode = Editor.end(editors.system, []);
    const conversationStartNode = Editor.start(editors.conversation, []);
    const conversationEndNode = Editor.end(editors.conversation, []);
    const testStartNode = Editor.start(editors.test, []);
    const testEndNode = Editor.end(editors.test, []);

    const id = makeNodeId();
    const initTabId = makeNodeId();
    changeActiveProjectID(id);
    // add to database
    addNewProgect(id, projectName, description, initTabId);

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

    Transforms.setNodes(
      editors.conversation,
      { id: makeNodeId(), role: 'user', children: [{text:''}] },
      {
        at:[0]
      },
    );
    Transforms.setNodes(
      editors.system,
      { id: makeNodeId(), role: 'system', children: [{text:''}] },
      {
        at:[0]
      },
    );
    Transforms.setNodes(
      editors.test,
      { id: makeNodeId(), role: 'test', children: [{text:''}] },
      {
        at:[0]
      },
    );

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
    
    resetAllState(initTabId);

    activeProject.globalState = 1;
  };

  const newProjectWrap = (projectName: string, description: string) => {
    try {
      newProject(projectName, description);
    } catch (error) {
      console.log(error,1111)
      messageApi.info('Abnormal operation, new failed');
    }
  };

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const showChildrenLogDrawer = () => {
    setChildrenLogDrawer(true);
  };

  const onChildrenLogDrawerClose = () => {
    setChildrenLogDrawer(false);
  };
  const showChildrenDetailDrawer = (item: any) => {
    setDescription(item.descripe);
    setProjecctName(item.name);
    setActiveItem(item);
    setChildrenDetailDrawer(true);
  };

  const onChildrenDetailDrawerClose = () => {
    setChildrenDetailDrawer(false);
    updateProjectDetailDB(activeItem.nanoid, {
      name: projecctName,
      descripe: description,
    });
    setDescription('');
    setProjecctName('');
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const showKeysModal = () => {
    setIsKeysModalOpen(true);
  };

  const handleKeysOk = () => {
    
    setIsKeysModalOpen(false);
  };

  const handleKeysCancel = () => {
    setIsKeysModalOpen(false);
  };

  const showNewProjectModal = () => {
    // const systemStartNode = Editor.start(editors.system, []);
    // const systemEndNode = Editor.end(editors.system, []);
    // const conversationStartNode = Editor.start(editors.conversation, []);
    // const conversationEndNode = Editor.end(editors.conversation, []);
    // const testStartNode = Editor.start(editors.test, []);
    // const testEndNode = Editor.end(editors.test, []);

    // const nodeList = [
    //   systemStartNode,
    //   systemEndNode,
    //   conversationStartNode,
    //   conversationEndNode,
    //   testStartNode,
    //   testEndNode,
    // ];

    // const isBlankProject = nodeList.every(
    //   (item) => JSON.stringify(item?.path) == '[0,0]',
    // );
    // if (isBlankProject) {
    //   messageApi.info('Already a blank project');
    //   return;
    // }
    setisNewProjectModalOpen(true);
  };
  const handleNewProjectModalOk = () => {
    newProjectWrap(projecctName, description);
    setisNewProjectModalOpen(false);
    setDescription('');
    setProjecctName('');
  };

  const handleNewProjectModalCancel = () => {
    setisNewProjectModalOpen(false);
  };

  const resetLayout = async () => {
    editorLayout.layout = layoutGrid;
  };

  return (
    <>
      <div className={styles.container}>
        <Space wrap >
          <Button
            shape="circle"
            type="primary"
            icon={<RedoOutlined />}
            onClick={resetLayout}
          ></Button>
          {/* <Button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setOpenGuid(true)}
            shape="round"
          >
            Open
          </Button> */}
          <Button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={showDrawer}
            ref={ref1}
            shape="round"
          >
            Projects
          </Button>
          <Button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={showNewProjectModal}
            ref={ref2}
            shape="round"
          >
            New
          </Button>
          <Button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={ showKeysModal }
            ref={ref2}
            shape="round"
          >
            API keys
          </Button>
          <Button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={showModal}
            ref={ref3}
            shape="round"
            type="primary"
          >
            Publish
          </Button>
        </Space>
        <Drawer
          title="Project List"
          width={700}
          closable={false}
          onClose={onClose}
          open={open}
        >
          <ProjectList
            showChildrenLogDrawer={showChildrenLogDrawer}
            showChildrenDetailDrawer={showChildrenDetailDrawer}
            open={open}
            onClose={onClose}
            childrenDetailDrawer={childrenDetailDrawer}
          ></ProjectList>
          <Drawer
            title="Generate history"
            width={500}
            closable={false}
            onClose={onChildrenLogDrawerClose}
            open={childrenLogDrawer}
          >
            <LogList></LogList>
          </Drawer>
          <Drawer
            title="Project Detail"
            width={500}
            closable={false}
            onClose={onChildrenDetailDrawerClose}
            open={childrenDetailDrawer}
          >
            <TextArea
              placeholder="Project Name"
              onChange={(e) => {
                setProjecctName(e.target.value);
              }}
              value={projecctName}
              autoSize
            />
            <div style={{ margin: '30px 0' }} />
            <TextArea
              placeholder="Description....."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              autoSize={{ minRows: 3, maxRows: 8 }}
            />
          </Drawer>
        </Drawer>

        <Modal
          title="Bot Info"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          width={600}
          destroyOnClose={true}
          footer={null}
        >
          <PublishModal></PublishModal>
        </Modal>
        <Modal
          title="API keys"
          open={isKeysModalOpen}
          width={600}
          onOk={handleKeysOk}
          onCancel={handleKeysCancel}
          destroyOnClose={true}
        >
          <KeyTable></KeyTable>
        </Modal>
        <Modal
          title="New Project"
          open={isNewProjectModalOpen}
          onOk={handleNewProjectModalOk}
          onCancel={handleNewProjectModalCancel}
        >
          <TextArea
            placeholder="Project Name"
            onChange={(e) => {
              setProjecctName(e.target.value);
            }}
            value={projecctName}
            autoSize
          />
          <div style={{ margin: '30px 0' }} />
          <TextArea
            placeholder="Description....."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            autoSize={{ minRows: 3, maxRows: 8 }}
          />
        </Modal>
        <Tour
          open={openGuid}
          onClose={() => setOpenGuid(false)}
          steps={steps}
        />
      </div>
    </>
  );
}
