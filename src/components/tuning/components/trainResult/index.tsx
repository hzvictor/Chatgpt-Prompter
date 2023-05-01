import React, { useEffect, useState } from 'react';
import { Table, Descriptions,Button } from 'antd';
import dayjs from 'dayjs';



const columns = [
    {
        title: 'Object',
        dataIndex: 'object',
        key: 'object',
        render: (text) => <span>{text}</span>,
    },
    {
        title: 'Level',
        dataIndex: 'level',
        key: 'level',
    },
    {
        title: 'Message',
        dataIndex: 'message',
        key: 'message',
    },
    {
        title: 'Created At',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (text) => <span>{dayjs(text * 1000).format('YYYY-MM-DD-HH:mm:ss')}</span>,
    },
];


const App: React.FC = ({ result }: any) => {
    const  [ resultInfo, setResultInfo ] = useState(result)
    useEffect(() => {
        setResultInfo(result)
    }, [result])
    return <>
        <Descriptions >
            <Descriptions.Item label="Status">{resultInfo.status}</Descriptions.Item>
            <Descriptions.Item label="Model">{resultInfo.model}</Descriptions.Item>
            <Descriptions.Item label="Fine Tuned Model">{resultInfo.fine_tuned_model}</Descriptions.Item>
            <Descriptions.Item label="Result Files"><Button type="primary" >Download</Button></Descriptions.Item>
            <Descriptions.Item label="Created At">
            {dayjs(resultInfo.created_at * 1000).format('YYYY-MM-DD-HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
            {dayjs(resultInfo.updated_at * 1000).format('YYYY-MM-DD-HH:mm:ss')}
            </Descriptions.Item>
        </Descriptions>
        <br />
        <Table columns={columns} dataSource={resultInfo.events} />
    </>
};

export default App;