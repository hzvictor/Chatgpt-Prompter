import request from '@/utils/request';

export async function chatSingle(params:any) {
  return request('/openchat/chat', {
    method: 'POST',
    data: params,
  });
}
