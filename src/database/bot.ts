import { db } from './root';
import { activeProject } from '@/stores/project';

export function storeBot(nanoid: string, data: any) {
  // if(undo&&redo){
  try {
    db.bots.put({
      nanoid: nanoid,
      ...data,
    });
  } catch (error) {}
  // }
}

export async function getCurrentBot() {
  const { activeProjectID } = activeProject;
  const bots = await db.bots.where('nanoid').equals(activeProjectID).toArray();
  return bots;
}

export async function getTargetBot(nanoid: string) {
  const bots = await db.bots.where('nanoid').equals(nanoid).first();
  return bots;
}
