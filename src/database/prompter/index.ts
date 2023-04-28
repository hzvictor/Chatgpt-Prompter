import Dexie from 'dexie';
export const db: any = new Dexie('prompter');

db.version(1).stores({
    project:
        'nanoid, name, describe, cover,  model, type, avatar, creatData, updateDate, publishDate',
});