import './global.css';
import '../public/assets/css/chatui-theme.css';
import '../public/assets/js/chatui.js'
import { message } from 'antd'
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { getDvaApp } from 'umi';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';





const persistConfig = {
    key: 'root',
    storage,
};

const persistEnhancer = () => (createStore: any) => (reducer: any, initialState: any, enhancer: any) => {
    const store = createStore(persistReducer(persistConfig, reducer), initialState, enhancer);
    const persist = persistStore(store);
    return { ...store, persist };
};

export const dva = {
    config: {
        // onAction: createLogger(), // 每次action的时候会触发
        onError(e: Error) {
            message.error(e.message, 3);
        },
        extraEnhancers: [persistEnhancer()],
    },
};






var script = document.createElement('script');
script.src = 'https://www.googletagmanager.com/gtag/js?id=G-N30RF8EDRR';
script.async = true;
document.head.appendChild(script);

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());

gtag('config', 'G-N30RF8EDRR');


// db.project.put({
//   nanoid: activeProjectID,
// });

// db.bot.put({
//   nanoid: activeProjectID,
// });

// history.replace('editor');
