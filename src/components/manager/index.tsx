import styles from './index.less';
import {
  Button,
  Space,
  Modal,
  Tour,
} from 'antd';
import { makeNodeId } from '@/utils/withNodeId';
import { history, useModel } from 'umi';
import { useState, useRef } from 'react';
import type { TourProps } from 'antd';
import { messageFunction } from '@/stores/globalFunction';
import { RedoOutlined } from '@ant-design/icons';
import { editorLayout } from '@/stores/editors';
import KeyTable from './keysTable'
import PublishModal from './publishModal';
import Setting from './setting'
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

export default function IndexPage({projectid}:any) {
  const [openGuid, setOpenGuid] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKeysModalOpen, setIsKeysModalOpen] = useState(false);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
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







  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {

    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showSettingModal = () => {
    setIsSettingModalOpen(true);
  };

  const handleSettingOk = () => {

    setIsSettingModalOpen(false);
  };

  const handleSettingCancel = () => {
    setIsSettingModalOpen(false);
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

  const jumpToHome = () => {
    history.push('/project')
  };


  const resetLayout = async () => {
    editorLayout.layout = layoutGrid;
  };

  return (
    <>
      <div className={`componentContainer  ${styles.container}`} >
        <Space wrap >
          {/* <Button
            shape="circle"
            type="primary"
            icon={<RedoOutlined />}
            onClick={resetLayout}
          ></Button> */}
          {/* <Button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setOpenGuid(true)}
            shape="round"
          >
            Open
          </Button> */}
          <Button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={showSettingModal}
            ref={ref2}
            shape="round"
          >
            Setting
          </Button>
          <Button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={jumpToHome}
            ref={ref2}
            shape="round"
          >
            Home
          </Button>
          <Button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={showKeysModal}
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
          title="Setting"
          open={isKeysModalOpen}
          width={600}
          onOk={handleKeysOk}
          onCancel={handleKeysCancel}
          destroyOnClose={true}
        >
          <KeyTable></KeyTable>
        </Modal>
        <Modal
          title="Setting"
          open={isSettingModalOpen}
          width={600}
          footer={null}
          onOk={handleSettingOk}
          onCancel={handleSettingCancel}
          destroyOnClose={true}
        >
          <Setting projectid={projectid}></Setting>
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
