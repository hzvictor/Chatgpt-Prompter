import { login, register } from '@/services/user';

export default {

    state: {
        info: {
            jwt: '',
            username: '',
            islogin: false
        },
    },

    effects: {
        *login({ payload }: any, { call, put }: any) {
            const data = yield call(login, payload);
            if (data) {
                yield put({ type: 'loginSuccess', payload: {
                    jwt: data.jwt,
                    username: data.user.username ,
                    islogin: true
                } });
            } else {
                yield put({
                    type: 'loginSuccess', payload: {
                        jwt: '',
                        username: '',
                        islogin: false
                    }
                });
            }
        },
    },

    reducers: {
        loginSuccess(state: any, { payload }: any) {
            return {
                info: payload,
            };
        },
        logout(state: any, { payload }: any) {
            return {
                info: {
                    jwt: '',
                    username: '',
                    islogin: false
                },
            };
        },
    },
};