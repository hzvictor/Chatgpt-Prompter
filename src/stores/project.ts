import { proxy } from 'valtio';
import { makeNodeId } from '../utils/withNodeId';
import { newProjectDB } from '@/database/project';
import { db } from '@/database/root';
export function getActiveProjectID() {
  const local = localStorage.getItem('activeProjectID');
  if (local) {
    return local;
  } else {
    const id = makeNodeId();
    // 如果没有active project id 需要创建一个新的项目
    newProjectDB(id);
    // db.operations.put({ nanoid: id });

    localStorage.setItem('activeProjectID', id);

    return id;
  }
}

export function changeActiveProjectID(id: string) {
  activeProject.activeProjectID = id;
  localStorage.setItem('activeProjectID', id);
}

export const activeProject = proxy({
  activeProjectID: getActiveProjectID(),
  globalState: 1, //  0----- new projecting and change project 1--- normal
});
