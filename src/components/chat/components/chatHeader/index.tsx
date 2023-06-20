import styles from './index.less';
import { SettingOutlined, ShareAltOutlined, RightOutlined, RedoOutlined } from '@ant-design/icons';
import { Drawer, Row, Col, Button, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import ModifyString from '../modifyString';
import BaseSetting from '../baseSetting';
import { history } from 'umi';
import { updateChatbotDetail } from '@/database/prompter/chatbot'
import CodeEditor from '@/components/apureComponents/codeEditor';
import { removeJavascriptComments } from '@/utils/little'
import { getTargetFunctions } from '@/database/prompter/function'
export default ({ chatbotInfo, resetList, setHistory }: any) => {
  const [open, setOpen] = useState(false);
  const [openCode, setOpenCode] = useState(false);
  const [chatbotName, setChatbotName] = useState('Promter');
  const [codeConfig, setCodeConfig] = useState()

  useEffect(() => {
    if (chatbotInfo.botConfig && chatbotInfo.botConfig.name) {
      setChatbotName(chatbotInfo.botConfig.name)
    } else {
      setChatbotName('Promter')
    }
  }, [chatbotInfo])

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onCloseCode = () => {
    showDrawer()
    setOpenCode(false);
    getTargetFunctions(chatbotInfo.nanoid).then(res => {
      let CODE = removeJavascriptComments(res.code)
      CODE = CODE.trim()
      updateChatbotDetail(chatbotInfo.nanoid,{historyFunction:CODE})
    })

  };
  const showDefaultCode = () => {
    onClose()
    setOpenCode(true);

    setCodeConfig({
      id: chatbotInfo.nanoid, type: 'history'
    })
  };




  const jumpToBotEditor = () => {
    history.push(`/editor/graph/chatbot/${chatbotInfo.projectid}`);
  };

  const resetHistory = () => {
    updateChatbotDetail(chatbotInfo.nanoid, { messageHistorys: [] })
    resetList([])
    setHistory([])
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
        {/* <ShareAltOutlined
          style={{ marginLeft: '8px' }}
          onMouseDown={(e) => e.stopPropagation()}
          className={styles.iconStyle}
        /> */}
      </div>
      <div>{chatbotName}</div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <SettingOutlined
          className={styles.iconStyle}
          onClick={showDrawer}
          onMouseDown={(e) => e.stopPropagation()}
        />
        {history.location.pathname != '/editor/chat/3.5/graph' && (
          <Button
            onClick={jumpToBotEditor}
            style={{ marginLeft: '5px' }}
            size="small"
            type="primary"
            onMouseDown={(e) => e.stopPropagation()}
          >
            More
          </Button>
        )}
      </div>
      <Drawer
        closeIcon={null}
        headerStyle={{ border: 'none', height: 0, padding: 0 }}
        placement="right"
        onClose={onCloseCode}
        bodyStyle={{ padding: '0px' }}
        // open={true}
        open={openCode}
        size="large"
      >
        <CodeEditor codeConfig={codeConfig} onCloseCode={onCloseCode}></CodeEditor>
        {openCode && (
          <Button
            type="primary"
            className={styles.hoverButton}
            icon={<RightOutlined />}
            shape="circle"
            style={{ position: 'absolute', left: '-38px', bottom: '10px' }}
            onClick={onCloseCode}
          ></Button>
        )}
      </Drawer>
      <Drawer
        title={
          <Row justify="space-between" align="middle">
            <Col>
              <div>Chatbot Setting</div>
            </Col>
            {/* <Col>
              {' '}
              <Button onClick={jumpToBotEditor} type="primary">
                Bot Editor
              </Button>{' '}
            </Col> */}
          </Row>
        }
        placement="bottom"
        closable={false}
        onClose={onClose}

        open={open}

        size="large"
      >
        <Row gutter={48}>
          <Col style={{ height: '600px', overflow: 'scroll' }} span={12}>
            <BaseSetting chatbotInfo={chatbotInfo} setChatbotName={setChatbotName} showDrawer={showDefaultCode}  ></BaseSetting>
          </Col>
          <Col style={{ height: '600px', overflow: 'scroll' }} span={12}>
            <ModifyString chatbotInfo={chatbotInfo} ></ModifyString>
          </Col>
        </Row>
      </Drawer>


    </div>
  );
};
