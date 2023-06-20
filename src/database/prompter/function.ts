import dayjs from 'dayjs';
import { db } from './index';
import { makeNodeId } from '@/utils/withNodeId';

export async function getAllFunctionsList() {
    try {
        return await db.functions.toArray();
    } catch (error) {
        console.error(error);
    }
}

export async function getProjectFunctions(projectid: string) {
    try {
        return await db.functions.where('projectid').equals(projectid).first();
    } catch (error) {
        console.error(error);
    }
}



export async function updateFunctionsDetail(nanoid: string, data: any) {
    try {
        const functions = await db.functions.where('nanoid').equals(nanoid).modify(data);
    } catch (error) {
        console.error(error);
    }
}

export async function getTargetFunctions(nanoid: string) {
    try {
        const functions = await db.functions.where('nanoid').equals(nanoid).first();
        return functions;
    } catch (error) {
        console.error(error);
    }
}

export async function deleteFunctions(nanoid: string) {
    try {
        const functions = await db.functions.where('nanoid').equals(nanoid).delete();
        return functions;
    } catch (error) {
        console.error(error);
    }
}


export async function newFunctions(
    id: string,
    type:string
) {
    try {

        await db.functions.put({
            nanoid: id,
            type:type,
            creatData: dayjs().valueOf(),
            updateDate: dayjs().valueOf(),
        });

        return id
    } catch (error) {
        console.error(error);
    }
}
