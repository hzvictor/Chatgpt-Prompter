import request from '@/utils/request';
const qs = require('qs');

export async function creatChatbot(params: any) {
    return request('/chatbots', {
        method: 'POST',
        data: {
            data: params
        },
    });
}

export async function getChatbotByProjectid(projectid: string) {
    return request(`/hzchatbots/${projectid}`, {
        method: 'GET'
    });
}
export async function addChatbotPoints(id: string) {
    return request(`/hzchatbots/add/${id}`, {
        method: 'GET'
    });
}
export async function mineChatbotPoints(id: string) {
    return request(`/hzchatbots/mine/${id}`, {
        method: 'GET'
    });
}

export async function updateChatbot(id: number, params: any) {
    return request(`/chatbots/${id}`, {
        method: 'PUT',
        data: {
            data: params
        },
    });
}


export async function getTargetChatbot(id: string) {
    const query = qs.stringify({
        filters: {
            projectid: {
                $eq: id,
            }
        },
    }, {
        encodeValuesOnly: true, // prettify URL
    });
    return request(`/chatbots?${query}`, {
        method: 'GET',
    });
}

export async function getCommunityChatbot(page = 1) {
    const query = qs.stringify({
        pagination: {
            page: page,
            pageSize: 16,
        },
        sort: ['ponits'],
    }, {
        encodeValuesOnly: true, // prettify URL
    });
    return request(`/chatbots?${query}`, {
        method: 'GET',
    });
}


export async function searchCommunityChatbot(keyword: string) {
    const query = qs.stringify({
        filters: {
            config: {
                $contains: keyword,
            },
        },
        sort: ['ponits'],
        pagination: {
            page: 1,
            pageSize: 16,
        },
    }, {
        encodeValuesOnly: true, // prettify URL
    });
    return request(`/chatbots?${query}`, {
        method: 'GET',
    });
}
