import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { getDvaApp } from 'umi';
import { Link, connect } from 'umi';
import { ConfigProvider } from 'antd';


const BasicLayout = ({ children, location, history }: any) => {
  const app = getDvaApp(); // 获取dva的实例
  const persistor = app._store.persist;
  return <PersistGate loading={null} persistor={persistor}> <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#00AA90',
      },
    }}
  >{children}</ConfigProvider>
  </PersistGate>;
};

function mapStateToProps(store: any) {
  return {
    // info
    //   : store.user.info
  }

}

export default connect(mapStateToProps)(BasicLayout);