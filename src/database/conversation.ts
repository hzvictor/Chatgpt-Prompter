import { db } from './root';
import { activeProject } from '@/stores/project';

export function storeConversation(nanoid: string, data: any) {
  // if(undo&&redo){
  try {
    db.conversations.put({
      nanoid: nanoid,
      ...data,
    });
  } catch (error) {}
  // }
}

export async function getTargetConversationsWithFatherid(
  nanoid: string,
  fatherid: string,
) {
  const conversations = await db.conversations
    .where({ nanoid: nanoid, fatherid: fatherid })
    .first();
  return conversations;
}

export async function deleteTargetConversations(
  nanoid: string,
  fatherid: string,
) {
  try {
    const conversations = await db.conversations
      .where({ nanoid: nanoid, fatherid: fatherid })
      .delete();
  } catch (error) {}
}

export async function getCurrentConversations() {
  const { activeProjectID } = activeProject;
  const conversations = await db.conversations
    .where('nanoid')
    .equals(activeProjectID)
    .toArray();
  return conversations;
}

export async function getTargetConversation(nanoid: string) {
  const conversations = await db.conversations
    .where('nanoid')
    .equals(nanoid)
    .toArray();
  return conversations;
}
