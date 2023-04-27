import { db } from './root';
import { activeProject } from '@/stores/project';
import { async } from '@antv/x6/lib/registry/marker/main';

export function storeSlideLists(nanoid: string, data: any) {
  // if(undo&&redo){
  try {
    db.slideLists.put({
      nanoid: nanoid,
      ...data,
    });
  } catch (error) {}
  // }
}

export async function getTargetSlideListsWithFatherid(
  nanoid: string,
  fatherid: string,
) {
  const slideLists = await db.slideLists
    .where({ nanoid: nanoid, fatherid: fatherid })
    .first();
  return slideLists;
}

export async function deleteTargetSlideLists(nanoid: string, fatherid: string) {
  // if(undo&&redo){
  try {
    const slideLists = await db.slideLists
      .where({ nanoid: nanoid, fatherid: fatherid })
      .delete();
  } catch (error) {}
  // }
}

export async function getCurrentSlideLists() {
  const { activeProjectID } = activeProject;
  const slideLists = await db.slideLists
    .where('nanoid')
    .equals(activeProjectID)
    .toArray();
  return slideLists;
}

export async function getTargetSlideLists(nanoid: string) {
  const slideLists = await db.slideLists
    .where('nanoid')
    .equals(nanoid)
    .toArray();
  return slideLists;
}
