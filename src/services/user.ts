import request from '@/utils/request';



export async function login(params: any) {
    return request('/auth/local', {
        method: 'POST',
        data: params,
    });
}

export async function register(params: any) {
    return request('/auth/local/register', {
        method: 'POST',
        data: params,
    });
}
