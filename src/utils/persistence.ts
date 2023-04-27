import { db } from '../database/root';
import { getTargetProjectDB } from '../database/project';
import { proxy, subscribe, snapshot } from 'valtio';
import { activeProject } from '@/stores/project';
import { tabData } from '@/stores/tablist';

export function proxyWithPersist<V>(
  val: V,
  opts: {
    key: string;
  },
) {
  const local = localStorage.getItem(opts.key);
  const state = proxy(local ? JSON.parse(local) : val);
  localStorage.setItem(opts.key, JSON.stringify(snapshot(state)));

  subscribe(state, () => {
    const { activeProjectID, globalState } = activeProject;
    localStorage.setItem(opts.key, JSON.stringify(snapshot(state)));
    if (globalState != 0) {
      try {
        db.project.update(activeProjectID, {
          [opts.key]: JSON.stringify(snapshot(state)),
        });
      } catch (error) { }
    }
  });

  return state;
}

export function proxyWithoutLocal(
  val: any,
  opts: {
    dbName: any;
  },
) {
  const { activeProjectID } = activeProject;
  const state : any = proxy(val);
  if (activeProjectID) {
    try {
      db[opts.dbName]
        .where('nanoid')
        .equals(activeProjectID)
        .toArray()
        .then((res: any) => {
          if (res.length == 0) {
            // no data
            db[opts.dbName].put({
              nanoid: activeProjectID,
              ...snapshot(state),
            });
          } else {
            // update state
            const result = res[0];
            for (const key in result) {
              if (key != 'nanoid') {
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
    const { activeProjectID, globalState } = activeProject;
    if (globalState != 0) {
      try {
        db[opts.dbName].update(activeProjectID, {
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
  const { activeProjectID } = activeProject;
  const state = proxy(local ? JSON.parse(local) : val);
  localStorage.setItem(opts.dbName, JSON.stringify(snapshot(state)));
  if (activeProjectID) {
    try {
      db[opts.dbName]
        .where('nanoid')
        .equals(activeProjectID)
        .toArray()
        .then((res: any) => {
          if (res.length == 0) {
            // no data
            db[opts.dbName].put({
              nanoid: activeProjectID,
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
    const { activeProjectID, globalState } = activeProject;
    if (globalState != 0) {
      try {
        db[opts.dbName].update(activeProjectID, {
          ...snapshot(state),
        });
      } catch (error) { }
    }else{
      // console.log('没写入');
    }
  });
  return state;
}

export function multProxyWithPersist(
  val: any,
  opts: {
    dbName: any;
    nanoid: any;
  },
) {
  const local = localStorage.getItem(opts.dbName);
  const { activeProjectID } = activeProject;
  const state = proxy(local ? JSON.parse(local) : val);
  localStorage.setItem(opts.dbName, JSON.stringify(snapshot(state)));
  if (activeProjectID) {
    try {
      db[opts.dbName]
        .where({
          fatherid: activeProjectID,
          nanoid: tabData.activeTabListId[opts.nanoid],
        })
        .toArray()
        .then((res: any) => {
          if (res.length == 0) {
            // no data
            db[opts.dbName].put({
              nanoid:tabData.activeTabListId[opts.nanoid],
              fatherid: activeProjectID,
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
    const mpdifyData = snapshot(state)
    localStorage.setItem(opts.dbName, JSON.stringify(mpdifyData));
    // const { activeProjectID, globalState } = activeProject;
    // console.log(activeProject,1111111111)
    // console.log("opts.dbName",opts.dbName)
    // console.log("opts.nanoid",tabData.activeTabListId[opts.nanoid])
    // console.log(mpdifyData,'mpdifyDatampdifyDatampdifyData')
    // const modifyDataWithOutFatherId = mpdifyData
    if ('fatherid' in mpdifyData) {
      // 键 'b' 存在于对象 obj 中
      // console.log('fatherid存在于对象 obj 中')
      delete mpdifyData.fatherid
    } else {
      // 键 'b' 不存在于对象 obj 中
      // console.log('fatherid不存在于对象 obj 中')
    }
    // console.log(mpdifyData,'22222222mpdifyDatampdifyDatampdifyData')
    if (activeProject.globalState != 0) {
      try {
        db[opts.dbName]
          .where({
            nanoid:tabData.activeTabListId[opts.nanoid],
            fatherid: activeProject.activeProjectID,
          })
          .modify({
            ...mpdifyData
          });
      } catch (error) {
      }
    }else{

    }
  });
  return state;
}

export function proxyWithPersistEasy<V>(
  val: V,
  opts: {
    key: string;
  },
) {
  const local = localStorage.getItem(opts.key);
  const state = proxy(local ? JSON.parse(local) : val);
  subscribe(state, () => {
    localStorage.setItem(opts.key, JSON.stringify(snapshot(state)));
  });
  return state;
}
