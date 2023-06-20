import Dexie from 'dexie';
export const db: any = new Dexie('prompter');

db.version(33).stores({
    project: 'nanoid, name, describe, cover, model, type, layoutConfig, creatData, updateDate, publishDate',
    tuning: 'nanoid, name, list, projectid, fine_tuned_model, trainConfig, isTrain, tasks, isActive, creatData, updateDate',
    validation: 'nanoid, name, list, fileid, isUpload, isActive, tuningid, tasks, creatData, updateDate',
    slidelist: 'nanoid, name, config, projectid, isActive, creatData, updateDate',
    test: 'nanoid, name, list, isSynchronize, isActive, projectid, creatData, updateDate',
    prompt: 'nanoid, name, list, isActive, projectid, creatData, updateDate',
    chatbot: 'nanoid, projectid, botConfig, quickReplies, historyFunction, history, parameter, modify, allModify, functionMap, quickRepliesFunctionTree, userFunctionTree, botFunctionTree, firstTimeEntryTree, messageHistorys, graphJson,creatData, updateDate',
    functions: 'nanoid, type, code, testData, output, expected, isPass, creatData, updateDate'
});
// describe, tags, avatar, name, historyStrategy

//  