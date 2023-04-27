import { db } from './root';
import { activeProject } from '@/stores/project';

export function storeMessageHistory(nanoid: string, data: any) {
  // if(undo&&redo){
  try {
    db.messageHistorys.put({
      nanoid: nanoid,
      ...data,
    });
  } catch (error) {}
  // }
}

export async function getCurrentMessageHistory() {
  const { activeProjectID } = activeProject;
  const messageHistorys = await db.messageHistorys
    .where('nanoid')
    .equals(activeProjectID)
    .first();
  return messageHistorys;
}

export async function getTargetMessageHistory(nanoid: string) {
  const messageHistorys = await db.messageHistorys
    .where('nanoid')
    .equals(nanoid)
    .first();
  return messageHistorys;
}
