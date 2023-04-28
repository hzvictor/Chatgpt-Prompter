import dayjs from 'dayjs';
import { db } from './index';
import { makeNodeId } from '@/utils/withNodeId';

export async function getAllProjectList() {
    try {
        return await db.project.toArray();
    } catch (error) {
        console.error(error);
    }
}

export async function updateProjectDetail(nanoid: string, data: any) {
    console.log(nanoid, data);
    try {
        return db.project.update(nanoid, data);
    } catch (error) {
        console.error(error);
    }
}

export async function getTargetProjectDB(nanoid: string) {
    try {
        const project = await db.project.where('nanoid').equals(nanoid).first();
        return project;
    } catch (error) {
        console.error(error);
    }
}

export async function deleteProject(nanoid: string) {
    try {
        const project = await db.project.where('nanoid').equals(nanoid).delete();
        return project;
    } catch (error) {
        console.error(error);
    }
}


// db.project.put({
//   nanoid: activeProjectID,
//   [opts.key]: JSON.stringify(snapshot(state)),
// });

export async function newProject(
    name: string = 'unknow',
    describe: string = '',
    cover:string = '',
    type:string,
    model:string
) {
    try {
        await db.project.put({
            nanoid:makeNodeId(),
            name: name,
            cover: cover,
            describe: describe,
            type: type,
            model: model,
            creatData: dayjs().valueOf(),
            updateDate: dayjs().valueOf(),
        });
    } catch (error) {
        console.error(error);
    }
}
