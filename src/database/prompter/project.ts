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

export async function updateProjectDetail({ nanoid, data }: any) {
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
    cover: string = '',
    type: string,
    model: string
) {
    try {

        const layoutConfig = {
            isDraggable: false,
            isResizable: true,
            showParameter: true,
            showTuning: true,
            showTest: true,
            showChat: true,
            layoutGrid: [
                {
                    "w": 6,
                    "h": 19,
                    "x": 18,
                    "y": 0,
                    "i": "chat",
                    "moved": false,
                    "static": false
                },
                {
                    "w": 13,
                    "h": 30,
                    "x": 5,
                    "y": 0,
                    "i": "tuning",
                    "moved": false,
                    "static": false
                },
                {
                    "w": 5,
                    "h": 27,
                    "x": 0,
                    "y": 3,
                    "i": "slideList",
                    "moved": false,
                    "static": false
                },
                {
                    "w": 5,
                    "h": 3,
                    "x": 0,
                    "y": 0,
                    "i": "manager",
                    "moved": false,
                    "static": false
                },
                {
                    "w": 6,
                    "h": 11,
                    "x": 18,
                    "y": 19,
                    "i": "test",
                    "moved": false,
                    "static": false
                }
            ],
            // showLogitBias:false,
        }


        await db.project.put({
            nanoid: makeNodeId(),
            name: name,
            cover: cover,
            describe: describe,
            type: type,
            model: model,
            layoutConfig: layoutConfig,
            creatData: dayjs().valueOf(),
            updateDate: dayjs().valueOf(),
        });
    } catch (error) {
        console.error(error);
    }
}
