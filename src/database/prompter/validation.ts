import dayjs from 'dayjs';
import { db } from './index';
import { makeNodeId } from '@/utils/withNodeId';


export async function getAllValidationList() {
    try {
        return await db.validation.toArray();
    } catch (error) {
        console.error(error);
    }
}

export async function getProjectValidationList(tuningid:string) {
    try {
        return await db.validation.where('tuningid').equals(tuningid).toArray((items:any)=>{
            return {
                active:items.find((item:any) => item.isActive ),
                all:items.map((item:any)=>{
                    return {
                        ...item,
                        list:[]
                    }
                }).sort((a,b)=> a.creatData - b.creatData)
            }
        });
    } catch (error) {
        console.error(error);
    }
}



export async function updateValidationDetail(nanoid: string, data: any) {
    try {
        const validation = await db.validation.where('nanoid').equals(nanoid).modify(data);
    } catch (error) {
        console.error(error);
    }
}

export async function updateActiveValidation(tuningid: string, nanoid: string) {
    try {
        await db.validation.where('tuningid').equals(tuningid).modify({ isActive:false});
        await db.validation.where('nanoid').equals(nanoid).modify({ isActive:true});
    } catch (error) {
        console.error(error);
    }
}

export async function getTargetValidation(nanoid: string) {
    try {
        const validation = await db.validation.where('nanoid').equals(nanoid).first();
        return validation;
    } catch (error) {
        console.error(error);
    }
}

export async function deleteValidation(nanoid: string) {
    try {
        const validation = await db.validation.where('nanoid').equals(nanoid).delete();
        return validation;
    } catch (error) {
        console.error(error);
    }
}

export async function newValidation(
    name: string = 'unknow',
    tuningid:string
) {
    try {
        const id = makeNodeId()
        await db.validation.put({
            nanoid:id,
            tuningid:tuningid,
            name: name,
            fileid:'',
            list: [],
            isUpload:false,
            isActive:true,
            creatData: dayjs().valueOf(),
            updateDate: dayjs().valueOf(),
        });
        return id
    } catch (error) {
        console.error(error);
    }
}
