import React, { useEffect, useState } from 'react';
import styles from './index.less';
import { activeProject } from '@/stores/project';
import {
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  Upload,
} from 'antd';
const { Option } = Select;
import { subscribe, useSnapshot } from 'valtio';
import botStore from '@/stores//bot';
import { chatFunction } from '@/stores/globalFunction';
import messageHistoryStore from '@/stores/messageHistory';
import UploadAntd from '@/components/apureComponents/uploadAntd'
import TextArea from 'antd/es/input/TextArea';


const { messageHistoryState } = messageHistoryStore;

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const App: React.FC = ({ showDrawer }: any) => {

  const shotBotState = useSnapshot(botStore.botState);


  const changeStrategy = (val: string) => {
    let code;
    if (val == 'all' || val == 'function') {
      code = `function history(inputContent, promptInfo) {
        return true
    }`
    } else if (val == 'user') {
      code = `function history(inputContent, promptInfo) {
        if(promptInfo.role == 'user'){
          return true
        }
    }`
    } else if (val == 'assistant') {
      code = `function history(inputContent, promptInfo) {
        if(promptInfo.role == 'assistant'){
          return true
        }
    }`
    }
    botStore.botState.historyFunction = {
      lang: 'javascript',
      code: code
    }
    botStore.botState.strategy = val
  }




  return (
    <>
      {/* <div>Base Setting</div> */}
      <Form layout="vertical" hideRequiredMark>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Chatbot Name"
              rules={[{ required: false, message: 'Please enter user name' }]}
            >{console.log(shotBotState.name)}
              {
                <Input
                  value={shotBotState.name}
                  onChange={(val) => {
                    botStore.botState.name = val.target.value;
                  }}
                  placeholder="Please enter user name"
                />
              }
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="describe"
              label="Describe"
              rules={[{ required: false, message: 'Please enter describe' }]}
            >{console.log(shotBotState.describe)}
              {
                <TextArea
                  value={shotBotState.describe}
                  onChange={(val) => {
                    botStore.botState.describe = val.target.value;
                  }}
                  placeholder="Please enter user name"
                />
              }
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              name="avatar"
              label="Chatbot Avatar"
              rules={[{ required: false, message: 'Please enter user name' }]}
            >
              <UploadAntd
                // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                // beforeUpload={beforeUpload}
                // onChange={handleChange}
              >
              </UploadAntd>
            </Form.Item>
          </Col>
        </Row>
        {/* <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="owner"
                            label="Owner"
                            rules={[{ required: true, message: 'Please select an owner' }]}
                        >
                            <Select placeholder="Please select an owner">
                                <Option value="xiao">Xiaoxiao Fu</Option>
                                <Option value="mao">Maomao Zhou</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="type"
                            label="Type"
                            rules={[{ required: true, message: 'Please choose the type' }]}
                        >
                            <Select placeholder="Please choose the type">
                                <Option value="private">Private</Option>
                                <Option value="public">Public</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row> */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="History Strategy"
              label="History Strategy"
            >{console.log(shotBotState.strategy)}
              <Select value={shotBotState.strategy} onChange={changeStrategy}
                options={[
                  {
                    value: 'all', label: 'All',
                  },
                  {
                    value: 'assistant', label: 'All assistant',

                  },
                  {
                    value: 'user', label: 'All user',
                  },
                  {
                    value: 'function', label: 'Custom Judgment Method',
                  }
                ]} >
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          {shotBotState.strategy == 'function' && <Button onClick={showDrawer} type="primary"> Edit Funciton </Button>}
        </Row>
        {/* <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="first"
              label="First message"
              rules={[
                {
                  required: false,
                  message: 'please enter url description',
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="please enter url description"
              />
            </Form.Item>
          </Col>
        </Row> */}
      </Form>
    </>
  );
};

export default App;
