import dayjs from 'dayjs';
import { db } from './root';
import { makeNodeId } from '../utils/withNodeId';

export async function getAllProjectListDB() {
  try {
    return await db.projectDetails.toArray();
  } catch (error) {
    console.error(error);
  }
}
export async function updateProjectDetailDB(nanoid: string, data: any) {
  console.log(nanoid, data);
  try {
    return db.projectDetails.update(nanoid, data);
  } catch (error) {
    console.error(error);
  }
}

export async function getTargetProjectDB(nanoid: string) {
  try {
    const project = await db.project.where('nanoid').equals(nanoid).toArray();
    return project;
  } catch (error) {
    console.error(error);
  }
}

// db.project.put({
//   nanoid: activeProjectID,
//   [opts.key]: JSON.stringify(snapshot(state)),
// });

export async function newProjectDB(
  id: string,
  name: string = 'unknow',
  detail: string = '',
) {
  try {
    let seltID = id;
    if (seltID) {
      await db.projectDetails.put({
        nanoid: seltID,
        name: name,
        descripe: detail,
        cover: '',
        avatar: '',
        creatData: dayjs().valueOf(),
        updateDate: dayjs().valueOf(),
      });
    } else {
      seltID = makeNodeId();
      await db.projectDetails.put({
        nanoid: seltID,
        name: name,
        cover: '',
        avatar: '',
        descripe: detail,
        creatData: dayjs().valueOf(),
        updateDate: dayjs().valueOf(),
      });
    }
    return seltID;
  } catch (error) {
    console.error(error);
  }
}
