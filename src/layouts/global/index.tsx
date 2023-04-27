import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';
import {  ConfigProvider} from 'antd';
const BasicLayout = ({ children, location, history }: any) => {
  return <ConfigProvider
  theme={{
    token: {
      colorPrimary: '#00AA90',
    },
  }}
>{children}</ConfigProvider>;
};

export default BasicLayout;
