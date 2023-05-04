import Dexie from 'dexie';
export const db: any = new Dexie('prompter');

db.version(25).stores({
    project:'nanoid, name, describe, cover, model, type, layoutConfig, creatData, updateDate, publishDate',
    tuning:'nanoid, name, list, projectid, fine_tuned_model, trainConfig, isTrain, isActive,creatData, updateDate',
    validation:'nanoid, name, list, fileid, isUpload, isActive, tuningid, creatData, updateDate',
    slidelist:'nanoid, name, config, projectid, isActive, creatData, updateDate',
    test:'nanoid, name, list, isSynchronize, isActive, projectid, creatData, updateDate',
    chatbot: 'nanoid, projectid, botConfig, quickReplies, strategyId, history, prompt, modify, allModify, functionMap,  historyFunction, quickRepliesFunctionTree, userFunctionTree, botFunctionTree, firstTimeEntryTree, messageHistorys, graphJson,creatData, updateDate'
});
// describe, tags, avatar, name, historyStrategy

//  