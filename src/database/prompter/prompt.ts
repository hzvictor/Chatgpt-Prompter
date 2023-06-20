import dayjs from 'dayjs';
import { db } from './index';
import { makeNodeId } from '@/utils/withNodeId';

export async function getAllPromptList() {
    try {
        return await db.prompt.toArray();
    } catch (error) {
        console.error(error);
    }
}

export async function getProjectPromptList(projectid: string) {
    try {
        return await db.prompt.where('projectid').equals(projectid).toArray((items: any) => {
            return {
                active: items.find((item: any) => item.isActive),
                all: items.map((item: any) => {
                    return {
                        ...item,
                        list: []
                    }
                }).sort((a, b) => a.creatData - b.creatData)
            }
        });
    } catch (error) {
        console.error(error);
    }
}



export async function updatePromptDetail(nanoid: string, data: any) {
    try {
        const prompt = await db.prompt.where('nanoid').equals(nanoid).modify(data);
    } catch (error) {
        console.error(error);
    }
}

export async function updateActivePrompt(projectid: string, nanoid: string) {
    try {
        await db.prompt.where('projectid').equals(projectid).modify({ isActive: false });
        await db.prompt.where('nanoid').equals(nanoid).modify({ isActive: true });
    } catch (error) {
        console.error(error);
    }
}

export async function getTargetPrompt(nanoid: string) {
    try {
        const prompt = await db.prompt.where('nanoid').equals(nanoid).first();
        return prompt;
    } catch (error) {
        console.error(error);
    }
}

export async function deletePrompt(nanoid: string) {
    try {
        const prompt = await db.prompt.where('nanoid').equals(nanoid).delete();
        return prompt;
    } catch (error) {
        console.error(error);
    }
}


// db.prompt.put({
//   nanoid: activeProjectID,
//   [opts.key]: JSON.stringify(snapshot(state)),
// });

export async function newPrompt(
    name: string = 'unknow',
    projectid: string,

) {
    try {

        const initDataSourece = [
            {
                key: makeNodeId(),
                role: 'system',
                name: '',
                state: '',
                function_call: '',
                remake: '',
                message: ``,
            },
            {
                key: makeNodeId(),
                role: 'user',
                name: '',
                function_call: '',
                state: '',
                remake: '',
                message: ``,
            },
            {
                key: makeNodeId(),
                role: 'assistant',
                name: '',
                function_call: '',
                state: '',
                remake: '',
                message: ``,
            },
        ]
        const id = makeNodeId()
        await db.prompt.put({
            nanoid: id,
            name: name,
            projectid: projectid,
            list: initDataSourece,
            isSynchronize: false,
            isActive: true,
            creatData: dayjs().valueOf(),
            updateDate: dayjs().valueOf(),
        });

        return id
    } catch (error) {
        console.error(error);
    }
}
