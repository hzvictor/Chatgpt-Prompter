import { db } from './root';

export function storeFunctions({
  nanoid, lang, type, code, testData, expected, output, isPass,creatData
}: any) {
  // if(undo&&redo){
  try {
    db.functions.put({ nanoid, lang, type, code, testData, expected, output, isPass,creatData });
  } catch (error) {}
  // }
}
export function updateFunctions({ nanoid, content }: any) {
  // if(undo&&redo){
  try {
    db.functions.where({ nanoid }).modify(content);
  } catch (error) {}
  // }
}


export async function getTargetFunctions( nanoid: any) {
  const functionstring = await db.functions.where({ nanoid:nanoid}).first();
  return functionstring;
}

export async function deleteTargetFunctions({ nanoid }: any) {
  const functionstring = await db.functions
    .where({ nanoid })
    .delete();
  return functionstring;
}
