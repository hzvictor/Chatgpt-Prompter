import styles from './index.less';
import Chat from '../../components/chat';
import Editor from '../../components/editor';
import { Layout, Space, Menu } from 'antd';
import type { MenuProps } from 'antd';
const { Header, Footer, Sider, Content } = Layout;

export default function IndexPage() {
  const items1: MenuProps['items'] = ['1', '2', '3'].map((key) => ({
    key,
    label: `nav ${key}`,
  }));

  return (
    <div className={styles.container}>
      <Layout style={{ height: '100vh' }}>
        <Header>
          {' '}
          <div className="logo" />{' '}
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['2']}
            items={items1}
          />
        </Header>
        <Layout>
          <Content>
            <Editor></Editor>
          </Content>
          <Sider width={500}>
            <Chat></Chat>
          </Sider>
        </Layout>
        {/* <Footer >Footer</Footer> */}
      </Layout>
    </div>
  );
}
