import { db } from './root';
import { activeProject } from '@/stores/project';

export function storeTest(nanoid: string, data: any) {
  // if(undo&&redo){
  try {
    db.tests.put({
      nanoid: nanoid,
      ...data,
    });
  } catch (error) {}
  // }
}

export async function getTargetTestsWithFatherid(
  nanoid: string,
  fatherid: string,
) {
  const tests = await db.tests
    .where({ nanoid: nanoid, fatherid: fatherid })
    .first();
  return tests;
}

export async function deleteTargetTests(nanoid: string, fatherid: string) {
  try {
    const tests = await db.tests
      .where({ nanoid: nanoid, fatherid: fatherid })
      .delete();
  } catch (error) {}
}

export async function getCurrentTest() {
  const { activeProjectID } = activeProject;
  const tests = await db.tests
    .where('nanoid')
    .equals(activeProjectID)
    .toArray();
  return tests;
}

export async function getTargetTest(nanoid: string) {
  const tests = await db.tests.where('nanoid').equals(nanoid).toArray();
  return tests;
}
