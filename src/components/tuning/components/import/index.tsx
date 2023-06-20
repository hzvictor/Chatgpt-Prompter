import { useEffect, useState } from 'react';
import Request from './dataFrom/request'
import TaskTable from './tasks'
import { chatToOpenai } from '@/services/openai';
import { makeNodeId } from '@/utils/withNodeId';
import { Avatar, Button, Checkbox, Tabs, Form, Input } from 'antd';
import { getTargetTuning } from '@/database/prompter/tuning';

const onChange = (key: string) => {
    console.log(key);
};

export default ({ addNewDataItem, updataTaskDetail, tableInfo }: any) => {

    const [tasks, setTasks] = useState(tableInfo.tasks)
    const [key, setKey] = useState('1')

    const updataDataSource = (config: any) => {

        const taskId = makeNodeId()

        switch (config.type) {
            case 'request':
                handelRequest(config, taskId)
                break;
            default:
                break;
        }
        return
    }


    const handelRequest = (config: any, taskId: string) => {


        if (!tasks) {
            updataTaskDetail([
                {
                    taskId: taskId,
                    statue: 'runing',
                    config: {
                        progress: 0,
                        ...config
                    },
                }
            ])
        } else {
            updataTaskDetail([
                {
                    taskId: taskId,
                    statue: 'runing',
                    config: {
                        progress: 0,
                        ...config
                    },
                },
                ...tasks
                
            ])
        }

        setKey('0')

        startUpdate({
            progress: 0,
            ...config
        }, taskId)
    }


    const startUpdate = async (config: any, taskId: any) => {


        for (let index = 0; index < (config.number); index++) {

            // check task state
            const tuning = await getTargetTuning(tableInfo.nanoid)
            if(tuning.tasks){
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

            updataTaskDetail([
                {
                    taskId: taskId,
                    statue: 'runing',
                    config: {
                        ...config,
                        progress: index + 1,
                    },
                },
                ...tasks
            ])
        }
    }

    useEffect(() => {
        setTasks(tableInfo.tasks)
    }, [tableInfo])

    const items = [
        {
            key: '0',
            label: `All Tasks`,
            children: <TaskTable tableInfo={tableInfo} tasks={tasks} addNewDataItem={addNewDataItem} updataTaskDetail={updataTaskDetail} ></TaskTable>,
        },
        {
            key: '1',
            label: `From Request`,
            children: <Request updataDataSource={updataDataSource}  ></Request>,
        },
        // {
        //     key: '2',
        //     label: `From Documentation`,
        //     children: `Content of Tab Pane 2`,
        // },
        // {
        //     key: '3',
        //     label: `From Website`,
        //     children: `From Website`,
        // },
        // {
        //     key: '5',
        //     label: `From Youtube`,
        //     children: `From Youtube`,
        // },
        // {
        //     key: '6',
        //     label: `From CSV`,
        //     children: `From CSV`,
        // },
    ];


    return <>
        {/* <div>
            Current Tasks:
        </div> */}
        <Tabs activeKey={key} tabPosition="left" items={items} onChange={setKey} />
    </>
}
