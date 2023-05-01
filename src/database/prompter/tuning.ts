import dayjs from 'dayjs';
import { db } from './index';
import { makeNodeId } from '@/utils/withNodeId';

export async function getAllTuningList() {
    try {
        return await db.tuning.toArray();
    } catch (error) {
        console.error(error);
    }
}

export async function getProjectTuningList(projectid:string) {
    try {
        return await db.tuning.where('projectid').equals(projectid).toArray((items:any)=>{
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



export async function updateTuningDetail(nanoid: string, data: any) {
    try {
        const tuning = await db.tuning.where('nanoid').equals(nanoid).modify(data);
    } catch (error) {
        console.error(error);
    }
}

export async function updateActiveTuning(projectid: string, nanoid: string) {
    try {
        await db.tuning.where('projectid').equals(projectid).modify({ isActive:false});
        await db.tuning.where('nanoid').equals(nanoid).modify({ isActive:true});
    } catch (error) {
        console.error(error);
    }
}

export async function getTargetTuning(nanoid: string) {
    try {
        const tuning = await db.tuning.where('nanoid').equals(nanoid).first();
        return tuning;
    } catch (error) {
        console.error(error);
    }
}

export async function deleteTuning(nanoid: string) {
    try {
        const tuning = await db.tuning.where('nanoid').equals(nanoid).delete();
        return tuning;
    } catch (error) {
        console.error(error);
    }
}


// db.tuning.put({
//   nanoid: activeProjectID,
//   [opts.key]: JSON.stringify(snapshot(state)),
// });

export async function newTuning(
    name: string = 'unknow',
    projectid:string,

) {
    try {
        const id = makeNodeId()
        await db.tuning.put({
            nanoid:id,
            name: name,
            projectid: projectid,
            list: [],
            isTrain: false, 
            fine_tuned_model:'',
            isActive:true,
            trainConfig: {},
            creatData: dayjs().valueOf(),
            updateDate: dayjs().valueOf(),
        });

        return id
    } catch (error) {
        console.error(error);
    }
}
