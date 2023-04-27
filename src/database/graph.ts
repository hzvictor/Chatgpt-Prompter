import { db } from './root';
import { activeProject } from '@/stores/project';

export function storeGraphs(nanoid: string, data: any) {
  // if(undo&&redo){
  try {
    db.graphs.put({
      nanoid: nanoid,
      ...data,
    });
  } catch (error) {}
  // }
}

export async function getCurrentGraphs() {
  const { activeProjectID } = activeProject;
  const graphs = await db.graphs
    .where('nanoid')
    .equals(activeProjectID)
    .toArray();
  return graphs;
}

export async function getTargetGraphs(nanoid: string) {
  const graphs = await db.graphs.where('nanoid').equals(nanoid).toArray();
  return graphs;
}
