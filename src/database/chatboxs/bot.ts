import { chatbox } from './root';


export function storeBot(nanoid: string, data: any) {
  // if(undo&&redo){
  try {
    chatbox.bots.put({
      nanoid: nanoid,
      ...data,
    });
  } catch (error) {}
  // }
}

export async function getAllBot() {

  const bots = await chatbox.bots.toArray();
  return bots;
}

export function updateBotToDB(nanoid: string, data: any) {
  // if(undo&&redo){
  try {
    chatbox.bots.where('nanoid').equals(nanoid).modify(data)
  } catch (error) {}
  // }
}

// export async function getCurrentBot() {
//   const { activeProjectID } = activeProject;
//   const bots = await chatbox.bots.where('nanoid').equals(activeProjectID).toArray();
//   return bots;
// }

export async function getTargetBot(nanoid: string) {
  const bots = await chatbox.bots.where('nanoid').equals(nanoid).first();
  return bots;
}

export async function deletebot(nanoid:string){
  const bots = await chatbox.bots.where('nanoid').equals(nanoid).delete();
  const messageHistorys = await chatbox.messageHistorys.where({ fatherid: nanoid }).delete();
}

