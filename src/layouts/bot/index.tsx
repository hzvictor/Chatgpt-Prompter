import styles from './index.less';
import { Layout, Space, Button, Row, Col, message, ConfigProvider } from 'antd';
const { Header } = Layout;
import { useIntl, getLocale, setLocale, Link } from 'umi';
import { useRef, useState, useEffect } from 'react';
import Dexie from 'dexie';
import { messageFunction } from '@/stores/globalFunction';

export default function IndexPage(props: any) {
  const [messageApi, contextHolder] = message.useMessage();
  messageFunction.messageApi = messageApi;
  const { formatMessage } = useIntl();
  const [lang, setLang] = useState('English');

  useEffect(() => {
    if (getLocale() == 'zh-CN') {
      setLang('中文');
    } else {
      setLang('English');
    }
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
    const db = new Dexie('promptDB');

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
      })
      .catch(function (error) {
        console.log(`删除数据库出错: ${error}`);
      });
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
        <Layout
          style={{ height: '100vh', backgroundColor: 'rgba(169, 180, 202,.5)' }}
        >
          {props.children}
        </Layout>
      </ConfigProvider>
    </>
  );
}
