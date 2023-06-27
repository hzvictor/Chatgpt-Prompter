import dayjs from 'dayjs';
import { db } from './index';
import { makeNodeId } from '@/utils/withNodeId';

export async function getAllSlidelistList() {
    try {
        return await db.slidelist.toArray();
    } catch (error) {
        console.error(error);
    }
}

export async function getProjectSlidelistList(projectid:string) {
    try {
        return await db.slidelist.where('projectid').equals(projectid).toArray((items:any)=>{
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

// export async function getActiveSlidelist( projectid:string) {
//     try {
//         const slidelist = await db.slidelist.where({'projectid':projectid,isActive: true}).first();
//         return slidelist;
//     } catch (error) {
//         console.error(error);
//     }
// }



export async function updateSlidelistDetail(nanoid: string, data: any) {
    try {
        const slidelist = await db.slidelist.where('nanoid').equals(nanoid).modify(data);
    } catch (error) {
        console.error(error);
    }
}

export async function updateActiveSlidelist(projectid: string, nanoid: string) {
    try {
        await db.slidelist.where('projectid').equals(projectid).modify({ isActive:false});
        await db.slidelist.where('nanoid').equals(nanoid).modify({ isActive:true});
    } catch (error) {
        console.error(error);
    }
}

export async function getTargetSlidelist(nanoid: string) {
    try {
        const slidelist = await db.slidelist.where('nanoid').equals(nanoid).first();
        return slidelist;
    } catch (error) {
        console.error(error);
    }
}

export async function deleteSlidelist(nanoid: string) {
    try {
        const slidelist = await db.slidelist.where('nanoid').equals(nanoid).delete();
        return slidelist;
    } catch (error) {
        console.error(error);
    }
}


// db.slidelist.put({
//   nanoid: activeProjectID,
//   [opts.key]: JSON.stringify(snapshot(state)),
// });

export async function newSlidelist(
    name: string = 'unknow',
    projectid:string,
    config:any = {},

) {
    try {
        const id = makeNodeId()
        await db.slidelist.put({
            nanoid:id,
            name: name,
            projectid: projectid,
            config:config,
            isActive:true,
            creatData: dayjs().valueOf(),
            updateDate: dayjs().valueOf(),
        });

        return id
    } catch (error) {
        console.error(error);
    }
}
