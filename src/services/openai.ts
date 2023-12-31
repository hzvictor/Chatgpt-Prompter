import { notification } from "antd";
import request from '@/utils/request';

const { Configuration, OpenAIApi } = require("openai");

function getInfo() {
    const info = JSON.parse(localStorage.getItem('apiKeys'))

    if (info.currentuse && info.currentuse != '') {
        return info
    } else {
        notification.error({
            description: 'API key not exit',
            message: 'Open api error',
            placement: 'topLeft',
        });
        return
    }
}


export async function chatToOpenai(params: any) {

    const info = getInfo()

    if (info.isUseServer) {
        return chatToOpenaiServer({
            api_key: info.currentuse,
            ...params
        })
    } else {
        return chatToOpenaiLocal(params)
    }

}

export async function completionOpenai(params: any) {

    const info = getInfo()

    if (info.isUseServer) {
        return completionOpenaiServer({
            api_key: info.currentuse,
            parameter: params
        })
    } else {
        return completionOpenaiLocal(params)
    }

}



export async function filesListToOpenai() {

    const info = getInfo()

    const configuration = new Configuration({
        apiKey: info.currentuse,
    });

    const openai = new OpenAIApi(configuration);
    const response = await openai.listFiles();
    return response
}


export async function fileUploadToOpenai(params: any) {

    const info = getInfo()
    if (!info) return
    return request('/openchat/uploadfile', {
        method: 'POST',
        data: {
            api_key: info.currentuse,
            jsonl: params
        },
    });
}

export async function listfilesToOpenai() {

    const info = getInfo()
    if (!info) return
    return request('/openchat/listfiles', {
        method: 'POST',
        data: {
            api_key: info.currentuse,
        },
    });
}


export async function fileDeleteToOpenai(params: any) {

    const info = getInfo()
    if (!info) return
    return request('/openchat/deleteFile', {
        method: 'POST',
        data: {
            api_key: info.currentuse,
            fileid: params
        },
    });
}
export async function downloadfileToOpenai(params: any) {

    const info = getInfo()
    if (!info) return
    return request('/openchat/downloadfile', {
        method: 'POST',
        data: {
            api_key: info.currentuse,
            fileid: params
        },
    });
}
export async function retrievefileToOpenai(params: any) {

    const info = getInfo()
    if (!info) return
    return request('/openchat/retrievefile', {
        method: 'POST',
        data: {
            api_key: info.currentuse,
            fileid: params
        },
    });
}


export async function fileTrainToOpenai(params: any) {

    const info = getInfo()
    if (!info) return
    return request('/openchat/train', {
        method: 'POST',
        data: {
            api_key: info.currentuse,
            ...params
        },
    });
}

export async function retrieveFTToOpenai(params: any) {
    const info = getInfo()
    if (!info) return
    return request('/openchat/retrieveft', {
        method: 'POST',
        data: {
            api_key: info.currentuse,
            ftid: params
        },
    });
}


export async function listfinetunesToOpenai() {
    const info = getInfo()
    if (!info) return
    return request('/openchat/listfinetunes', {
        method: 'POST',
        data: {
            api_key: info.currentuse,
        },
    });
}
export async function cancelfinetuneToOpenai(params: any) {
    const info = getInfo()
    if (!info) return
    return request('/openchat/cancelfinetune', {
        method: 'POST',
        data: {
            api_key: info.currentuse,
            ftid: params
        },
    });
}
export async function deletemodelToOpenai(params: any) {
    const info = getInfo()
    if (!info) return
    return request('/openchat/deletemodel', {
        method: 'POST',
        data: {
            api_key: info.currentuse,
            ftname: params
        },
    });
}



export async function completionOpenaiServer(params: any) {
    return request('/openchat/completion', {
        method: 'POST',
        data: params,
    });
}
export async function chatToOpenaiServer(params: any) {
    const info = getInfo()

    return request('/openchat/chat', {
        method: 'POST',
        data: {
            api_key: info.currentuse,
            parameter: params
        },
    });
}

export async function chatToOpenaiLocal(params: any) {
    try {
        const info = getInfo()
        const { parameter, messages } = params

        const configuration = new Configuration({
            // apiKey: '',
            // apiKey: apikeysState.currentuse,
        });

        const openai = new OpenAIApi(configuration);
        const completion = await openai.createChatCompletion({
            ...parameter,
            model: "gpt-3.5-turbo",
            messages: messages,
            api_key: info.currentuse,
        });
        return {
            code: 0,
            data: completion.data.choices[0]
        }

    } catch (error) {
        notification.error({
            description: JSON.stringify(error),
            message: 'Open api error',
            placement: 'topLeft',
        });
        return {
            code: 0,
            data: ''
        }
    }

}

export async function completionOpenaiLocal(params: any) {
    try {
        const info = getInfo()

        const configuration = new Configuration({
            apiKey: info.currentuse,
        });

        const openai = new OpenAIApi(configuration);
        const response = await openai.createCompletion(params);
        return {
            code: 0,
            data: response.data.choices[0]
        }

    } catch (error) {
        notification.error({
            description: JSON.stringify(error),
            message: 'Open api error',
            placement: 'topLeft',
        });
        return {
            code: 0,
            data: ''
        }
    }

}