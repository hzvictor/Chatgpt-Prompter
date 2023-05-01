import Dexie from 'dexie';
export const db: any = new Dexie('prompter');

db.version(9).stores({
    project:'nanoid, name, describe, cover, model, type, avatar, layoutConfig, creatData, updateDate, publishDate',
    tuning:'nanoid, name, list, projectid, fine_tuned_model, trainConfig, isTrain, isActive,creatData, updateDate',
    validation:'nanoid, name, list, fileid, isUpload, isActive, tuningid, creatData, updateDate'
});