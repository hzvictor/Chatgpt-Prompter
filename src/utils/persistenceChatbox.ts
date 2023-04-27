import { chatbox } from '../database/chatboxs/root';
import { proxy, subscribe, snapshot } from 'valtio';
import { activeBot } from '@/stores/chatboxs/activebot';



export function proxyWithoutLocal(
  val: any,
  opts: {
    dbName: any;
  },
) {
  const { activeMessageID } = activeBot;
  const state : any = proxy(val);
  if (activeMessageID) {
    try {
      chatbox[opts.dbName]
        .where('nanoid')
        .equals(activeMessageID)
        .toArray()
        .then((res: any) => {
          if (res.length == 0) {
            
          } else {
            // update state
            const result = res[0];
            for (const key in result) {
              if (key == 'list' ) {
                const element = result[key];
                state[key] = proxy(element);
              }
            }
          }
        });
    } catch (error) {
      console.log('read data error');
    }
  }

  subscribe(state, () => {
    const { activeMessageID } = activeBot;

    const mpdifyData = snapshot(state)

    if ('fatherid' in mpdifyData) {
      // 键 'b' 存在于对象 obj 中
      // console.log('fatherid存在于对象 obj 中')
      delete mpdifyData.fatherid
    } else {
      // 键 'b' 不存在于对象 obj 中
      // console.log('fatherid不存在于对象 obj 中')
    }

    console.log(activeMessageID,'nanoid')

    if (activeMessageID != '') {
      try {
        chatbox[opts.dbName].update(activeMessageID, {
          ...snapshot(state),
        });
      } catch (error) { }
    }else{
      // console.log('没写入');
    }
  });
  return state;
}




export function newProxyWithPersist(
  val: any,
  opts: {
    dbName: any;
  },
) {
  const local = localStorage.getItem(opts.dbName);
  const { activebotID } = activeBot;
  const state = proxy(local ? JSON.parse(local) : val);
  localStorage.setItem(opts.dbName, JSON.stringify(snapshot(state)));
  if (activebotID) {
    try {
      chatbox[opts.dbName]
        .where('nanoid')
        .equals(activebotID)
        .toArray()
        .then((res: any) => {
          if (res.length == 0) {
            // no data
            chatbox[opts.dbName].put({
              nanoid: activebotID,
              ...snapshot(state),
            });
          } else {
            // update state
            // const result = res[0];
            // for (const key in result) {
            //   if (key != 'nanoid') {
            //     const element = result[key];
            //     state[key] = element;
            //   }
            // }
          }
        });
    } catch (error) {
      console.log('read data error');
    }
  }

  subscribe(state, () => {
    localStorage.setItem(opts.dbName, JSON.stringify(snapshot(state)));
    const { activebotID, globalState } = activeBot;
    if (globalState != 0) {
      try {
        chatbox[opts.dbName].update(activebotID, {
          ...snapshot(state),
        });
      } catch (error) { }
    }else{
      // console.log('没写入');
    }
  });
  return state;
}

