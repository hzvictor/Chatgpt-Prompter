import { useEffect } from 'react'
import AceEditor from "react-ace";
import { extractFunctions, findPythonFunctionNames, removePythonComments, removeJavascriptComments, jsToPythonFunctionWithComments, pythonToJsFunction } from '@/utils/little'
import { Select, Collapse, Space, Input, Row, Col, Popover, ConfigProvider, Button, InputNumber } from 'antd';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';
import { currentFunction } from '@/stores/function';
import LogitBias from '@/components/bpurecomponents/logitBias';
import SlideList from '@/components/bpurecomponents/slideList';
import { snapshot, useSnapshot } from 'valtio';
import { tabData } from '@/stores/tablist'
import modifyStore from '@/stores/modify'
import messageHistoryStore from '@/stores/messageHistory'
import { getTargetsyStemsWithFatherid } from '@/database/system'
import { getTargetConversationsWithFatherid } from '@/database/conversation'
import { getTargetSlideListsWithFatherid } from '@/database/slideLists'
import { getTargetLogitBiasWithFatherid } from '@/database/logitBias'
import { activeProject } from '@/stores/project';

const { modifyState } = modifyStore;
const { messageHistoryState } = messageHistoryStore;
import { getTargetFunctions, storeFunctions, updateFunctions } from '@/database/functions'
// 动态引入
import { asyncRun } from "@/utils/pyworker/pyworker.js";

import { SettingOutlined } from '@ant-design/icons';
const { Panel } = Collapse;

const { TextArea } = Input;
import styles from './index.less';
import { useState } from "react";
import { subscribe } from 'valtio';
import dayjs from 'dayjs';

import validate from 'validate.js';

const modifyValidate = {
    prefix: {
        presence: { message: 'does not exist' },
        type: 'string',
        // length: { minimum: 2, message: '长度不能小于 2' },
    },
    suffix: {
        presence: { message: 'does not exist' },
        type: 'string',
        // length: { minimum: 2, message: '长度不能小于 2' },
    },
};


const systemValidate = {
    role: {
        presence: { message: 'does not exist' },
        type: 'string',
        inclusion: {
            within: ['system'],
            message: "must be 'system'"
        }
    },
    content: {
        presence: { message: 'does not exist' },
        type: 'string',
    }
}
const conversationValidate = {
    role: {
        presence: { message: 'does not exist' },
        type: 'string',
        inclusion: {
            within: ['user', 'assistant'],
            message: "must be 'user' or 'assistant'"
        }
    },
    content: {
        presence: { message: 'does not exist' },
        type: 'string',
    }
}
const logitBiasArrayValidate = {
    value: {
        presence: { message: 'does not exist' },
        type: 'number',
        numericality: {
            greaterThanOrEqualTo: -100,
            lessThanOrEqualTo: 100
        }
    },
    word: {
        presence: { message: 'does not exist' },
        type: 'string',
    }
}

const promptValidate: any = {
    system: {
        presence: { message: 'does not exist' },
        type: 'array',
    },
    conversation: {
        presence: { message: 'does not exist' },
        type: 'array',
    },
    logitBiasArray: {
        presence: { message: 'does not exist' },
        type: 'array',
    },
    slideList: {
        presence: { message: 'does not exist' },
        type: 'object',
    },
    "slideList.temperature": {
        presence: { message: 'does not exist' },
        type: 'number',
        numericality: {
            greaterThanOrEqualTo: 0,
            lessThanOrEqualTo: 1
        }
    },
    "slideList.maximumLength": {
        presence: { message: 'does not exist' },
        type: 'number',
        numericality: {
            greaterThanOrEqualTo: 10,
            lessThanOrEqualTo: 2048,
            onlyInteger: true
        }
    },
    "slideList.topP": {
        presence: { message: 'does not exist' },
        type: 'number',
        numericality: {
            greaterThanOrEqualTo: 0,
            lessThanOrEqualTo: 1
        }
    },
    "slideList.frequencyPenalty": {
        presence: { message: 'does not exist' },
        type: 'number',
        numericality: {
            greaterThanOrEqualTo: 0,
            lessThanOrEqualTo: 1
        }
    },
    "slideList.presencePenalty": {
        presence: { message: 'does not exist' },
        type: 'number',
        numericality: {
            greaterThanOrEqualTo: 0,
            lessThanOrEqualTo: 1
        }
    },
};



// const prompt = {
//     system: [{role:'system',content:'hello'}],
//     conversation: [
//         {role:'user',content:'hello'},{role:'assistant',content:'hello'}
//     ],
//     logitBiasArray: [
//         {
//             word: `call`,
//             value: 0,
//         }
//     ],
//     slideList: {
//         temperature: 0.7,
//         maximumLength: 256,
//         topP: 1,
//         frequencyPenalty: 0,
//         presencePenalty: 0,
//     }
// }


export default ({ onCloseCode }: any) => {
    const [title, setTitle] = useState('Open to teat')
    const [output, setOutput] = useState('')
    const [inputTestData, setInputTestData] = useState({
        input: '',
        role: 'user',
        index: {
            all: 0,
            assistant: 0,
            user: 0
        },
        system: [],
        conversation: [],
        history: [],
        modify: {},
        logitBiasArray: [],
        slideList: {}
    })
    const [expected, setExpected] = useState('')
    const [langType, setLangType] = useState('javascript')
    const [loading, setLoding] = useState(false)
    const [drawerTitle, setDrawerTitle] = useState('')
    const [tablistData, setTablistData] = useState(snapshot(tabData))
    const [modifyData, setModifyData] = useState(snapshot(modifyState))
    const [isPass, setIsPass] = useState(false)
    const [code, setCode] = useState('')
    const onChangeCode = (newValue: any) => {
        setIsPass(false)
        setCode(newValue)
    };

    const onLoad = () => {
    };

    useEffect(() => {
    }, [])

    useEffect(() => {
        const title = currentFunction.type.charAt(0).toUpperCase() + currentFunction.type.slice(1);
        setDrawerTitle(title)
        getTargetFunctions(currentFunction.id).then(res => {
            if (res) {
                setCode(res.code)
                setLangType(res.lang)
                setInputTestData(res.testData)
                setExpected(res.expected)
                setOutput(res.output)
                setIsPass(res.isPass)
            } else {
                storeFunctions({ nanoid: currentFunction.id, type: currentFunction.type, creatData: dayjs().valueOf() })
                if (currentFunction.type == 'trigger' || currentFunction.type == 'history') {
                    setExpected('true/false')
                } else if (currentFunction.type == 'modify') {
                    setExpected(`{prefix:'',suffix:''}`)
                } else if (currentFunction.type == 'prompt') {
                    setExpected(
                        `
{
    system: [{role:'system',content:'hello'}],
    conversation: [
        {role:'user',content:'hello'},{role:'assistant',content:'hello'}
    ],
    logitBiasArray: [
        {
            word: 'hello',
            value: 0,
        }
    ],
    slideList: {
        temperature: 0.7,
        maximumLength: 256,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
    }
}`)
                }
                else if(currentFunction.type == 'sendMessage' || currentFunction.type == 'replaceMessage'){
                    setExpected('string')
                }else{
                    setExpected(currentFunction.type)
                }

                setCode(
                    `// promptInfo = {
//  role:'user'
//   index : { 
//   all:0,
//   assistant: 0,
//   user:0,
// }, 
//   system:[{role:'system',content:'hello'}], 
//   conversation:[{role:'user',content:'hello'},{role:'assistant',content:'hello'}], 
//   modify:{prefix:"",suffix:''}, 
//   history:[{role:'user',content:'hello'},{role:'assistant',content:'hello'}], 
//   parameter:{
//     frequencyPenalty:1,
//     maximumLength: 1984,
//     presencePenalty: 0.89,
//     temperature: 0.39,
//     topP: 0.48
//   }, 
//     logitBiasArray:[{value: 100, word: "hello"}]
// }
    
function ${currentFunction.type}(inputContent, promptInfo) {

    return true
}
`)

                updateTestData()
            }
        })
    }, [currentFunction.id])


    const updateTestData = async () => {
        const tabDataInfo = snapshot(tabData)
        const messageHistoryInfo = snapshot(messageHistoryState)
        const modifyDataInfo = snapshot(modifyState)

        const systemStateResult = await getTargetsyStemsWithFatherid(
            tabDataInfo.activeTabListId.systemId,
            activeProject.activeProjectID,
        );
        const conversationStateResult = await getTargetConversationsWithFatherid(
            tabDataInfo.activeTabListId.conversationId,
            activeProject.activeProjectID,
        );
        const logitBiastate = await getTargetLogitBiasWithFatherid(
            tabDataInfo.activeTabListId.logitBiasId,
            activeProject.activeProjectID,
        );
        const slideListState = await getTargetSlideListsWithFatherid(
            tabDataInfo.activeTabListId.slideListId,
            activeProject.activeProjectID,
        );


        setInputTestData({
            input: '',
            role: 'user',
            index: {
                all: 0,
                assistant: 0,
                user: 0
            },
            system: systemStateResult.message ? systemStateResult.message : [],
            conversation: conversationStateResult.message ? conversationStateResult.message : [],
            history: messageHistoryInfo.list,
            modify: modifyDataInfo.list[0],
            logitBiasArray: logitBiastate.logitBiasArray
                ? logitBiastate.logitBiasArray
                : [],
            slideList: slideListState ? slideListState : {

            }
        })
    }
    useEffect(() => {
        updateFunctionDataToDB()
    }, [inputTestData, langType, expected, code, output, isPass])

    useEffect(() => {
        setTablistData(snapshot(tabData))
    }, [tabData])

    const updateFunctionDataToDB = () => {
        updateFunctions({
            nanoid: currentFunction.id, content: {
                lang: langType,
                testData: inputTestData,
                expected: expected,
                output: output,
                code: code,
                isPass: isPass
            }
        })
    }

    const handleChange = async (value: string) => {
        setLangType(value)
        setIsPass(false)
        if (value == 'python') {
            let pythonCode = jsToPythonFunctionWithComments(code)
            pythonCode = pythonCode.replace(/\/\/(.+)/g, "# $1");
            setCode(pythonCode)
        } else {
            let jsCode = code.replace(/# (.+)/g, "// $1");
            jsCode = pythonToJsFunction(jsCode)
            setCode(jsCode)
        }
    };



    const test = async () => {
        setLoding(true)
        if (langType == 'javascript') {
            const newcode = removeJavascriptComments(code)
            const workerScript = `
                        self.onmessage = function(event) {
                            const inputTestData = event.data;
                            let functionResult;
                            try{
                                functionResult = ${newcode}(inputTestData.input, inputTestData)
                            }catch(error){
                                functionResult = error
                            }
                            self.postMessage(functionResult);
                        };    
                        `;
            // const regex = /console\.log\((.*)\)/g;

            // let match;
            // while ((match = regex.exec(code)) !== null) {
            //     console.log(match[1]);
            // }
            const blob = new Blob([workerScript], { type: 'text/javascript' });
            const worker = new Worker(URL.createObjectURL(blob));
            worker.postMessage(inputTestData);
            worker.onmessage = function (event) {

                const errorMessage = judgePass(event.data)
                if (errorMessage) {
                    let messageOutput = errorMessage + JSON.stringify(event.data)
                    setOutput(messageOutput)
                    setLoding(false)
                } else {
                    setOutput(JSON.stringify(event.data))
                    setLoding(false)
                }

            };
            worker.onerror = (error) => {
                setOutput(JSON.stringify(error))
                setLoding(false)
                setIsPass(false)
            }
        } else {
            const pythonFunctionList = findPythonFunctionNames(code)
            const newCode = removePythonComments(code)
            const script =
                `from js import inputContent
from js import promptInfo
${newCode}
${pythonFunctionList[0]}(inputContent,promptInfo)`;

            const context = {
                inputContent: inputTestData.input,
                promptInfo: inputTestData
            };

            try {
                const { results, error } = await asyncRun(script, context);
                if (JSON.stringify(results)) {
                    setOutput(results)

                    const errorMessage = judgePass(results)
                    if (errorMessage) {
                        let messageOutput = errorMessage + JSON.stringify(results)
                        setOutput(messageOutput)
                        setLoding(false)
                    } else {
                        setOutput(JSON.stringify(results))
                        setLoding(false)
                    }

                } else if (error) {
                    setOutput(error)
                    setLoding(false)
                } else {
                    setOutput(error)
                    setLoding(false)
                }
            } catch (e: any) {
                setOutput(`Error in pyodideWorker at ${e.filename}, Line: ${e.lineno}, ${e.message}`)
                setLoding(false)
            }
        }
    }

    const judgePass = (results: any) => {
        if (currentFunction.type == 'trigger' || currentFunction.type == 'history') {
            if (typeof results === 'boolean') {
                // myValue 是一个布尔值
                setIsPass(true)
            } else {
                setIsPass(false)
            }
        } else if (currentFunction.type == 'sendMessage' || currentFunction.type == 'replaceMessage') {
            if (typeof results === 'string') {
                // myValue 是一个布尔值
                setIsPass(true)
            } else {
                setIsPass(false)
            }
        } else if (currentFunction.type == 'modify') {
            const errors = validate(results, modifyValidate);
            if (errors) {
                let errorMessage = ''
                Object.values(errors).forEach((item: any) => {
                    errorMessage = errorMessage + item[0] + '\n'
                })
                setIsPass(false)
                return errorMessage
            } else {
                setIsPass(true)
            }
        } else if (currentFunction.type == 'prompt') {
            const errors = validate(results, promptValidate);
            if (errors) {
                let errorMessage = ''
                Object.values(errors).forEach((item: any) => {
                    errorMessage = errorMessage + item[0] + '\n'
                })
                setIsPass(false)
                return errorMessage
            } else {
                let errorMessage = ''
                results.system.forEach((item: any) => {
                    const errorsSelf = validate(item, systemValidate);
                    if (errorsSelf) {
                        Object.values(errorsSelf).forEach((itemSelf: any) => {
                            errorMessage = errorMessage + itemSelf[0] + '\n'
                        })
                    }
                })
                results.conversation.forEach((item: any) => {
                    const errorsSelf = validate(item, conversationValidate);
                    if (errorsSelf) {
                        Object.values(errorsSelf).forEach((itemSelf: any) => {
                            errorMessage = errorMessage + itemSelf[0] + '\n'
                        })
                    }
                })
                results.logitBiasArray.forEach((item: any) => {
                    const errorsSelf = validate(item, logitBiasArrayValidate);
                    if (errorsSelf) {
                        Object.values(errorsSelf).forEach((itemSelf: any) => {
                            errorMessage = errorMessage + itemSelf[0] + '\n'
                        })
                    }
                })

                if (errorMessage == '') {
                    setIsPass(true)
                } else {
                    return errorMessage
                }
            }
        }

    }

    const useIt = () => {
        onCloseCode()
    }
    const onChangePane = (val: any) => {
        if (val.length == 0) {
            setTitle('Open to test')
        } else {
            setTitle('Code execution result')
        }
    }

    const LogicbitsHoverContent = () => {
        return (
            <div className={styles.logitsContainer}>
                <LogitBias logitBiasArray={inputTestData.logitBiasArray}></LogitBias>
            </div>
        );
    };

    const SlideListHoverContent = () => {
        return (
            <div className={styles.slideContainer}>
                <SlideList slideListsData={inputTestData.slideList}></SlideList>
            </div>
        );
    };

    const HistoryHoverContent = () => {
        const historyMessage = inputTestData.history.map((item: any) => {
            if (item.content.text.trim().length != 0) {
                return { role: item.role, content: item.content.text };
            }
        });

        const promptInfo = [...historyMessage].filter(
            Boolean,
        );

        return (
            <div className={styles.promptsContainer}>
                <div className={styles.hoverCatageTitle}>History</div>
                {promptInfo.length > 0 &&
                    promptInfo.map((item: any, index: number) => {
                        return (
                            <Row key={index}>
                                <div className={styles.hoverContentTitle}>
                                    <span>{item.role}</span> :{' '}
                                    <span className={styles.hoverContent}>{item.content}</span>
                                </div>
                            </Row>
                        );
                    })}
            </div>
        );
    };


    const SystemHoverContent = () => {

        const systemMessage = inputTestData.system.map((item: any) => {
            if (item.children[0].text.trim().length != 0) {
                return { role: item.role, content: item.children[0].text };
            }
        });
        const promptInfo = [...systemMessage].filter(
            Boolean,
        );

        return (
            <div className={styles.promptsContainer}>
                <div className={styles.hoverCatageTitle}>System</div>
                {promptInfo.length > 0 &&
                    promptInfo.map((item: any, index: number) => {
                        return (
                            <Row key={index}>
                                <div className={styles.hoverContentTitle}>
                                    <span>{item.role}</span> :{' '}
                                    <span className={styles.hoverContent}>{item.content}</span>
                                </div>
                            </Row>
                        );
                    })}
            </div>
        );
    };

    const ModifyHoverConten = () => {
        return <div className={styles.promptsContainer}>
            <div className={styles.hoverCatageTitle}>Modify</div>
            <div>Prefix: {inputTestData.modify?.prefix} </div>
            <div>Suffix:  {inputTestData.modify?.suffix} </div>
        </div>
    }

    const ConversationHoverContent = () => {

        const conversationMessage = inputTestData.conversation.map((item: any) => {
            if (item.children[0].text.trim().length != 0) {
                return { role: item.role, content: item.children[0].text };
            }
        });

        const promptInfo = [...conversationMessage].filter(
            Boolean,
        );

        return (
            <div className={styles.promptsContainer}>
                <div className={styles.hoverCatageTitle}>Conversation</div>
                {promptInfo.length > 0 &&
                    promptInfo.map((item: any, index: number) => {
                        return (
                            <Row key={index}>
                                <div className={styles.hoverContentTitle}>
                                    <span>{item.role}</span> :{' '}
                                    <span className={styles.hoverContent}>{item.content}</span>
                                </div>
                            </Row>
                        );
                    })}
            </div>
        );
    };

    const handalChangeSelect = async (value: any, type: string) => {
        console.log(value, type, 7777777)
        if (type == 'system') {
            const systemStateResult = await getTargetsyStemsWithFatherid(
                value,
                activeProject.activeProjectID,
            );
            const newInputTestData: any = Object.assign({}, inputTestData)
            newInputTestData.system = systemStateResult.message ? systemStateResult.message : [],
                setInputTestData(newInputTestData)
        } else if (type == 'conversation') {
            const conversationStateResult = await getTargetConversationsWithFatherid(
                value,
                activeProject.activeProjectID,
            );

            const newInputTestData: any = Object.assign({}, inputTestData)
            newInputTestData.conversation = conversationStateResult.message ? conversationStateResult.message : [],
                setInputTestData(newInputTestData)

        } else if (type == 'logitBias') {
            const logitBiastate = await getTargetLogitBiasWithFatherid(
                value,
                activeProject.activeProjectID,
            );

            const newInputTestData: any = Object.assign({}, inputTestData)
            newInputTestData.logitBiasArray = logitBiastate.logitBiasArray
                ? logitBiastate.logitBiasArray
                : []
            setInputTestData(newInputTestData)

        } else if (type == 'slideList') {
            const slideListState = await getTargetSlideListsWithFatherid(
                value,
                activeProject.activeProjectID,
            );
            const newInputTestData: any = Object.assign({}, inputTestData)
            newInputTestData.slideList = slideListState ? slideListState : {}
            setInputTestData(newInputTestData)
        } else if (type == 'modify') {
            const newInputTestData: any = Object.assign({}, inputTestData)
            const newModify = modifyData.list.find((item: any) => item.key == value)
            newInputTestData.modify = newModify ? newModify : {}
            setInputTestData(newInputTestData)
        } else if (type == 'role') {
            console.log(value, 7777777777)
            const newInputTestData: any = Object.assign({}, inputTestData)
            newInputTestData.role = value
            setInputTestData(newInputTestData)
        }
    }

    const changeInput = (e: any) => {
        const newInputTestData: any = Object.assign({}, inputTestData)
        newInputTestData.input = e.target.value
        setInputTestData(newInputTestData)
    }

    const changeIndex = (val: any, type: string) => {
        const newInputTestData: any = Object.assign({}, inputTestData)
        newInputTestData.index[type] = val
        setInputTestData(newInputTestData)
    }

    return (
        <div className={styles.container}>
            <Row
                align="middle"
                justify="space-between"
                style={{ padding: '1vh', boxSizing: 'border-box' }}
            >
                <Col className={styles.title}>{drawerTitle} Function</Col>
                <Col>
                    <ConfigProvider
                        theme={{
                            token: {
                                // colorBgElevated: '#2f312a',
                            },
                        }}
                    >
                        <Select
                            defaultValue="javascript"
                            value={langType}
                            style={{ width: 120, opacity: 0.5 }}
                            onChange={handleChange}
                            options={[
                                { value: 'python', label: 'Python' },
                                { value: 'javascript', label: 'Javascript' },
                            ]}
                        />
                    </ConfigProvider>
                </Col>
            </Row>
            <div onMouseDown={(e) => e.stopPropagation()}>
            <AceEditor
                placeholder=""
                mode={langType}
                theme="monokai"
                name="blah2"
                onLoad={onLoad}
                onChange={onChangeCode}
                fontSize={14}
                width="100%"
                height="90vh"
                minLines={100}
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
                value={code}
                wrapEnabled={true}
                
                setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true,
                    showLineNumbers: true,
                    tabSize: 2,
                    // useWorker: false
                }}
            />
            </div>
            <div  onMouseDown={(e) => e.stopPropagation()} className={styles.testContentWrap}>
                <Collapse
                    defaultActiveKey={[1]}
                    onChange={onChangePane}
                    ghost
                    className={styles.testContent}
                // expandIconPosition={expandIconPosition}
                >
                    <Panel header={<div className={styles.panelHeader}>{title}</div>} key="1" >
                        <Row gutter={16}>
                            <Col className={styles.textTitle} span={2}> Input: </Col>
                            <Col className={styles.textTitle} span={3}><Select
                                value={inputTestData.role}
                                onChange={(val: any) => { handalChangeSelect(val, 'role') }}
                                options={[{ value: 'user', 'label': "User" }, { value: 'assistant', 'label': "Assistant" }]}>
                            </Select> </Col>
                            <Col span={19}>
                                <TextArea autoSize={{ minRows: 3, maxRows: 10 }} value={inputTestData.input} onChange={changeInput} ></TextArea>
                            </Col>
                        </Row>
                        <br />
                        <Row justify="space-between" gutter={16}>
                            <Col >
                                <Row align="middle">
                                    <Col>All index:&nbsp; </Col>
                                    <Col><InputNumber defaultValue={0} onChange={(e) => { changeIndex(e, 'all') }} value={inputTestData.index.all} /></Col>
                                </Row>
                            </Col>
                            <Col >
                                <Row align="middle">
                                    <Col>Assistant index:&nbsp; </Col>
                                    <Col><InputNumber defaultValue={0} onChange={(e) => { changeIndex(e, 'assistant') }} value={inputTestData.index.assistant} /></Col>
                                </Row>
                            </Col>
                            <Col >
                                <Row align="middle">
                                    <Col>User index: &nbsp; </Col>
                                    <Col><InputNumber defaultValue={0} value={inputTestData.index.user} onChange={(e) => { changeIndex(e, 'user') }} /></Col>
                                </Row>
                            </Col>
                        </Row>
                        <br />
                        <Row gutter={16} justify="space-between"  >
                            <Row align="middle">
                                <Col>
                                    <Popover content={SystemHoverContent}>
                                        <Popover content={SystemHoverContent} trigger="click">
                                            System:
                                        </Popover>
                                    </Popover> &nbsp; </Col>
                                <Col><Select
                                    defaultValue={tablistData.activeTabListId.systemId}
                                    // value={langType}
                                    style={{ minWidth: 120 }}
                                    onChange={(val: any) => { handalChangeSelect(val, 'system') }}
                                    options={tablistData.slideListTabList.systemId.map((item: any) => {
                                        return { value: item.key, label: item.label }
                                    })}
                                /></Col>
                            </Row>
                            <Row align="middle">
                                <Col>
                                    <Popover content={ConversationHoverContent}>
                                        <Popover content={ConversationHoverContent} trigger="click">
                                            Conversation:
                                        </Popover>
                                    </Popover> &nbsp; </Col>
                                <Col><Select
                                    defaultValue={tablistData.activeTabListId.conversationId}
                                    style={{ minWidth: 150 }}
                                    onChange={(val: any) => { handalChangeSelect(val, 'conversation') }}
                                    options={tablistData.slideListTabList.conversationId.map((item: any) => {
                                        return { value: item.key, label: item.label }
                                    })}
                                /></Col>
                            </Row>
                            <Row align="middle">
                                <Col>
                                    <Popover content={ModifyHoverConten}>
                                        <Popover content={ModifyHoverConten} trigger="click">
                                            Modify:
                                        </Popover>
                                    </Popover> &nbsp; </Col>
                                <Col><Select
                                    defaultValue={modifyData.list[0]?.key}
                                    style={{ minWidth: "150px", maxWidth: "160px" }}
                                    onChange={(val: any) => { handalChangeSelect(val, 'modify') }}
                                    options={modifyData.list.map((item: any) => {
                                        return { value: item.key, label: `${item.prefix}-${item.suffix}` }
                                    })}
                                /></Col>
                            </Row>
                        </Row>
                        <br />
                        <Row gutter={16} justify="space-between" >
                            <Row align="middle">
                                <Col>
                                    <Popover
                                        overlayStyle={{ padding: 0 }}
                                        overlayInnerStyle={{ padding: 0, overflow: 'hidden' }}
                                        content={LogicbitsHoverContent}
                                    >
                                        <Popover
                                            overlayStyle={{ padding: 0 }}
                                            overlayInnerStyle={{ padding: 0, overflow: 'hidden' }}
                                            content={LogicbitsHoverContent}
                                            trigger="click"
                                        >
                                            Logic Bits:  &nbsp;
                                        </Popover>
                                    </Popover>
                                </Col>
                                <Col><Select
                                    defaultValue={tablistData.activeTabListId.logitBiasId
                                    }
                                    style={{ minWidth: 120 }}
                                    onChange={(val: any) => { handalChangeSelect(val, 'logitBias') }}
                                    options={tablistData.slideListTabList.logitBiasId
                                        .map((item: any) => {
                                            return { value: item.key, label: item.label }
                                        })}
                                /></Col>
                            </Row>
                            <Row align="middle">
                                <Col>
                                    <Popover
                                        overlayStyle={{ padding: 0 }}
                                        overlayInnerStyle={{ padding: 0, overflow: 'hidden' }}
                                        content={SlideListHoverContent}
                                    >
                                        <Popover
                                            overlayStyle={{ padding: 0 }}
                                            overlayInnerStyle={{ padding: 0, overflow: 'hidden' }}
                                            content={SlideListHoverContent}
                                            trigger="click"
                                        >
                                            Parameters:  &nbsp;
                                        </Popover>
                                    </Popover>
                                </Col>
                                <Col><Select
                                    defaultValue={tablistData.activeTabListId.slideListId
                                    }
                                    style={{ minWidth: 120 }}
                                    onChange={(val: any) => { handalChangeSelect(val, 'slideList') }}
                                    options={tablistData.slideListTabList.slideListId
                                        .map((item: any) => {
                                            return { value: item.key, label: item.label }
                                        })}
                                /></Col>
                            </Row>
                            <Row align="middle">
                                <Popover content={HistoryHoverContent}>
                                    <Popover content={HistoryHoverContent} trigger="click">
                                        <Button>History</Button>
                                    </Popover>
                                </Popover>
                            </Row>
                            {/* <Row align="middle">
                                <Popover content={HistoryHoverContent}>
                                    <Popover content={HistoryHoverContent} trigger="click">
                                        <Button>HAP</Button>
                                    </Popover>
                                </Popover>
                            </Row> */}
                        </Row>
                        <br />
                        <Row gutter={16}>
                            <Col className={styles.textTitle} span={3}>Expected:</Col>
                            <Col span={21}>
                                <TextArea disabled value={expected} ></TextArea>
                            </Col>
                        </Row>
                        <br />
                        <Row gutter={16}>
                            <Col className={styles.textTitle} span={3}>Output:</Col>
                            <Col span={21}>
                                <TextArea autoSize={{ minRows: 3, maxRows: 10 }} disabled value={output} ></TextArea>
                            </Col>
                        </Row>
                        <div className={styles.holderContetn} ></div>
                    </Panel>
                </Collapse>
            </div>
            <Space className={styles.bottomWrap} size="large">
                <Button loading={loading} onClick={test} type="primary">Test</Button>
                <Button disabled={!isPass} loading={loading} onClick={useIt} type="primary"> Use it</Button>
            </Space>
        </div>
    );
};
