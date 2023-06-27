import styles from './index.less';
import {
  Button,
  Space,
  Modal,
  Tour,
  message
} from 'antd';
import { makeNodeId } from '@/utils/withNodeId';
import { history, useModel } from 'umi';
import { useState, useRef } from 'react';
import type { TourProps } from 'antd';
import { getProjectSlidelistList } from '@/database/prompter/slidelist'
import { getProjectPromptList } from '@/database/prompter/prompt'
import { messageFunction } from '@/stores/globalFunction';
import { RedoOutlined } from '@ant-design/icons';
import { editorLayout } from '@/stores/editors';
import KeyTable from './keysTable'
import PublishModal from './publishModal';
import Setting from './setting'
import CodeSnap from '../apureComponents/codeSnap';

import { history as umiHistory } from 'umi'

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

export default function IndexPage({ projectid }: any) {
  const [openGuid, setOpenGuid] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isKeysModalOpen, setIsKeysModalOpen] = useState(false);
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [codeString, setCodeString] = useState('');
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

  const showCodeModal = async () => {
    const slidelist = await getProjectSlidelistList(projectid)

    let parameterString = {}
    if (umiHistory.location.pathname.includes('turbo')) {
      const prompts = await getProjectPromptList(projectid)
      const messages = prompts.active.list.map((item: any) => { return { role: item.role, content: item.message } })
      if (!slidelist.active) {
        message.info("parameter not exist")
        return
      }
      const parameter = slidelist.active.config

      if (!parameter.function_call) {
        delete parameter.function_call
      }
      if (parameter.functions.length == 0) {
        delete parameter.functions
      } else {
        parameter.functions = parameter.functions.map((item: any) => {

          const required = item.parameters.map((parameter: any) => parameter.name)

          const properties = {} as any
          item.parameters.forEach((parameter: any) => {
            if (parameter.enum) {
              properties[parameter.name] = {
                type: parameter.type,
                description: parameter.description,
                enum: parameter.enum,
              }
            } else {
              properties[parameter.name] = {
                type: parameter.type,
                description: parameter.description,
              }
            }


          })

          return {
            "name": item.name,
            "description": item.description,
            "parameters": {
              "type": "object",
              "properties": properties,
              "required": required,
            },
          }

        })
      }
      parameterString = {
        model: "gpt-3.5-turbo",
        messages: messages,
        ...parameter
      }
    } else {
      const parameter = slidelist.active.config
      parameterString = {
        ...parameter
      }
    }



    setCodeString(
      `const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const completion = await openai.createChatCompletion(${JSON.stringify(parameterString)});
console.log(completion.data.choices[0].message);
`)
    setIsCodeModalOpen(true);
  };

  const handleCodeOk = () => {

    setIsCodeModalOpen(false);
  };

  const handleCodeCancel = () => {
    setIsCodeModalOpen(false);
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

          <Button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={showCodeModal}
            shape="round"
            type="primary"
          >
            View Code
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

        <Modal
          title="Code"
          open={isCodeModalOpen}
          width={600}
          footer={null}
          onOk={handleCodeOk}
          onCancel={handleCodeCancel}
          destroyOnClose={true}
        >
          <CodeSnap lang="javascript" codeString={codeString}  ></CodeSnap>
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
