import React, { useState } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Row, Col, Slider, InputNumber, } from 'antd';
import styles from './index.less';
import TextArea from 'antd/es/input/TextArea';

type RequiredMark = boolean | 'optional';

const App = ({ updataDataSource }: any) => {
    const [form] = Form.useForm();

    const onRequiredTypeChange = (value: any) => {

    };

    const submit = (value: any) => {

        updataDataSource({
            type:'request',
            ...value
        })
    }

    return (
        <>
            <Form
                form={form}
                onFinish={submit}
                layout="vertical"
                initialValues={{ 
                    prompt: 'Ask a question about Chinese food', 
                    complete: "answer ${prompt} question", 
                    number: 500, 
                    question_token:200,
                    question_temperature: 0.8,
                    answer_token:200,
                    answer_temperature: 0.8,
                }}
                onValuesChange={onRequiredTypeChange}
            >
                <Form.Item label="Ask GPT to generate a prompt" name="prompt"  >
                    <TextArea  ></TextArea>
                </Form.Item>
                <Form.Item
                    label="Question‘s token"
                >
                    <Row
                        align="middle"
                        gutter={16}
                    >
                        <Col span={16}>
                            <Form.Item className={styles.formItemStyle} name="question_token">
                                <Slider
                                    min={0}
                                    max={2023}
                                    step={1}
                                />
                            </Form.Item >
                        </Col>
                        <Col span={4}>
                            <Form.Item className={styles.formItemStyle} name="question_token">
                                <InputNumber
                                    min={0}
                                    max={2023}
                                    step={1}
                                    size="small"
                                />
                            </Form.Item >
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item
                    label="Question‘s Temperature"
                >
                    <Row
                        onMouseDown={(e) => e.stopPropagation()}
                        align="middle"
                        gutter={16}
                    >
                        <Col span={16}>
                            <Form.Item className={styles.formItemStyle} name="question_temperature">
                                <Slider
                                    min={0}
                                    max={2}
                                    step={0.01}
                                />
                            </Form.Item >
                        </Col>
                        <Col span={4}>
                            <Form.Item className={styles.formItemStyle} name="question_temperature">
                                <InputNumber
                                    min={0}
                                    max={2}
                                    step={0.01}
                                    size="small"
                                />
                            </Form.Item >
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item
                    label="Ask GPT to generate a complete"
                    name="complete"
                >
                    <TextArea  ></TextArea>
                </Form.Item>
                <Form.Item
                    label="Answer‘s token"
                >
                    <Row
                        align="middle"
                        gutter={16}
                    >
                        <Col span={16}>
                            <Form.Item className={styles.formItemStyle} name="answer_token">
                                <Slider
                                    min={0}
                                    max={2023}
                                    step={1}
                                />
                            </Form.Item >
                        </Col>
                        <Col span={4}>
                            <Form.Item className={styles.formItemStyle} name="answer_token">
                                <InputNumber
                                    min={0}
                                    max={2023}
                                    step={1}
                                    size="small"
                                />
                            </Form.Item >
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item
                    label="Answer‘s Temperature"
                >
                    <Row
                        onMouseDown={(e) => e.stopPropagation()}
                        align="middle"
                        gutter={16}
                    >
                        <Col span={16}>
                            <Form.Item className={styles.formItemStyle} name="answer_temperature">
                                <Slider
                                    min={0}
                                    max={2}
                                    step={0.01}
                                />
                            </Form.Item >
                        </Col>
                        <Col span={4}>
                            <Form.Item className={styles.formItemStyle} name="answer_temperature">
                                <InputNumber
                                    min={0}
                                    max={2}
                                    step={0.01}
                                    size="small"
                                />
                            </Form.Item >
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item
                    label="How many items to generate"
                >
                    <Row
                        align="middle"
                        gutter={16}
                    >
                        <Col span={16}>
                            <Form.Item className={styles.formItemStyle} name="number">
                                <Slider
                                    min={0}
                                    max={2023}
                                    step={1}
                                />
                            </Form.Item >
                        </Col>
                        <Col span={4}>
                            <Form.Item className={styles.formItemStyle} name="number">
                                <InputNumber
                                    min={0}
                                    max={2023}
                                    step={1}
                                    size="small"
                                />
                            </Form.Item >
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item>
                    <Button htmlType="submit" type="primary">Submit</Button>
                </Form.Item>
            </Form>
            <div>Use chatgpt 3.5 to generate content</div>
        </>
    );
};

export default App;