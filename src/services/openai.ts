import { notification } from "antd";
import { apikeysState } from "@/stores/apikeys";
import request from '@/utils/request';

const { Configuration, OpenAIApi } = require("openai");


export async function chatToOpenai(params: any) {
    if (apikeysState.isUseServer) {
        return chatToOpenaiServer({
            api_key: apikeysState.currentuse,
            ...params
        })
    } else {
        return chatToOpenaiLocal(params)
    }

}

export async function chatToOpenaiServer(params: any) {
    return request('/openchat/chat', {
        method: 'POST',
        data: params,
    });
}



export async function chatToOpenaiLocal(params: any) {
    try {

        if (!apikeysState.currentuse) {
            notification.error({
                description: 'You need to add api key',
                message: 'Apikey missing',
                placement: 'topLeft',
            });
            return {
                code: 0,
                data: ''
            }
        }

        const { parameter, messages } = params

        const configuration = new Configuration({
            // apiKey: '',
            apiKey: apikeysState.currentuse,
        });

        const openai = new OpenAIApi(configuration);
        const completion = await openai.createChatCompletion({
            ...parameter,
            model: "gpt-3.5-turbo",
            messages: messages,
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