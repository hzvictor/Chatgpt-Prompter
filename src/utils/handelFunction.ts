import { notification } from 'antd';
import { asyncRun } from "@/utils/pyworker/pyworker.js";
import { extractFunctions, findPythonFunctionNames, removePythonComments, removeJavascriptComments, jsToPythonFunctionWithComments, pythonToJsFunction } from '@/utils/little'
export async function handelhistoryFunction(lang:string, code:string, inputData:any) {
    // console.log(lang,code,inputData,9999999)
    
    if (lang == 'javascript') {
        const worker = getJsWorker(code)
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
        return result

    } else {
        const pythonFunctionList = findPythonFunctionNames(code)
        const script =
            `from js import inputContent
from js import promptInfo
${code}
${pythonFunctionList[0]}(inputContent,promptInfo)`;

        const context = {
            inputContent: inputData.input,
            promptInfo: inputData
        };
        
        const { results, error } = await asyncRun(script, context);
        if (JSON.stringify(results)) {
            return results
        } else {
            notification.error({
                description: JSON.stringify(error),
                message: 'Trigger Function Error',
                placement: 'topLeft',
            });
            return false
        }
    }
}

export function getJsWorker(code: string) {
    const workerScript = `
    self.onmessage = function(event) {
        const inputTestData = event.data;
        let functionResult;
        try{
            functionResult = ${code}(inputTestData.input, inputTestData)
        }catch(error){
            functionResult = error
        }
        self.postMessage(functionResult);
    };    
    `;

    const blob = new Blob([workerScript], { type: 'text/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    return worker
}