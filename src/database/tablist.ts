import { db } from './root';
import { activeProject } from '@/stores/project';

export function storeTablist(nanoid: string, data: any) {
  // if(undo&&redo){
  try {
    db.tabData.put({
      nanoid: nanoid,
      ...data,
    });
  } catch (error) {}
  // }
}

export async function getTargetTablist(nanoid: string) {
  const tabData = await db.tabData.where('nanoid').equals(nanoid).first();
  return tabData;
}


export function updateTablist(nanoid: string, data: any) {
  // if(undo&&redo){
  try {
    db.tabData.where('nanoid').equals(nanoid).modify(data)
  } catch (error) {}
  // }
}