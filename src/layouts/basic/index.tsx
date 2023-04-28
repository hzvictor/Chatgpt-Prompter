import styles from './index.less';

import { Layout, Space, Button, Menu, Row, Col, ConfigProvider, Tooltip, message, Modal, Popover, Popconfirm } from 'antd';
import Avatar from 'react-avatar';
const { Header } = Layout;
import { LogoutOutlined, LoginOutlined } from '@ant-design/icons';
import { RestOutlined, DashboardOutlined, AlignCenterOutlined,FileProtectOutlined,ClusterOutlined } from '@ant-design/icons';
import { useIntl, getLocale, setLocale, Link } from 'umi';
import { IRouteComponentProps } from 'umi';
import { useTransition, animated, UseTransitionProps } from 'react-spring';
import { useState, useEffect } from 'react';
import { Switch } from 'react-router';
import { messageFunction, upOrLeftState } from '@/stores/globalFunction';
import Dexie from 'dexie';
import Login from '@/components/login'
import DiscordSvg from '../../../public/assets/imgs/discord.svg'
import { connect } from 'umi';

const items = [
  {
    key: "store",
    icon: <ClusterOutlined />,
    label: 'Store',
    type: '',
  },
  {
    key: "project",
    icon: <FileProtectOutlined />,
    label: 'Project',
    type: '',
  },
  {
    key: "template",
    icon: <AlignCenterOutlined />,
    label: 'Template',
    type: '',
  },
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: 'Dashboard',
    type: '',
  },
];


function IndexPage({ children, location, history, user,dispatch }: any) {
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [selectedKeys,setSelectedKeys] = useState([])
  messageFunction.messageApi = messageApi;
  const { formatMessage } = useIntl();
  const [lang, setLang] = useState('English');

  const { info} = user


  useEffect(() => {
    if (getLocale() == 'zh-CN') {
      setLang('中文');
    } else {
      setLang('English');
    }

    setSelectedKeys(history.location.pathname.split('/')[1])
    // upOrLeftState.lastLocation = history.location.pathname
  }, []);

  const changeLang = () => {
    // messageApi.info('Hello, Ant Design!');
    if (getLocale() == 'en-US') {
      setLang('中文');
      setLocale('zh-CN', false);
    } else {
      setLang('English');
      setLocale('en-US', false);
    }
  };

  const clear = () => {
    localStorage.clear();

    // 定义数据库
    const db = new Dexie('prompter');

    // // 定义表
    // db.version(1).stores({
    //   table_name: '++id, field1, field2, ...'
    // });

    // 打开数据库
    db.open().catch(function (error) {
      console.log(`打开数据库出错: ${error}`);
    });

    // 删除数据库
    db.delete()
      .then(function () {
        console.log('数据库删除成功');
        window.location.reload();
      })
      .catch(function (error) {
        console.log(`删除数据库出错: ${error}`);
      });
  };

  const newSwitch = (
    <Switch location={location}>{children.props.children}</Switch>
  );



  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };



  const hide = () => {
    setClicked(false);
    setHovered(false);
  };

  const handleHoverChange = (open: boolean) => {
    setHovered(open);
    setClicked(false);
  };

  const handleClickChange = (open: boolean) => {
    setHovered(false);
    setClicked(open);
  };

  const logout = () => {
    // userState.jwt = ''
    // userState.username = ''
    // userState.islogin = false
    dispatch({
      type: 'user/logout',
    })

    messageApi.info('Logout will not clear local data')
  }

  const hoverContent = <Space direction="vertical" >
    <Button onClick={logout} >Logout</Button>
    <Popconfirm
      title="Sure to delete all data?"
      onConfirm={clear}
    >
      <Button >Clear All Data</Button>
    </Popconfirm>

  </Space>

  const onClick = (e: any) => {
    history.push(e.key);
    setSelectedKeys([e.key])
  };



  return (
    <>
      {contextHolder}
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#00AA90',
          },
        }}
      >
        <div className={styles.container}>
          <Layout style={{ height: '100vh' }}>
            {history.location.pathname != '/boteditor' && (
              <div className={styles.header}>
                <Row
                  justify="space-between"
                  align="middle"
                  style={{ width: '100%' }}
                >
                  <Col>
                    <Space size="large">
                      <div className={styles.logo}>Prompter Hub <span style={{ fontSize: "12px" }}>Test</span></div>
                    </Space>
                  </Col>
                  <Col>
                    <Space size="large">
                      <Tooltip title="Join to report bugs">
                        <a
                          href="https://discord.gg/Ad3bFRMcq9"
                          target="_blank"
                          style={{ height: "100%", display: "flex", alignItems: "center" }}
                        >
                          <img style={{ height: "30px", width: "30px" }} src={DiscordSvg} alt="" />
                        </a>
                      </Tooltip>
                      <Button onClick={clear} >Clear All Data</Button>
                      <Button onClick={changeLang} shape="round" size="middle">
                        {lang}
                      </Button>
                      {info.islogin ?
                        <Popover
                          style={{ width: 500 }}
                          content={hoverContent}
                          title={info.username}
                          trigger="hover"
                          open={hovered}
                          onOpenChange={handleHoverChange}
                        >
                          <Popover
                            content={
                              <div>
                                {hoverContent}
                              </div>
                            }
                            title={info.username}
                            trigger="click"
                            open={clicked}
                            onOpenChange={handleClickChange}
                          >
                            <div>
                              <Avatar name={info.username} size="30" round={true} />
                            </div>
                          </Popover>
                        </Popover>
                        : <Tooltip title="Login"> <Button onClick={showModal} shape="circle" icon={<LoginOutlined />} ></Button>  </Tooltip>}
                    </Space>
                  </Col>
                </Row>
              </div>
            )}


            <Row style={{ height: 'calc(100vh - 64px)'}}  wrap={false }>
              <Col span={3} style={{backgroundColor:"white"}}  >
                <div style={{height:'calc(100vh - 120px)'}}>
                  <Menu
                      onClick={onClick}
                      // style={{ width: 256 }}
                      selectedKeys={selectedKeys}
                      mode="inline"
                      items={items}
                    />
                </div>
                <div className={styles.traashContainer} >
                <Menu
                      onClick={onClick}
                      // style={{ width: 256 }}
                      selectedKeys={selectedKeys}
                      mode="inline"
                      items={[
                        {
                          key: "trash",
                          icon: <RestOutlined />,
                          label: 'Trash',
                        },
                      ]}
                    />
                </div>
              </Col>
              <Col  span={21} >
                    {children}
              </Col>
            </Row>

          </Layout>
          <Modal title="Login" footer={null} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
            <Login onCancel={handleCancel} ></Login>
          </Modal>
        </div>
      </ConfigProvider>
    </>
  );
}

export default connect(({ user }) => ({
  user
}))(IndexPage) 


// {history.location.pathname != '/boteditor'
//                   ? transitions.map(({ item, key, props: style }) => {
//                     return (
//                       <Layout
//                         key={key}
//                         style={{ backgroundColor: 'rgba(169, 180, 202,.5)' }}
//                       >
//                         <animated.div
//                           style={{
//                             ...style,
//                             width: '100vw',
//                             height: 'calc(100vh - 64px)',
//                             position: 'fixed',
//                             top: '64px',
//                             overflow: 'scroll',
//                           }}
//                         >
//                           {item}
//                         </animated.div>
//                       </Layout>
//                     );
//                   })
//                   : transitions.map(({ item, key, props: style }) => {
//                     return (
//                       <Layout
//                         key={key}
//                         style={{ backgroundColor: 'rgba(169, 180, 202,.5)' }}
//                       >
//                         <animated.div
//                           style={{
//                             ...style,
//                             width: '100vw',
//                             height: '100vh',
//                             position: 'fixed',
//                             top: '0',
//                           }}
//                         >
//                           {item}
//                         </animated.div>
//                       </Layout>
//                     );
//                   })}

  // {/* <Link
  //                 className={styles.link}
  //                 style={{ color: '#00AA90' }}
  //                 to="/editor"
  //                 onClick={() => {
  //                   upOrLeftState.upOrLeft = false;
  //                   // upOrLeftState.lastLocation.push('/editor');
  //                 }}
  //               >
  //                 {formatMessage({
  //                   id: 'editor',
  //                 })}
  //               </Link>
  //               <Link
  //                 className={styles.link}
  //                 style={{ color: '#00AA90' }}
  //                 to="/hub"
  //                 onClick={() => {
  //                   upOrLeftState.upOrLeft = false;
  //                   // upOrLeftState.lastLocation.push('/hub') ;
  //                 }}
  //               >
  //                 {formatMessage({
  //                   id: 'hub',
  //                 })}
  //               </Link> */}

  


    // const transitionCompute = () => {


  //   if (upOrLeftState.upOrLeft) {
  //     if (history.action === 'PUSH') {
  //       return up;
  //     } else {
  //       return down;
  //     }
  //   } else {
  //     // if (history.action === 'PUSH') {
  //     //   return foward
  //     // } else {
  //     //   return back
  //     // }
  //     if (location.pathname != '/editor') {
  //       return foward;
  //     } else {
  //       return back;
  //     }
  //   }
  // };

  // const transitions = useTransition(
  //   newSwitch,
  //   location.pathname,
  //   transitionCompute(),
  // );


  // const foward: UseTransitionProps<JSX.Element, React.CSSProperties> = {
  //   from: { opacity: 1, transform: 'translateX(100%)' },
  //   enter: {
  //     opacity: 1,
  //     transform: 'translateX(0)',
  //   },
  //   leave: { opacity: 1, transform: 'translateX(-100%)' },
  //   config: { duration: 500 },
  // };
  
  // const back: UseTransitionProps<JSX.Element, React.CSSProperties> = {
  //   from: { opacity: 1, transform: 'translateX(-100%)' },
  //   enter: {
  //     opacity: 1,
  //     transform: 'translateX(0)',
  //   },
  //   leave: { opacity: 1, transform: 'translateX(100%)' },
  //   config: { duration: 500 },
  // };
  
  // const up: UseTransitionProps<JSX.Element, React.CSSProperties> = {
  //   from: { opacity: 1, transform: 'translateY(100%)' },
  //   enter: {
  //     opacity: 1,
  //     transform: 'translateY(0)',
  //   },
  //   leave: { opacity: 1, transform: 'translateY(-100%)' },
  //   config: { duration: 500 },
  // };
  
  // const down: UseTransitionProps<JSX.Element, React.CSSProperties> = {
  //   from: { opacity: 1, transform: 'translateY(-100%)' },
  //   enter: {
  //     opacity: 1,
  //     transform: 'translateY(0)',
  //   },
  //   leave: { opacity: 1, transform: 'translateY(100%)' },
  //   config: { duration: 500 },
  // };