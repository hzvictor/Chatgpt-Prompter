import { db } from './root';
import { activeProject } from '@/stores/project';

export function storeModifys(nanoid: string, data: any) {
  // if(undo&&redo){
  try {
    db.modifys.put({
      nanoid: nanoid,
      ...data,
    });
  } catch (error) {}
  // }
}

export async function getCurrentModifys() {
  const { activeProjectID } = activeProject;
  const modifys = await db.modifys
    .where('nanoid')
    .equals(activeProjectID)
    .toArray();
  return modifys;
}

export async function getTargetModifys(nanoid: string) {
  const modifys = await db.modifys.where('nanoid').equals(nanoid).first();
  return modifys;
}
