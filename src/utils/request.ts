import { extend } from 'umi-request';
import { notification } from 'antd';
import { userState } from '@/stores/user'

const codeMessage = {
  200: 'The server has successfully returned the requested data.',
  201: 'The data has been created or modified successfully.',
  202: 'A request has been queued for processing in the background (asynchronous task).',
  204: 'The data has been deleted successfully.',
  400: 'The server could not process the request due to an error in the request, and no data has been created or modified.',
  401: 'The user does not have authorization (token, username, or password error).',
  403: 'The user is authorized but access is forbidden.',
  404: 'The requested resource or record does not exist, and the server has not performed any operation.',
  406: 'The requested format is not available.',
  410: 'The requested resource has been permanently deleted and will not be available again.',
  422: 'An error occurred during the validation of an object creation request.',
  500: 'The server has encountered an error, please check the server.',
  502: 'A gateway error has occurred.',
  503: 'The service is unavailable, the server is temporarily overloaded or undergoing maintenance.',
  504: 'A gateway timeout has occurred.',
};

const errorHandler = (error) => {
  const { response } = error;

  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    notification.error({
      message: `Wrong request ${status}: ${url}`,
      description: errorText,
      placement: 'topLeft',
    });
  } else if (!response) {
    notification.error({
      description: 'Your network is abnormal, unable to connect to the server',
      message: 'Network anomaly',
      placement: 'topLeft',
    });
  }

  return response;
};

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  errorHandler,
  // 默认错误处理
  crossOrigin: true, // 开启CORS跨域
  // 默认错误处理
  // credentials: 'include', // 默认请求是否带上cookie
});



// 中间件，对请求前添加 userId token 的基础参数
request.interceptors.request.use((url, options) => {
  const newOptions = { ...options };

  const headers = userState.jwt ? {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: userState.jwt
  } : {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  if (!(newOptions.data instanceof FormData)) {
    newOptions.data = {
      ...newOptions.data,
      // userId: '00000001',
    };
  } else {
    // newOptions.data.append('userId', '1');
    // newOptions.data.append('token', 'adsadsafcdscd');
  }
  if (url.indexOf('http') !== -1) {
    return {
      url: `${url}`,
      options: { ...newOptions },
    };
  } else {
    return {
      // url: `https://test.server.prompterhub.com/api${url}`,
      url: `http://localhost:1336/api${url}`,
      options: { ...newOptions, headers },
    };
  }


});

export default request;
