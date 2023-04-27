import { db } from './root';
import { activeProject } from '@/stores/project';

export function storeActiveMessage(nanoid: string, data: any) {
  // if(undo&&redo){
  try {
    db.activeMessages.put({
      nanoid: nanoid,
      ...data,
    });
  } catch (error) {}
  // }
}

export async function getCurrentActiveMessage() {
  const { activeProjectID } = activeProject;
  const activeMessages = await db.activeMessages
    .where('nanoid')
    .equals(activeProjectID)
    .toArray();
  return activeMessages;
}

export async function getTargetActiveMessage(nanoid: string) {
  console.log(nanoid,'nanoid')
  const activeMessages = await db.activeMessages
    .where('nanoid')
    .equals(nanoid)
    .first();
  return activeMessages;
}
