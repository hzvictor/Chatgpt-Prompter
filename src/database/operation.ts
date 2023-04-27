import { db } from './root';
import { activeProject } from '@/stores/project';

export function storeOperations({
  nanoid,
  type,
  fatherid,
  typeid,
  history,
}: any) {
  // if(undo&&redo){
  try {
    db.operations.put({ nanoid, type, fatherid, typeid, history });
  } catch (error) {}
  // }
}
export function updateOperations({ type, fatherid, typeid, history }: any) {
  // if(undo&&redo){
  try {
    db.operations.where({ type, fatherid, typeid }).modify({
      history,
    });
  } catch (error) {}
  // }
}

export async function getCurrentOperations() {
  const { activeProjectID } = activeProject;
  const history = await db.operations
    .where('nanoid')
    .equals(activeProjectID)
    .toArray();
  return history;
}

export async function getTargetOperations({ type, fatherid, typeid }: any) {
  const history = await db.operations.where({ type, fatherid, typeid }).first();
  return history;
}

export async function deleteTargetOperations({ type, fatherid, typeid }: any) {
  const history = await db.operations
    .where({ type, fatherid, typeid })
    .delete();
  return history;
}
