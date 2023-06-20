import styles from './index.less'
import { listfinetunesToOpenai } from '@/services/openai'
import DragModel from '@/components/apureComponents/dragModel';
import React, { useEffect, useState } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { ConfigProvider, Slider, Row, Col, Form, Tooltip, Select, message, InputNumber, Input } from 'antd';
import { getProjectTuningList } from '@/database/prompter/tuning'

const defaultOption = [{ value: 'text-davinci-003', label: 'text-davinci-003' },
{ value: 'text-curie-001', label: 'text-curie-001' },
{ value: 'text-babbage-001', label: 'text-babbage-001' },
{ value: 'text-ada-001', label: 'text-ada-001' },
{ value: 'text-davinci-002', label: 'text-davinci-002' },
{ value: 'text-davinci-001', label: 'text-davinci-001' },
{ value: 'davinci-instruct-beta', label: 'davinci-instruct-beta' },
{ value: 'davinci', label: 'davinci' },
{ value: 'curie-instruct-beta', label: 'curie-instruct-beta' },
{ value: 'curie', label: 'curie' },
{ value: 'babbage', label: 'babbage' },
{ value: 'ada', label: 'ada' }]

export default ({ node }: any) => {
    const formData = node.getData()
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [optionsModel, setOptionsModel] = useState(defaultOption);

    useEffect(() => {
        if (JSON.stringify(formData) == '{}') {
            form.setFieldsValue({
                model: optionsModel[0].value,
                temperature: 1,
                max_tokens: 100,
                top_p: 1,
                presence_penalty: 0,
                frequency_penalty: 0,
                best_of: 1,
            })
        } else {
            form.setFieldsValue(formData)
        }


        getModelOptions()
    }, [])

    // const changeString = (val: any) => {
    //     node.setData({
    //         prefix: val.target.value,
    //         suffix:prefix
    //     })
    // }

    // const changeReplace = (val: any) => {
    //     node.setData({
    //         prefix: suffix,
    //         suffix:val.target.value
    //     })
    // }

    const showModal = () => {
        setOpen(true);
    };



    const handleOk = (e: React.MouseEvent<HTMLElement>) => {

        setOpen(false);
    };

    const handleCancel = (e: React.MouseEvent<HTMLElement>) => {

        setOpen(false);
    };


    const getModelOptions = () => {
        listfinetunesToOpenai().then(async (res: any) => {
            if (res) {
                const usefuleModel = res.data.data.filter((item: any) => item.fine_tuned_model).sort((a, b) => b.created_at - a.created_at).map((item: any) => ({ value: item.fine_tuned_model, label: item.fine_tuned_model }))
                setOptionsModel([...defaultOption, ...usefuleModel])
            }
        })
    }

    const onChange = () => {
        const config = form.getFieldsValue()
        console.log(config, 1111111)
        node.setData(config)
        // if (tableInfo.nanoid) {
        //   updateSlidelistDetail(tableInfo.nanoid, { config: config })
        // }
    }

    return <div className={styles.nodeContainer} >
        <div className={styles.nodeTitle} >
            Replace Parameter
        </div>
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#00AA90',
                },
            }}>

            <div onClick={showModal} className={styles.matchString}>
                <EditOutlined />
                {/* {prefix.substring(0, 5) + '... / ' +  suffix.substring(0, 5) + '...' } */}
            </div>

            <DragModel open={open}
                mask={false}
                destroyOnClose={true}
                onOk={handleOk}
                footer={null}
                title="Replace Parameter"
                onCancel={handleCancel}>
                <Form
                    form={form}
                    layout="vertical"
                    // initialValues={initialValues}
                    onValuesChange={onChange}
                >

                    <div className={styles.rowLine}>
                        <Row>
                            <Tooltip
                                color="pink"
                                title="Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive."
                            >
                                <Col className={styles.title}>Model</Col>
                            </Tooltip>
                        </Row>
                        <Row
                            onMouseDown={(e) => e.stopPropagation()}
                            align="middle"
                        >
                            <Form.Item className={styles.formItemStyle} name="model" >
                                <Select
                                    showSearch
                                    options={optionsModel}
                                />
                            </Form.Item>

                        </Row>
                    </div>
                    <div className={styles.rowLine}>
                        <Row>
                            <Tooltip
                                color="pink"
                                title="Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive."
                            >
                                <Col className={styles.title}>Temperature</Col>
                            </Tooltip>
                        </Row>
                        <Row
                            onMouseDown={(e) => e.stopPropagation()}
                            align="middle"
                            gutter={16}
                        >
                            <Col span={16}>
                                <Form.Item className={styles.formItemStyle} name="temperature">
                                    <Slider
                                        min={0}
                                        max={2}
                                        step={0.01}
                                    />
                                </Form.Item >
                            </Col>
                            <Col span={4}>
                                <Form.Item className={styles.formItemStyle} name="temperature">
                                    <InputNumber
                                        min={0}
                                        max={2}
                                        step={0.01}
                                        size="small"
                                    />
                                </Form.Item >
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.rowLine}>
                        <Row>
                            <Tooltip
                                color="volcano"
                                title="The maximum number of tokens to generate. Requests can use up to 2,048 or 4,000 tokens shared between prompt and completion. The exact limit varies by model. One token is roughly 4 characters for normal English text)"
                            >
                                <Col className={styles.title}>Maximum length</Col>
                            </Tooltip>
                        </Row>
                        <Row
                            onMouseDown={(e) => e.stopPropagation()}
                            align="middle"
                            gutter={16}
                        >
                            <Col span={16}>
                                <Form.Item className={styles.formItemStyle} name="max_tokens">
                                    <Slider
                                        min={0}
                                        max={2048}
                                        step={1}
                                    />
                                </Form.Item >
                            </Col>
                            <Col span={4}>
                                <Form.Item className={styles.formItemStyle} name="max_tokens">
                                    <InputNumber
                                        min={0}
                                        max={2048}
                                        step={1}
                                    />
                                </Form.Item >
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.rowLine}>
                        <Row>
                            <Tooltip
                                color="volcano"
                                title="Up to 4 sequences where the API will stop generating further tokens. The returned text will not contain the stop sequence."
                            >
                                <Col className={styles.title}>Stop sequences (up to 4 sequences)</Col>
                            </Tooltip>
                        </Row>
                        <Row
                            onMouseDown={(e) => e.stopPropagation()}
                            align="middle"
                        >
                            <Form.Item className={styles.formItemStyle} name="stop" >
                                <Select
                                    mode="tags"
                                    style={{ width: '100%', }}
                                    tokenSeparators={[',']}
                                    options={[
                                        {
                                            value: '.',
                                            label: '.',
                                        },
                                        {
                                            value: '!',
                                            label: '!',
                                        },
                                        {
                                            value: '“',
                                            label: '”',
                                        },
                                    ]}
                                />
                            </Form.Item>

                        </Row>
                    </div>
                    <div className={styles.rowLine}>
                        <Row>
                            <Tooltip
                                color="volcano"
                                title="An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered.

              We generally recommend altering this or temperature but not both."
                            >
                                <Col className={styles.title}>Top P</Col>
                            </Tooltip>
                        </Row>
                        <Row
                            onMouseDown={(e) => e.stopPropagation()}
                            align="middle"
                            gutter={16}
                        >
                            <Col span={16}>
                                <Form.Item className={styles.formItemStyle} name="top_p">
                                    <Slider
                                        min={0}
                                        max={1}
                                        step={0.01}
                                    />
                                </Form.Item >
                            </Col>
                            <Col span={4}>
                                <Form.Item className={styles.formItemStyle} name="top_p">
                                    <InputNumber
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        size="small"
                                        style={{}}
                                    />
                                </Form.Item >
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.rowLine}>
                        <Row>
                            <Tooltip
                                color="volcano"
                                title="Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim."
                            >
                                <Col className={styles.title}>Frequency penalty</Col>
                            </Tooltip>
                        </Row>
                        <Row
                            onMouseDown={(e) => e.stopPropagation()}
                            align="middle"
                            gutter={16}
                        >
                            <Col span={16}>
                                <Form.Item className={styles.formItemStyle} name="frequency_penalty">
                                    <Slider
                                        min={-2}
                                        max={2}
                                        step={0.01}
                                    />
                                </Form.Item >
                            </Col>
                            <Col span={4}>
                                <Form.Item className={styles.formItemStyle} name="frequency_penalty">
                                    <InputNumber
                                        min={-2}
                                        max={2}
                                        step={0.01}
                                        size="small"
                                    />
                                </Form.Item >
                            </Col>
                        </Row>
                    </div>

                    <div className={styles.rowLine}>
                        <Row>
                            <Tooltip
                                color="volcano"
                                title="Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics."
                            >
                                <Col className={styles.title}>Presence Penalty</Col>
                            </Tooltip>
                        </Row>
                        <Row
                            onMouseDown={(e) => e.stopPropagation()}
                            align="middle"
                            gutter={16}
                        >
                            <Col span={16}>
                                <Form.Item className={styles.formItemStyle} name="presence_penalty">
                                    <Slider
                                        min={-2}
                                        max={2}
                                        step={0.01}
                                    />
                                </Form.Item >
                            </Col>
                            <Col span={4}>
                                <Form.Item className={styles.formItemStyle} name="presence_penalty">
                                    <InputNumber
                                        min={-2}
                                        max={2}
                                        step={0.01}
                                        size="small"
                                        style={{}}
                                    />
                                </Form.Item >
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.rowLine}>
                        <Row>
                            <Tooltip
                                color="volcano"
                                title="Generates best_of completions server-side and returns the 'best' (the one with the highest log probability per token). Results cannot be streamed."
                            >
                                <Col className={styles.title}>Best Of</Col>
                            </Tooltip>
                        </Row>
                        <Row
                            onMouseDown={(e) => e.stopPropagation()}
                            align="middle"
                            gutter={16}
                        >
                            <Col span={16}>
                                <Form.Item className={styles.formItemStyle} name="best_of">
                                    <Slider
                                        min={1}
                                        max={10}
                                        step={1}
                                    />
                                </Form.Item >
                            </Col>
                            <Col span={4}>
                                <Form.Item className={styles.formItemStyle} name="best_of">
                                    <InputNumber
                                        min={1}
                                        max={10}
                                        step={1}
                                        size="small"
                                    />
                                </Form.Item >
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.rowLine}>
                        <Row>
                            <Tooltip
                                color="volcano"
                                title="Include the log probabilities on the logprobs most likely tokens, as well the chosen tokens. For example, if logprobs is 5, the API will return a list of the 5 most likely tokens. The API will always return the logprob of the sampled token, so there may be up to logprobs+1 elements in the response."
                            >
                                <Col className={styles.title}>Logprobs</Col>
                            </Tooltip>
                        </Row>
                        <Row
                            onMouseDown={(e) => e.stopPropagation()}
                            align="middle"
                            gutter={16}
                        >
                            <Col span={16}>
                                <Form.Item className={styles.formItemStyle} name="logprobs">
                                    <Slider
                                        min={0}
                                        max={5}
                                        step={1}
                                    />
                                </Form.Item >
                            </Col>
                            <Col span={4}>
                                <Form.Item className={styles.formItemStyle} name="logprobs">
                                    <InputNumber
                                        min={0}
                                        max={5}
                                        step={1}
                                        size="small"
                                    />
                                </Form.Item >
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.rowLine}>
                        <Row>
                            <Tooltip
                                color="pink"
                                title="The suffix that comes after a completion of inserted text."
                            >
                                <Col className={styles.title}>Inject start text</Col>
                            </Tooltip>
                        </Row>
                        <Row
                            onMouseDown={(e) => e.stopPropagation()}
                            align="middle"
                        >
                            <Form.Item className={styles.formItemStyle} name="suffix" >
                                <Input></Input>
                            </Form.Item>

                        </Row>
                    </div>
                    <div className={styles.rowLine}>
                        <Row>
                            <Tooltip
                                color="pink"
                                title="How many completions to generate for each prompt."
                            >
                                <Col className={styles.title}>N</Col>
                            </Tooltip>
                        </Row>
                        <Row
                            onMouseDown={(e) => e.stopPropagation()}
                            align="middle"
                            gutter={16}
                        >
                            <Col span={16}>
                                <Form.Item className={styles.formItemStyle} name="n">
                                    <Slider
                                        min={0}
                                        max={10}
                                    />
                                </Form.Item >
                            </Col>
                            <Col span={4}>
                                <Form.Item className={styles.formItemStyle} name="n">
                                    <InputNumber
                                        min={0}
                                        max={10}
                                        size="small"
                                    />
                                </Form.Item >
                            </Col>
                        </Row>
                    </div>
                </Form>

            </DragModel>
        </ConfigProvider>
    </div>
}