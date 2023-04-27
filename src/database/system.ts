import { db } from './root';
import { activeProject } from '@/stores/project';

export function storeSystem(nanoid: string, data: any) {
  // if(undo&&redo){
  try {
    db.systems.put({
      nanoid: nanoid,
      ...data,
    });
  } catch (error) {}
  // }
}

export async function getTargetsyStemsWithFatherid(
  nanoid: string,
  fatherid: string,
) {
  const systems = await db.systems
    .where({ nanoid: nanoid, fatherid: fatherid })
    .first();
  return systems;
}

export async function deleteTargetSystems(nanoid: string, fatherid: string) {
  try {
    const systems = await db.systems
      .where({ nanoid: nanoid, fatherid: fatherid })
      .delete();
  } catch (error) {}
}

export async function getCurrentSystem() {
  const { activeProjectID } = activeProject;
  const systems = await db.systems
    .where('nanoid')
    .equals(activeProjectID)
    .toArray();
  return systems;
}

export async function getTargetSystem(nanoid: string) {
  const systems = await db.systems.where('nanoid').equals(nanoid).toArray();
  return systems;
}
