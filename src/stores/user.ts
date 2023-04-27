import { proxyWithPersistEasy } from '@/utils/persistence';

export const userState = proxyWithPersistEasy(
    {
        jwt: '',
        username: '',
        islogin:false
    },
    {
        key: 'userinfo',
    },
);