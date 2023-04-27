import { chatbox } from './root';
import { activeBot } from '@/stores/chatboxs/activebot';

export function storeMessageHistory(nanoid: string, fatherid:string ) {
  // if(undo&&redo){
  try {
    chatbox.messageHistorys.put({
      nanoid: nanoid,
      fatherid:fatherid,
      list:[],
    });
  } catch (error) {}
  // }
}


export async function getMessageHistorysBot(fatherid:string) {
  const messageHistorys = await chatbox.messageHistorys.where({ fatherid: fatherid }).toArray();
  return messageHistorys;
}



export async function getCurrentMessageHistory() {
  const { activebotID } = activeBot;
  const messageHistorys = await chatbox.messageHistorys
    .where('nanoid')
    .equals(activebotID)
    .first();
  return messageHistorys;
}


export async function getTargetMessageHistory(nanoid: string) {
  const messageHistorys = await chatbox.messageHistorys
    .where('nanoid')
    .equals(nanoid)
    .first();
  return messageHistorys;
}


export async function deleteMessage(nanoid:string){
  const bots = await chatbox.messageHistorys.where('nanoid').equals(nanoid).delete();
}

