import { useEffect } from 'react'
import AceEditor from "react-ace";
import { removeJavascriptComments } from '@/utils/little'
import { Select, Collapse, Space, Input, Row, Col, Popover, Button, InputNumber } from 'antd';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';


import { newFunctions, getTargetFunctions, updateFunctionsDetail } from '@/database/prompter/function'
// 动态引入

const { Panel } = Collapse;

const { TextArea } = Input;
import styles from './index.less';
import { useState } from "react";
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


export default ({ onCloseCode, codeConfig }: any) => {
    const [title, setTitle] = useState('Open to teat')
    const [output, setOutput] = useState('')
    const [inputTestData, setInputTestData] = useState({
        input: {
            type: 'text',
            role: 'user',
            content: {text: 'hello world!'} ,
        },
        index: {},
        messageHistory: [],
        prompt: {
            parameter:  {},
            history: [],
            modify: { prefix: 'test', suffix: 'test' },
            messages: []
        }
    })
    const [expected, setExpected] = useState('')

    const [loading, setLoding] = useState(false)
    const [drawerTitle, setDrawerTitle] = useState('')
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
        if (!codeConfig.id) {
            return
        }
        const title = codeConfig.type.charAt(0).toUpperCase() + codeConfig.type.slice(1);
        setDrawerTitle(title)
        getTargetFunctions(codeConfig.id).then(res => {
            if (res) {
                setCode(res.code)
                setInputTestData(res.testData)
                setExpected(res.expected)
                setOutput(res.output)
                setIsPass(res.isPass)
            } else {
                newFunctions(codeConfig.id, codeConfig.type).then(() => {
                    if (codeConfig.type == 'trigger' || codeConfig.type == 'history') {
                        setExpected('true/false')
                    } else if (codeConfig.type == 'modify') {
                        setExpected(`{prefix:'',suffix:''}`)
                    } else if (codeConfig.type == 'prompt') {
                        setExpected(
                            ``)
                    }
                    else if (codeConfig.type == 'sendMessage' || codeConfig.type == 'replaceMessage') {
                        setExpected(`{text :'hello'}`)
                    } else {
                        setExpected(codeConfig.type)
                    }

                    setCode(
                        `// inputData : {
//     type: 'text',
//     role: 'user',
//     content: {text: 'hello world!'} ,
// },
// index: {},
// messageHistory: [],
// prompt: {
//     parameter:  {},
//     history: [],
//     modify: { prefix: 'test', suffix: 'test' },
//     messages: []
// }
function ${codeConfig.type}(inputData) {
    
    return true
}`)
                })
            }
        })
    }, [codeConfig.id])


    useEffect(() => {
        updateFunctionDataToDB()
    }, [inputTestData, expected, code, output, isPass])



    const updateFunctionDataToDB = () => {
        updateFunctionsDetail(
            codeConfig.id, {
            testData: inputTestData,
            expected: expected,
            output: output,
            code: code,
            isPass: isPass
        }
        )
    }




    const test = async () => {
        setLoding(true)
        const newcode = removeJavascriptComments(code)
        const workerScript = `
                        self.onmessage = function(event) {
                            const inputData = event.data;
                            let functionResult;
                            try{
                                functionResult = ${newcode}(inputData)
                            }catch(error){
                                functionResult = error
                            }
                            self.postMessage(functionResult);
                        };    
                        `;
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

    }

    const judgePass = (results: any) => {
        if (codeConfig.type == 'trigger' || codeConfig.type == 'history') {
            if (typeof results === 'boolean') {
                // myValue 是一个布尔值
                setIsPass(true)
            } else {
                setIsPass(false)
            }
        } else if (codeConfig.type == 'sendMessage' || codeConfig.type == 'replaceMessage') {
            if (typeof results === 'string') {
                // myValue 是一个布尔值
                setIsPass(true)
            } else {
                setIsPass(false)
            }
        } else if (codeConfig.type == 'modify') {
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
        } else if (codeConfig.type == 'prompt') {
            setIsPass(true)
            // const errors = validate(results, promptValidate);
            // if (errors) {
            //     let errorMessage = ''
            //     Object.values(errors).forEach((item: any) => {
            //         errorMessage = errorMessage + item[0] + '\n'
            //     })
            //     setIsPass(false)
            //     return errorMessage
            // } else {
            //     let errorMessage = ''
            //     results.system.forEach((item: any) => {
            //         const errorsSelf = validate(item, systemValidate);
            //         if (errorsSelf) {
            //             Object.values(errorsSelf).forEach((itemSelf: any) => {
            //                 errorMessage = errorMessage + itemSelf[0] + '\n'
            //             })
            //         }
            //     })
            //     results.conversation.forEach((item: any) => {
            //         const errorsSelf = validate(item, conversationValidate);
            //         if (errorsSelf) {
            //             Object.values(errorsSelf).forEach((itemSelf: any) => {
            //                 errorMessage = errorMessage + itemSelf[0] + '\n'
            //             })
            //         }
            //     })
            //     results.logitBiasArray.forEach((item: any) => {
            //         const errorsSelf = validate(item, logitBiasArrayValidate);
            //         if (errorsSelf) {
            //             Object.values(errorsSelf).forEach((itemSelf: any) => {
            //                 errorMessage = errorMessage + itemSelf[0] + '\n'
            //             })
            //         }
            //     })

            //     if (errorMessage == '') {
            //         setIsPass(true)
            //     } else {
            //         return errorMessage
            //     }
            // }
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





    const handalChangeSelect = async (value: any, type: string) => {
        console.log(value, type, 7777777)
        if (type == 'role') {
            const newInputTestData: any = Object.assign({}, inputTestData)
            newInputTestData.input.role = value
            setInputTestData(newInputTestData)
        }
    }

    // input: {
    //     type: 'text',
    //     role: 'user',
    //     content: 'hello world!',
    // },

    const changeInput = (e: any) => {
        const newInputTestData: any = Object.assign({}, inputTestData)
        newInputTestData.input.content.text = e.target.value
        setInputTestData(newInputTestData)
    }

    // const changeIndex = (val: any, type: string) => {
    //     const newInputTestData: any = Object.assign({}, inputTestData)
    //     newInputTestData.index[type] = val
    //     setInputTestData(newInputTestData)
    // }

    return (
        <div className={styles.container}>
            <Row
                align="middle"
                style={{ padding: '1vh', boxSizing: 'border-box' }}
            >
                <Col className={styles.title}>{drawerTitle} Function</Col>
            </Row>
            <div onMouseDown={(e) => e.stopPropagation()}>
                <AceEditor
                    placeholder=""
                    mode="javascript"
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
            <div onMouseDown={(e) => e.stopPropagation()} className={styles.testContentWrap}>
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
                            <Col className={styles.textTitle} span={4}><Select
                                value={inputTestData.input.role}
                                onChange={(val: any) => { handalChangeSelect(val, 'role') }}
                                options={[{ value: 'user', 'label': "User" }, { value: 'assistant', 'label': "Assistant" }]}>
                            </Select> </Col>
                            <Col span={18}>
                                <TextArea autoSize={{ minRows: 3, maxRows: 10 }} value={inputTestData.input.content.text} onChange={changeInput} ></TextArea>
                            </Col>
                        </Row>
                        <br />
                        {/* <Row justify="space-between" gutter={16}>
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
                        <br /> */}

                        {/* <Row gutter={16} justify="space-between" >
                            <Row align="middle">
                                <Popover content={HistoryHoverContent}>
                                    <Popover content={HistoryHoverContent} trigger="click">
                                        <Button>History</Button>
                                    </Popover>
                                </Popover>
                            </Row>
                        </Row>
                        <br /> */}
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
