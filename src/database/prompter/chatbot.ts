import dayjs from 'dayjs';
import { db } from './index';
import { makeNodeId } from '@/utils/withNodeId';

export async function getAllChatbotList() {
    try {
        return await db.chatbot.toArray();
    } catch (error) {
        console.error(error);
    }
}

export async function getProjectChatbot(projectid: string) {
    try {
        return await db.chatbot.where('projectid').equals(projectid).first();
    } catch (error) {
        console.error(error);
    }
}



export async function updateChatbotDetail(nanoid: string, data: any) {
    try {
        const chatbot = await db.chatbot.where('nanoid').equals(nanoid).modify(data);
    } catch (error) {
        console.error(error);
    }
}

export async function getTargetChatbot(nanoid: string) {
    try {
        const chatbot = await db.chatbot.where('nanoid').equals(nanoid).first();
        return chatbot;
    } catch (error) {
        console.error(error);
    }
}

export async function deleteChatbot(nanoid: string) {
    try {
        const chatbot = await db.chatbot.where('nanoid').equals(nanoid).delete();
        return chatbot;
    } catch (error) {
        console.error(error);
    }
}


export async function newChatbot(
    projectid: string,

) {
    try {
        const id = makeNodeId()
        await db.chatbot.put({
            nanoid: id,
            projectid: projectid,
            botConfig:{},
            creatData: dayjs().valueOf(),
            updateDate: dayjs().valueOf(),
        });

        return id
    } catch (error) {
        console.error(error);
    }
}
