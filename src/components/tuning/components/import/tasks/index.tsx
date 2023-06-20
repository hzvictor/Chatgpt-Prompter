import React, { useEffect, useState } from 'react';
import { Button, Space, Progress, Table } from 'antd';
import { DeleteOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import styles from './index.less';
import { makeNodeId } from '@/utils/withNodeId';
import { getTargetTuning } from '@/database/prompter/tuning';

import { chatToOpenai } from '@/services/openai';




const App = ({ tasks, updataTaskDetail, addNewDataItem, tableInfo }: any) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const [data, setData] = useState([])

    const startAll = () => {

        const newTasks = JSON.parse(JSON.stringify(tasks))

        selectedRowKeys.forEach(taskid => {
            

            const targeTaskIndex = newTasks.findIndex((item: any) => item.taskId == taskid)

            newTasks[targeTaskIndex].statue = 'runing'

            
        })
        updataTaskDetail(newTasks)
    };
    const stopAll = () => {
        const newTasks = JSON.parse(JSON.stringify(tasks))

        selectedRowKeys.forEach(taskid => {
            

            const targeTaskIndex = newTasks.findIndex((item: any) => item.taskId == taskid)

            newTasks[targeTaskIndex].statue = 'stop'

            
        })
        updataTaskDetail(newTasks)

    };
    const deleteAll = () => {

        const newTasks = JSON.parse(JSON.stringify(tasks))

        selectedRowKeys.forEach(taskid => {
            

            const targeTaskIndex = newTasks.findIndex((item: any) => item.taskId == taskid)

            newTasks.splice(targeTaskIndex, 1)
        })

        updataTaskDetail(newTasks)
    };

    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;


    useEffect(() => {
        if (!tasks) {
            return
        }
        const newData = tasks.map((item: any) => {
            return {
                key: item.taskId,
                name: item.config.prompt,
                type: item.config.type,
                progress: (item.config.progress / item.config.number * 100).toFixed(2),
                number: item.config.number,
                statue: item.statue,
                config: item.config,
                id: item.taskId
            }
        })
        setData(newData)

    }, [tasks])

    const columns = [
        {
            title: 'Name',
            width: 200,
            dataIndex: 'name',
            key: 'name',
            render: (text: any) => {
                return <div className={styles.name} > {text}</div>
            }
        },
        {
            title: 'Progress',
            key: 'progress',
            dataIndex: 'progress',
            render: (_: any, record: any) => (
                <>
                    <Progress strokeColor="#00aa90" percent={record.progress} />
                </>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            render: (_: any, record: any) => (
                <Space size="middle">
                    {record.statue == "runing" ? <Button onClick={() => { stopTask(record) }} icon={<PauseCircleOutlined />} /> : <Button onClick={() => { startUpdate(record) }} icon={<PlayCircleOutlined />} />}
                    <Button onClick={() => { deleteTask(record) }} icon={<DeleteOutlined />} />
                </Space>
            ),
        },
    ];


    const stopTask = (record: any) => {

        const newTasks = JSON.parse(JSON.stringify(tasks))

        const targeTaskIndex = newTasks.findIndex((item: any) => item.taskId == record.id)

        newTasks[targeTaskIndex].statue = 'stop'

        updataTaskDetail(newTasks)
    }


    const startUpdate = async (record: any) => {
        const newTasks = JSON.parse(JSON.stringify(tasks))

        const targeTaskIndex = newTasks.findIndex((item: any) => item.taskId == record.id)

        newTasks[targeTaskIndex].statue = 'runing'

        updataTaskDetail(newTasks)

        const config = record.config

        const taskId = record.id


        const questionResult = await chatToOpenai({
            messages: [{ "role": "user", "content": config.prompt }],
            temperature: config.question_temperature,
            max_tokens: config.question_token
        })

        const answerResult = await chatToOpenai({
            messages: [{ "role": "user", "content": config.complete.replace(/\${prompt}/g, questionResult.data.message.content) }],
            temperature: config.answer_temperature,
            max_tokens: config.answer_token
        })

        // addNewDataItem({
        //     key: makeNodeId(),
        //     completion: answerResult.data.message.content,
        //     remark: ``,
        //     prompt: questionResult.data.message.content,
        // })

        // newTasks[targeTaskIndex].config.progress = newTasks[targeTaskIndex].config.progress + 1



        for (let index = config.progress; index < (config.number); index++) {

            // check task state
            const tuning = await getTargetTuning(tableInfo.nanoid)
            if (tuning.tasks) {
                const targeTask = tuning.tasks.find((item: any) => item.taskId == taskId)

                if (targeTask) {
                    if (targeTask.statue != "runing") {
                        break
                    }
                }

            }

            const questionResult = await chatToOpenai({
                messages: [{ "role": "user", "content": config.prompt }],
                temperature: config.question_temperature,
                max_tokens: config.question_token
            })

            const answerResult = await chatToOpenai({
                messages: [{ "role": "user", "content": config.complete.replace(/\${prompt}/g, questionResult.data.message.content) }],
                temperature: config.answer_temperature,
                max_tokens: config.answer_token
            })

            addNewDataItem({
                key: makeNodeId(),
                completion: answerResult.data.message.content,
                remark: ``,
                prompt: questionResult.data.message.content,
            })

            const newTasks = JSON.parse(JSON.stringify(tasks))

            const targeTaskIndex = newTasks.findIndex((item: any) => item.taskId == record.id)

            newTasks[targeTaskIndex].statue = 'runing'
            newTasks[targeTaskIndex].config.progress = index + 1
            console.log(newTasks)

            updataTaskDetail(newTasks)
        }
    }


    const deleteTask = (record: any) => {

        const newTasks = JSON.parse(JSON.stringify(tasks))

        const targeTaskIndex = newTasks.findIndex((item: any) => item.taskId == record.id)

        newTasks.splice(targeTaskIndex, 1)

        updataTaskDetail(newTasks)
    }


    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Space>
                    <Button type="primary" onClick={stopAll} disabled={!hasSelected} >
                        Stop
                    </Button>
                    <Button type="primary" onClick={startAll} disabled={!hasSelected} >
                        Start
                    </Button>
                    <Button type="primary" onClick={deleteAll} disabled={!hasSelected} >
                        Delete
                    </Button>
                </Space>
                <span style={{ marginLeft: 8 }}>
                    {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
                </span>
            </div>
            <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
        </div>
    );
};

export default App;