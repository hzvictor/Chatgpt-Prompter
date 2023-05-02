import dayjs from 'dayjs';
import { db } from './index';
import { makeNodeId } from '@/utils/withNodeId';

export async function getAllTestList() {
    try {
        return await db.test.toArray();
    } catch (error) {
        console.error(error);
    }
}

export async function getProjectTestList(projectid:string) {
    try {
        return await db.test.where('projectid').equals(projectid).toArray((items:any)=>{
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



export async function updateTestDetail(nanoid: string, data: any) {
    try {
        const test = await db.test.where('nanoid').equals(nanoid).modify(data);
    } catch (error) {
        console.error(error);
    }
}

export async function updateActiveTest(projectid: string, nanoid: string) {
    try {
        await db.test.where('projectid').equals(projectid).modify({ isActive:false});
        await db.test.where('nanoid').equals(nanoid).modify({ isActive:true});
    } catch (error) {
        console.error(error);
    }
}

export async function getTargetTest(nanoid: string) {
    try {
        const test = await db.test.where('nanoid').equals(nanoid).first();
        return test;
    } catch (error) {
        console.error(error);
    }
}

export async function deleteTest(nanoid: string) {
    try {
        const test = await db.test.where('nanoid').equals(nanoid).delete();
        return test;
    } catch (error) {
        console.error(error);
    }
}


// db.test.put({
//   nanoid: activeProjectID,
//   [opts.key]: JSON.stringify(snapshot(state)),
// });

export async function newTest(
    name: string = 'unknow',
    projectid:string,

) {
    try {
        const id = makeNodeId()
        await db.test.put({
            nanoid:id,
            name: name,
            projectid: projectid,
            list: [],
            isSynchronize: false, 
            isActive:true,
            creatData: dayjs().valueOf(),
            updateDate: dayjs().valueOf(),
        });

        return id
    } catch (error) {
        console.error(error);
    }
}
