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
import botStore from '@/stores//bot';
import UploadAntd from '@/components/apureComponents/uploadAntd'
import TextArea from 'antd/es/input/TextArea';
import { updateChatbotDetail } from '@/database/prompter/chatbot'


const App = ({ showDrawer, chatbotInfo, setChatbotName }: any) => {
  const [form] = Form.useForm();
  const [imgUrl, setImgUrl] = useState('');
  const [showHistoryEditorButton, setShowHistoryEditorButton] = useState(false);
  useEffect(() => {
    if(chatbotInfo.botConfig && Object.keys(chatbotInfo.botConfig).length>0){
      form.resetFields()
      form.setFieldsValue(chatbotInfo.botConfig)
    }else{
    form.resetFields()
    }

    if (chatbotInfo.botConfig?.avatar) {
      setImgUrl(chatbotInfo.botConfig.avatar)
    }else{
      setImgUrl('')
    }
  }, [chatbotInfo])

  const changeStrategy = (val: string) => {
    let code;
    if (val == 'all' || val == 'function') {
      code = `function history(inputData) {
        return true
    }`
    } else if (val == 'user') {
      code = `function history(inputData) {
        if(inputData.input.role == 'user'){
          return true
        }
    }`
    } else if (val == 'assistant') {
      code = `function history(inputData) {
        if(inputData.input.role == 'assistant'){
          return true
        }
    }`
    }

    updateChatbotDetail(chatbotInfo.nanoid, {
      historyFunction: code
    })

    if (val == 'function') {
      setShowHistoryEditorButton(true)
    } else {
      setShowHistoryEditorButton(false)
    }
  }


  const onFormChange = (value: any) => {
    if (value.name) {
      setChatbotName(value.name)
    }
    if (value.historyStrategy) {
      changeStrategy(value.historyStrategy)
    }
    if (chatbotInfo.nanoid) {
      const formValue = form.getFieldsValue()
      if (imgUrl) {
        formValue.avatar = imgUrl
      }
      console.log(formValue)
      updateChatbotDetail(chatbotInfo.nanoid, { botConfig: formValue })
    }
  }

  useEffect(() => {
    if (imgUrl) {
      const formValue = form.getFieldsValue()
      formValue.avatar = imgUrl
      console.log(formValue)
      updateChatbotDetail(chatbotInfo.nanoid, { botConfig: formValue })
    }
  }, [imgUrl])

  return (
    <>
      {/* <div>Base Setting</div> */}
      <Form form={form} onValuesChange={onFormChange} layout="vertical" >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Chatbot Name"
              rules={[{ required: false, message: 'Please enter user name' }]}
            >
              {
                <Input
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
            >
              {
                <TextArea
                  placeholder="Please enter user name"
                />
              }
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Tags" name="tags" >
              <Select
                mode="tags"
                style={{ width: '100%' }}
                tokenSeparators={[',']}
                options={[
                  {
                    value: 'education',
                    label: 'education',
                  },
                  {
                    value: 'tech',
                    label: 'tech',
                  },
                  {
                    value: 'fun',
                    label: 'fun',
                  },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              label="Chatbot Avatar"
            >
              <UploadAntd
                imgUrl={imgUrl} changImg={setImgUrl}
              >
              </UploadAntd>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="historyStrategy"
              label="History Strategy"
            >
              <Select
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
          {showHistoryEditorButton && <Button onClick={showDrawer} type="primary"> Edit Funciton </Button>}
        </Row>
      </Form>
    </>
  );
};

export default App;
