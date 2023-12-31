import { getTargetFunctions } from '@/database/functions'
import { removeJavascriptComments } from '@/utils/little'
import conversationStore from '@/stores/conversation';
import systemStore from '@/stores/system';
import logitBiasStore from '@/stores/logitBias';
import slideListsStore from '@/stores/slideLists';
import modifyStore from '@/stores/modify';
import messageHistoryStore from '@/stores/messageHistory';
import { snapshot } from 'valtio'
const { conversationState } = conversationStore;
const { slideListsState } = slideListsStore;
const { logitBiasState } = logitBiasStore;
const { systemState } = systemStore;
const { messageHistoryState } = messageHistoryStore;
const { modifyState } = modifyStore;
import { notification } from 'antd';
import { getJsWorker } from '@/utils/handelFunction'
// import { graphState } from '@/stores/graph';


export const getNodeType = (targetId: string, nodeList: any) => {
    const targetNode = nodeList.find((item: any) => item.id == targetId)
    return targetNode
}

export const getGraphTree = (nodeList: any) => {
    const allLine: any = []
    const nodes: any = new Set();
    const relationshp: any = new Map()
    nodeList.forEach((item: any) => {
        if (!item.shape) {
            return
        }
        if (item.shape == 'edge') {
            const tnode = getNodeType(item.target.cell, nodeList)
            const snode = getNodeType(item.source.cell, nodeList)
            if (!tnode) {
                return
            }
            if (!snode) {
                return
            }
            if (tnode.shape == 'main-function-trigger') {
                const bottomPorts = tnode.ports.items.filter((item: any) => item.group == 'bottom')
                bottomPorts.forEach((bottomItem: any) => {
                    allLine.push({
                        sourceid: item.source.cell,
                        targetid: bottomItem.id
                    })
                    relationshp.set(item.target.cell, item.id)
                    nodes.add(item.source.cell)
                    nodes.add(bottomItem.id)
                })
            } else if (snode.shape == 'main-function-trigger') {
                allLine.push({
                    sourceid: item.source.port,
                    targetid: item.target.cell
                })
                nodes.add(item.source.port,)
                nodes.add(item.target.cell)
                relationshp.set(item.target.cell, item.id)
            }
            else {
                allLine.push({
                    sourceid: item.source.cell,
                    targetid: item.target.cell
                })
                relationshp.set(item.target.cell, item.id)
                nodes.add(item.source.cell)
                nodes.add(item.target.cell)
            }
        }
    })
    let tree = buildTree(allLine)
    const output = removeDuplicates(tree);

    // console.log(tree)

    return {
        tree: output,
        nodes: nodes,
        relationshp: relationshp
    }
}

function removeDuplicates(tree: any) {
    const hashTable = {} as any;

    function traverse(node) {
        if (!tree[node]) {
            return;
        }

        if (hashTable[node] === true) {
            delete tree[node];
            return;
        }

        hashTable[node] = true;
        const children = tree[node] || {};

        for (const child in children) {
            traverse(child);
        }
    }

    for (const node in tree) {
        traverse(node);
    }

    return tree;
}


function buildTree(input: any) {
    const tree = {} as any;
    const nodes = {} as any;

    // 构建节点映射
    for (const { sourceid, targetid } of input) {
        nodes[sourceid] = nodes[sourceid] || {};
        nodes[targetid] = nodes[targetid] || {};
    }

    // 构建树
    for (const { sourceid, targetid } of input) {
        const sourceNode = nodes[sourceid];
        const targetNode = nodes[targetid];
        sourceNode[targetid] = targetNode;
        if (!tree[sourceid]) {
            tree[sourceid] = sourceNode;
        }
    }

    return tree;
}

const sampleFunction = `function sampleFunction (){
    return true
}`




async function handMainFunctionTrigger(map: any, item: any) {
    const res = await getTargetFunctions(item.id)
    if (res && res.code.length > 0 && res.isPass == true) {
        let CODE: string;
        CODE = removeJavascriptComments(res.code)
        CODE = CODE.trim()

        const bottomPorts = item.ports.items.filter((item: any) => item.group == 'bottom')
        bottomPorts.forEach((bottomItem: any) => {
            if (bottomItem.data.bol) {
                map.set(bottomItem.id, {
                    type: 'trigger',
                    id: item.id,
                    function: {
                        content: CODE,
                        triggerType: true,
                    }
                })
            } else {
                map.set(bottomItem.id, {
                    type: 'trigger',
                    id: item.id,
                    function: {
                        content: CODE,
                        triggerType: false,
                    }
                })
            }
        })
    } else {
        const bottomPorts = item.ports.items.filter((item: any) => item.group == 'bottom')
        bottomPorts.forEach((bottomItem: any) => {
            map.set(bottomItem.id, {
                id: item.id,
                type: 'error',
            })
        })
    }
}

function exchangeForml(formula: string) {
    switch (formula) {
        case 'equal':
            return '=='
        case 'notequal':
            return '!='
        case 'lessthan':
            return '<'
        case 'greaterthan':
            return '>'
        default:
            break;
    }
}


function handMessageIndex(map: any, item: any) {
    const formula = exchangeForml(item.data.formula)
    const code = `function Trigger(inputData) {
        if(inputData.index.${item.data.role} ${formula} ${item.data.index}){
            return true
        } else{
            return false
        }
        
    }`
    map.set(item.id, {
        type: 'trigger',
        id: item.id,
        function: {
            content: code,
            triggerType: 'true',
            lang: 'javascript',
        }
    })
}

function handStringLength(map: any, item: any) {
    const formula = exchangeForml(item.data.formula)
    const code = `function Trigger(inputData) {
        if(inputContent.length ${formula} ${item.data.index}){
            return true
        } else{
            return false
        }

    }`
    map.set(item.id, {
        type: 'trigger',
        id: item.id,
        function: {
            content: code,
            triggerType: 'true',
            lang: 'javascript',
        }
    })
}

function handMatchString(map: any, item: any) {
    let code = ''
    if (item.data.formula == 'equal' || item.data.formula == 'notequal') {
        const formula = exchangeForml(item.data.formula)
        code = `function Trigger(inputData) {
        if(inputData.index.${item.data.role} ${formula} ${item.data.index}){
            return true
        } else{
            return false
        }
        
    }`
    } else if (item.data.formula == 'contains') {
        code = `function Trigger(inputData) {
            if(inputData.input.content.text.includes('${item.data.string}')){
                return true
            } else{
                return false
            }
            
        }`
    } else if (item.data.formula == 'notContains') {
        code = `function Trigger(inputData) {
            if(!inputData.input.content.text.includes('${item.data.string}')){
                return true
            } else{
                return false
            }
            
        }`
    } else if (item.data.formula == 'startsWith') {
        code = `function Trigger(inputData) {
            if(!inputData.input.content.text.startsWith('${item.data.string}')){
                return true
            } else{
                return false
            }
            
        }`
    } else if (item.data.formula == 'endsWith') {
        code = `function Trigger(inputData) {
            if(!inputData.input.content.text.endsWith('${item.data.string}')){
                return true
            } else{
                return false
            }
            
        }`
    } else {
        code = sampleFunction
    }
    map.set(item.id, {
        type: 'trigger',
        id: item.id,
        function: {
            content: code,
            triggerType: 'true',
            lang: 'javascript',
        }
    })
}

function handSendPicture(map: any, item: any) {

    const pictureList = item.data.fileList.filter((item: any) => item.url).map((item: any) => item.url)

    map.set(item.id, {
        type: 'message',
        id: item.id,
        message: {
            type: 'image',
            pictureList: pictureList
        },
    })
}

async function handSendStringFunction(map: any, item: any) {
    const res = await getTargetFunctions(item.id)
    if (res && res.code.length > 0 && res.isPass == true) {
        let CODE: string;
        CODE = removeJavascriptComments(res.code)
        CODE = CODE.trim()

        map.set(item.id, {
            type: 'message',
            id: item.id,
            message: {
                type: 'function',
                function: {
                    content: CODE,
                }
            },
        })
    } else {
        map.set(item.id, {
            id: item.id,
            type: 'error',
        })
    }
}


function handReplaceString(map: any, item: any) {
    let code = `function Replace(inputData) {
        let newStr = inputData.input.content.text.replace(/${item.data.string}/g, "${item.data.replace}");
        return newStr
    }`

    // console.log(code, item,99999999)
    map.set(item.id, {
        type: 'replace',
        id: item.id,
        replaceType: 'function',
        replacePart: 'input',
        function: {
            content: code,
        }
    })
}


function handReplacePrompt(map: any, item: any) {
    map.set(item.id, {
        type: 'replace',
        id: item.id,
        replaceType: 'straight',
        replacePart: 'prompt',
        prompt: item.data.prompt
    })
}
function handReplaceModify(map: any, item: any) {
    map.set(item.id, {
        type: 'replace',
        id: item.id,
        replaceType: 'straight',
        replacePart: 'modify',
        modify: item.data
    })
}

function handReplaceParameter(map: any, item: any) {
    map.set(item.id, {
        type: 'replace',
        id: item.id,
        replaceType: 'straight',
        replacePart: 'parameter',
        parameter: item.data
    })
}
async function handReplaceModifyFunction(map: any, item: any) {
    const res = await getTargetFunctions(item.id)
    if (res && res.code.length > 0 && res.isPass == true) {
        let CODE: string;
        CODE = removeJavascriptComments(res.code)
        CODE = CODE.trim()
        map.set(item.id, {
            type: 'replace',
            id: item.id,
            replaceType: 'function',
            replacePart: 'modify',
            function: {
                content: CODE,
            }
        })
    } else {
        map.set(item.id, {
            type: 'error',
            id: item.id,
        })
    }
}
async function handReplaceStringFunction(map: any, item: any) {
    const res = await getTargetFunctions(item.id)

    if (res && res.code.length > 0 && res.isPass == true) {
        let CODE: string;

        CODE = removeJavascriptComments(res.code)
        CODE = CODE.trim()

        map.set(item.id, {
            type: 'replace',
            id: item.id,
            replaceType: 'function',
            replacePart: 'input',
            function: {
                content: CODE,
            }
        })
    } else {
        map.set(item.id, {
            id: item.id,
            type: 'error',
        })
    }
}
async function handReplacePromptFunction(map: any, item: any) {
    const res = await getTargetFunctions(item.id)

    if (res && res.code.length > 0 && res.isPass == true) {
        let CODE: string;

        CODE = removeJavascriptComments(res.code)
        CODE = CODE.trim()

        map.set(item.id, {
            type: 'replace',
            id: item.id,
            replaceType: 'function',
            replacePart: 'prompt',
            function: {
                content: CODE,
            }
        })
    } else {
        map.set(item.id, {
            id: item.id,
            type: 'error',
        })
    }
}

async function handReplaceHistoryStrategyFunction(map: any, item: any) {
    const res = await getTargetFunctions(item.id)

    if (res && res.code.length > 0 && res.isPass == true) {
        let CODE: string;

        CODE = removeJavascriptComments(res.code)
        CODE = CODE.trim()

        map.set(item.id, {
            type: 'replace',
            id: item.id,
            replaceType: 'straight',
            replacePart: 'historyFunction',
            historyFunction: {
                content: CODE,
            }
        })
    } else {
        map.set(item.id, {
            id: item.id,
            type: 'error',
        })
    }
}

export async function getFunctionMap(nodeList: any, nodes: any) {
    const functionoMap = new Map();
    const promises = nodeList.map(async (item: any) => {
        if (!nodes.has(item.id) && item?.ports?.items.length != 3) {
            return
        }
        if (item.shape != 'edge') {
            switch (item.shape) {
                case 'main-rect':
                    functionoMap.set(item.id, {
                        id: item.id,
                        type: item.data.type,
                    })
                    break;
                case 'shortcut-statement-node':
                    functionoMap.set(item.id, {
                        id: item.id,
                        type: 'shortcutStatement',
                    })
                    break;

                case 'main-function-trigger':
                    await handMainFunctionTrigger(functionoMap, item)
                    break;
                case 'message-index-node':
                    handMessageIndex(functionoMap, item)
                    break;
                case 'match-string-node':
                    handMatchString(functionoMap, item)
                    break;
                case 'string-length-node':
                    handStringLength(functionoMap, item)
                    break;
                case 'send-message-node':
                    functionoMap.set(item.id, {
                        type: 'message',
                        message: {
                            type: 'text',
                            id: item.id,
                            content: item.data.string
                        },
                    })
                    break;
                case 'function-send-message':
                    await handSendStringFunction(functionoMap, item)
                    break;
                case 'send-picture-node':
                    handSendPicture(functionoMap, item)
                    break;
                case 'stop-genurate-node':
                    functionoMap.set(item.id, {
                        id: item.id,
                        type: 'stopGenurate',
                    })
                    break;
                case 'replace-string-node':
                    handReplaceString(functionoMap, item)
                    
                    break;
                case 'replace-prompt-node':
                    handReplacePrompt(functionoMap, item)
                    break;
                case 'replace-modify-node':
                    handReplaceModify(functionoMap, item)
                    break;
                case 'replace-parameter-node':
                    handReplaceParameter(functionoMap, item)
                    break;
                case 'function-replace-message':
                    await handReplaceStringFunction(functionoMap, item)
                    break;
                case 'function-replace-modify':
                    await handReplaceModifyFunction(functionoMap, item)
                    break;
                case 'function-replace-prompt':
                    await handReplacePromptFunction(functionoMap, item)
                    break;
                case 'reset-history-node':
                    functionoMap.set(item.id, {
                        id: item.id,
                        type: 'resetHistory',
                    })
                    break;
                case 'clear-history-node':
                    functionoMap.set(item.id, {
                        id: item.id,
                        type: 'clearHistory',
                    })
                    break;
                case 'replace-history-strategy':
                    await handReplaceHistoryStrategyFunction(functionoMap, item)
                    break;
                default:
                    break;
            }
        }
        return true
    })

    await Promise.all(promises);
    return functionoMap
}


export function updateShotCut(nodeList: any) {
    const newShotcut: any = []
    nodeList.forEach((item: any) => {
        if (item.shape == 'shortcut-statement-node') {
            if (item.data.icon != 'null') {
                newShotcut.push({
                    key: item.id,
                    ...item.data
                })
            } else {
                newShotcut.push({
                    key: item.id,
                    isHighlight: item.data.isHighlight,
                    isNew: item.data.isNew,
                    name: item.data.name
                })
            }
        }
    })
    return newShotcut
}

export async function updataInfoToBot(nodeList: any) {
    const result = { functionMap: {}, quickRepliesFunctionTree: {} as any, userFunctionTree: {}, botFunctionTree: {}, firstTimeEntryTree: {} }


    const { tree, nodes, relationshp } = getGraphTree(nodeList)
    const functionMap = await getFunctionMap(nodeList, nodes)


    for (let index = 0; index < Object.keys(tree).length; index++) {

        const element = Object.keys(tree)[index];
        // console.log(element,111111)
        // console.log(functionMap.get(element).type,111111)
        if (functionMap.get(element).type == 'userInput') {
            result.userFunctionTree = tree[element]
        } else if (functionMap.get(element).type == 'assistantInput') {
            result.botFunctionTree = tree[element]
        } else if (functionMap.get(element).type == 'firstTimeEntry') {
            result.firstTimeEntryTree = tree[element]
        } else if (functionMap.get(element).type == 'shortcutStatement') {
            result.quickRepliesFunctionTree[functionMap.get(element).id] = tree[element]
        }
    }

    result.functionMap = Object.fromEntries(functionMap)

    return result
}



export async function piplineAllFunction(item: any, inputData: any) {

    const treeFuntionResult: any = {
        isContinue: true,
    }
    switch (item.type) {
        case 'message':
            switch (item.message.type) {
                case 'text':
                    // chatFunction.assistantSend('text', item.message.content)
                    treeFuntionResult.sendUsermessage = [{ type: 'text', content: {text:item.message.content} }]
                    break;
                case 'image':
                    treeFuntionResult.sendUsermessage = item.message.pictureList.map((selfItem: any) => {
                        return { type: 'image', content: {picUrl:selfItem} }
                    })
                    break;
                case 'function':

                    const worker = getJsWorker(item.message.function.content)
                    const result = await new Promise((resolve, reject) => {
                        worker.onmessage = e => resolve(e.data);
                        worker.onerror = e => {
                            notification.error({
                                description: JSON.stringify(e),
                                message: 'Send Message Function Error',
                                placement: 'topLeft',
                            });
                            reject(e)
                        };
                        worker.postMessage(inputData);
                    });

                    treeFuntionResult.sendUsermessage = [{ type: 'text', content: result }]


                    break
                default:
                    break;
            }
            break
        case 'trigger':
            const worker = getJsWorker(item.function.content)
            const result = await new Promise((resolve, reject) => {
                worker.onmessage = e => resolve(e.data);
                worker.onerror = e => {
                    notification.error({
                        description: JSON.stringify(e),
                        message: 'Trigger Function Error',
                        placement: 'topLeft',
                    });
                    reject(e)
                };
                worker.postMessage(inputData);
            });
            if (item.function.triggerType) {
                treeFuntionResult.isContinue = !!result
            } else {
                treeFuntionResult.isContinue = !result
            }

            break
        case 'replace':
            if (item.replaceType == 'function') {
                const worker = getJsWorker(item.function.content)
                const result = await new Promise((resolve, reject) => {
                    worker.onmessage = e => resolve(e.data);
                    worker.onerror = e => {
                        notification.error({
                            description: JSON.stringify(e),
                            message: 'Replace Words Function Error',
                            placement: 'topLeft',
                        });
                        reject(e)
                    };
                    worker.postMessage(inputData);
                });
                treeFuntionResult[item.replacePart] = result as any
            } else {
                treeFuntionResult[item.replacePart] = item[item.replacePart]
            }
            break

        case 'stopGenurate':
            treeFuntionResult.stopGenurate = true
            break
        case 'resetHistory':
            treeFuntionResult.resetHistory = true
            break
        case 'clearHistory':
            treeFuntionResult.clearHistory = true
            break
        case 'error':
            // const node = graphState.graph.findViewByCell(item.id)
            // treeFuntionResult.isContinue = false
            // node.cell.attr("body/fill", "#DB4D6D");
            // setTimeout(() => {
            //     node.cell.attr("body/fill", "#EFF4FF");
            // }, 3000)
            notification.error({
                description: 'You have some functions that fail the test',
                message: 'Function Error',
                placement: 'topLeft',
            });
        default:
            break
    }

    return treeFuntionResult
}





export function getRealData(input: string, role: string) {

   
}


export function filterUsefulInfo(list: any, inputData: any) {
    // console.log(list, inputData, 111111)
    const allDiff = list.map((item: any) => {
        delete item.isContinue
        return compareObj(inputData, item)
    })
    return mergeObjects(allDiff)
}

// function getConflict(list: any) {
//     console.log(list,'list')
//     for (var i = 0; i < list.length; i++) {
//         for (var j = i + 1; j < list.length; j++) {
//             if (list[i] !== list[j]) {
//                 // Do something with list[i] and list[j]
//                 const diff = compareObj(list[i], list[j])
//                 console.log(diff, 'diff')
//             }
//         }
//     }

// }

function mergeObjects(array: any) {
    let result: any = {};
    for (let i = 0; i < array.length; i++) {
        const obj = array[i];
        for (let key in obj) {
            if (key in result) {
                if (JSON.stringify(result[key]) == JSON.stringify(obj[key])) {
                    continue; // 如果属性值相等，则忽略冲突
                } else {
                    notification.error({
                        description: 'CONFLICT: ' + result[key] + ', ' + obj[key] + ', ' + 'The value used this time is ' + obj[key],
                        message: 'Trigger Function Error',
                        placement: 'topLeft',
                    });

                    result[key] = obj[key];
                }
            } else {
                result[key] = obj[key];
            }
        }
    }
    return result;
}

function compareObj(source: any, target: any) {
    const kyes = Object.keys(target)
    const different: any = {}
    for (let index = 0; index < kyes.length; index++) {
        const kye = kyes[index];
        if (JSON.stringify(source[kye]) != JSON.stringify(target[kye])) {
            different[kye] = target[kye]
        }

    }
    return different
}


// {
//     const pythonFunctionList = findPythonFunctionNames(item.function.content)
//     const script =
//         `from js import inputContent
// from js import promptInfo
// ${item.function.content}
// ${pythonFunctionList[0]}(inputContent,promptInfo)`;

//     const context = {
//         inputContent: inputData.input,
//         promptInfo: inputData
//     };

//     const { results, error } = await asyncRun(script, context);
//     if (JSON.stringify(results)) {
//         treeFuntionResult[item.replacePart] = results as any
//     } else {
//         notification.error({
//             description: JSON.stringify(error),
//             message: 'Replace Words Error',
//             placement: 'topLeft',
//         });
//     }
// }