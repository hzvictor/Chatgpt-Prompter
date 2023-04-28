import styles from './index.less';
import { Button, Modal, message, Card, Popconfirm } from 'antd';
import { useSnapshot } from 'valtio';
import {
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  BranchesOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useEffect, useState } from 'react';

import { getAllProjectList,deleteProject } from '@/database/prompter/project';
import Jazzicon from 'react-jazzicon';
const { Meta } = Card;
import { history, useModel } from 'umi';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import NewProject from './components/newProject'
import { messageFunction } from '@/stores/globalFunction';
dayjs.extend(relativeTime);
const deleteText = 'Are you sure to delete this project';
const deleteDescription = 'cannot be restored after deletion.';


export default ({
  showChildrenLogDrawer,
  childrenDetailDrawer,
  showChildrenDetailDrawer,
  open,
  onClose,
}: any) => {
  const messageApi = messageFunction.messageApi;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [ projectInfo, SetProjectInfo ] =useState({})

  const confirmDelete = async (nanoid: string) => {
    // message.info('Clicked on Yes.');
    await deleteProject(nanoid)
    getAllProjectList().then((arr) => {
      setList(arr);
    });
  };




  const confirmEditWrap = async (item: any) => {
    try {
      history.push(`/editor/${item.type}/${item.model}/${item.nanoid}`);
    } catch (error) {

      // onClose();
      console.log(error)
      messageApi.info('Change error');
    }
  };

  const [list, setList] = useState([]);

  useEffect(() => {
    getAllProjectList().then((arr) => {
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

  const showModal = (item:any) => {
    SetProjectInfo(item)
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    getAllProjectList().then((arr) => {
      setList(arr);
    });
  };

  return (
    <div className={styles.projectContainer}>
      <div className={styles.cardContainer} >
        <Card
          hoverable
          style={{ width: "300px", height: "389px" }}
          onClick={()=>{showModal({})}}
        >
          <div className={styles.newContainer}>
            <PlusOutlined />
            <div className={styles.newText}> Add New Project </div>
          </div>
        </Card>
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
                  {
                    item.cover ? <img alt="example" style={{width:"300px",height:"200px"}} src={item.cover} /> : <Jazzicon
                      diameter={300}
                      paperStyles={{ marginTop: '-55px' }}
                      seed={textToDecimal(item.nanoid)}
                    />
                  }
                </div>
              }
              actions={[
                <EditOutlined key="edit" onClick={() => { confirmEditWrap(item) }} />,
                <SettingOutlined
                  key="setting"
                  onClick={() => {
                    showModal(item);
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
                    <div className={styles.type} >{item.type} / {item.model}</div>
                    <div  className={styles.describe} >{item.describe != '' ? item.describe : '...'}</div>
                    <div>{dayjs(item.creatData).fromNow()}</div>
                  </>
                }
              />
            </Card>
          );
        })}
      </div>
      <Modal destroyOnClose={true} title="Project Setting" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={null} >
        <NewProject onCancel={handleCancel} projectInfo={projectInfo} ></NewProject>
      </Modal>
    </div>
  );
};
// .fromNow()
