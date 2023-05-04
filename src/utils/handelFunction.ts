import { notification } from 'antd';
export async function handelhistoryFunction( code: string, inputData: any) {
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

}

export function getJsWorker(code: string) {
    const workerScript = `
    self.onmessage = function(event) {
        const inputData = event.data;
        let functionResult;
        try{
            functionResult = ${code}(inputData)
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