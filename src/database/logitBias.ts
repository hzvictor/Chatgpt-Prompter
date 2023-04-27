import { db } from './root';
import { activeProject } from '@/stores/project';

export function storeLogitBias(nanoid: string, data: any) {
  // if(undo&&redo){
  try {
    db.logitBias.put({
      nanoid: nanoid,
      ...data,
    });
  } catch (error) {}
  // }
}

export async function getTargetLogitBiasWithFatherid(
  nanoid: string,
  fatherid: string,
) {
  const logitBias = await db.logitBias
    .where({ nanoid: nanoid, fatherid: fatherid })
    .first();
  return logitBias;
}

export async function deleteTargetLogitBias(nanoid: string, fatherid: string) {
  // if(undo&&redo){
  try {
    const logitBias = await db.logitBias
      .where({ nanoid: nanoid, fatherid: fatherid })
      .delete();
  } catch (error) {}
  // }
}

export async function getCurrentLogitBias() {
  const { activeProjectID } = activeProject;
  const logitBias = await db.logitBias
    .where('nanoid')
    .equals(activeProjectID)
    .toArray();
  return logitBias;
}

export async function getTargetLogitBias(nanoid: string) {
  const logitBias = await db.logitBias.where('nanoid').equals(nanoid).toArray();
  return logitBias;
}
