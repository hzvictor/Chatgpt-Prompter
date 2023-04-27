import request from 'umi-request';

export async function getUploadKey() {
    return request
    .get('https://apikey.server.prompterhub.com');
}
