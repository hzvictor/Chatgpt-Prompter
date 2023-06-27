import styles from './index.less';
import { Slider, Row, Col, Form, Modal, Popconfirm, Tooltip, Select, Drawer, message, InputNumber, Input, Button, Space, Card } from 'antd';
import { useEffect, useState } from 'react';
import { fakeHooks } from '@/stores/fakehooks';
import { listfinetunesToOpenai } from '@/services/openai'
import TabList from '@/components/bpurecomponents/tabList';
import { getProjectSlidelistList, newSlidelist, updateSlidelistDetail, updateActiveSlidelist, getTargetSlidelist, deleteSlidelist } from '@/database/prompter/slidelist'
import { getProjectTuningList } from '@/database/prompter/tuning'

import { EditOutlined, DeleteOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
const { TextArea } = Input;
const { Meta } = Card;
const defaultOption = [
  { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo' },
  { value: 'gpt-3.5-turbo-16k', label: 'gpt-3.5-turbo-16k' },
  { value: 'gpt-3.5-turbo-16k-0613', label: 'gpt-3.5-turbo-16k-0613' },
  { value: 'gpt-3.5-turbo-0613', label: 'gpt-3.5-turbo-0613' },
  { value: 'gpt-3.5-turbo-0301', label: 'gpt-3.5-turbo-0301' },
]
const deleteText = 'Are you sure to delete this project';
const deleteDescription = 'cannot be restored after deletion.';

export default function IndexPage({ projectid }: any) {
  const [form] = Form.useForm();
  const [modelFrom] = Form.useForm();
  const [optionsModel, setOptionsModel] = useState(defaultOption);
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [functonsOption, setFunctionsOption ] = useState([
    { value: 'none', label: 'None' },
  ])
  const [tableInfo, setTableInfo] = useState({
    nanoid: '',
    name: 'Parameter',
    isActive: true
  })
  const [dataSource, setDataSource] = useState({
    model: 'gpt-3.5-turbo',
    temperature: 1,
    max_tokens: 100,
    top_p: 1,
    n: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
    functions: [],
    function_call: '',
  })
  const [allDataSource, setAllDataSource] = useState([])
  const [isUpdate, setIsUpdate] = useState(false)
  const [editeIndex, setEditeIndex] = useState(0)

  useEffect(() => {
    updateFromConfig()
    getModelOptions()
  }, [projectid])

  const updateFromConfig = () => {
    getProjectSlidelistList(projectid).then(res => {
      if (res.all.length == 0) {
        newSlidelist('Parameter', projectid,{
          model: 'gpt-3.5-turbo',
          temperature: 1,
          max_tokens: 100,
          top_p: 1,
          n: 1,
          presence_penalty: 0,
          frequency_penalty: 0,
          functions: [],
          function_call: '',
        }).then((id: any) => {
          setTableInfo({
            nanoid: id,
            name: 'Parameter',
            isActive: true,
          })
          setAllDataSource([
            {
              nanoid: id,
              name: 'Parameter',
            }
          ])
        })
      } else {
        setAllDataSource(res.all)
        setTableInfo(res?.active)
        setDataSource(res?.active?.config)
      }
    })
  }

  useEffect(() => {
    if (JSON.stringify(dataSource) == '{}') {
      form.setFieldsValue({
        model: optionsModel[0].value,
        temperature: 1,
        max_tokens: 100,
        top_p: 1,
        n: 1,
        presence_penalty: 0,
        frequency_penalty: 0,
        functions: [],
        function_call: '',
      })

      if (tableInfo.nanoid) {
        updateSlidelistDetail(tableInfo.nanoid, {
          config: {
            model: optionsModel[0].value,
            temperature: 1,
            max_tokens: 100,
            top_p: 1,
            n: 1,
            presence_penalty: 0,
            frequency_penalty: 0,
            functions: [],
            function_call: '',
          }
        })
      }
    } else {
      form.setFieldsValue({
        ...dataSource,
      })

      const functions = dataSource.functions.map((item:any)=>{
        return {
              value: item.name, label:  item.name
        }
      })  

      setFunctionsOption([
    { value: 'none', label: 'None' },
  ].concat(functions))

      if (tableInfo.nanoid) {
        updateSlidelistDetail(tableInfo.nanoid, { config: dataSource })
      }
    }


  }, [dataSource])


  const onChange = () => {
    const config = form.getFieldsValue()
    config.functions = dataSource.functions
    if (tableInfo.nanoid) {
      updateSlidelistDetail(tableInfo.nanoid, { config: config })
    }
  }


  const addNewTab = async () => {
    const id = await newSlidelist(`Parameter ${allDataSource.length}`,projectid,{
      model: 'davinci',
      temperature: 1,
      max_tokens: 100,
      top_p: 1,
      n: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
      functions: [],
      function_call: '',
    })
    await updateActiveSlidelist(projectid, id)
    await updateFromConfig()
    return id
  }

  const changeTab = async (newActiveKey: string) => {
    await updateActiveSlidelist(projectid, newActiveKey)
    const tuning = await getTargetSlidelist(newActiveKey)

    setTableInfo(tuning)
    setDataSource(tuning.config)

    fakeHooks.updateChatbotParameter()
  }

  const removeTab = async (targetKey: string, newActiveKey: string) => {

    if (targetKey != newActiveKey) {
      await changeTab(newActiveKey)
      await deleteSlidelist(targetKey)
      await updateFromConfig()
    } else {
      message.info('cannot delete the last')
    }
  }

  const changeTabName = async (newName: string) => {
    await updateSlidelistDetail(tableInfo.nanoid, { name: newName })
  }

  const saveTab = () => {
    updateFromConfig()
  }

  const getModelOptions = () => {
  }

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const confirmDelete = (selfIndex: number) => {
    const newDataSource = JSON.parse(JSON.stringify(dataSource))
    newDataSource.functions = newDataSource.functions.filter((item: any, index: number) => selfIndex != index)

    setDataSource(newDataSource)
  };

  const showModal = () => {
    setIsUpdate(false)
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onFinish = (values: any) => {

    console.log(values)
    if(!values.parameters){
      message.error("at least one parameter")
      return
    }

    const newDataSource = JSON.parse(JSON.stringify(dataSource))
    if(isUpdate){
      newDataSource.functions[editeIndex] = values
    }else{
      newDataSource.functions = newDataSource.functions.concat([values])
    }
    
    setDataSource(newDataSource)

    modelFrom.resetFields()
    handleOk()
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const editModelForm = (data: any, index: number) => {
    setIsUpdate(true)
    setIsModalOpen(true)
    setEditeIndex(index)
    modelFrom.setFieldsValue(data)
  };


  fakeHooks.updateModelOptions = getModelOptions

  return (
    <div className={`componentContainer  ${styles.container}`} >
      <Row>
        <Col span={24}>
          <TabList
            addNewTab={addNewTab}
            changeTab={changeTab}
            removeTab={removeTab}
            saveTab={saveTab}
            changeTabName={changeTabName}
            activeItem={tableInfo}
            allitem={allDataSource}
          ></TabList>
        </Col>
      </Row>
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
                  step={1}
                />
              </Form.Item >
            </Col>
            <Col span={4}>
              <Form.Item className={styles.formItemStyle} name="n">
                <InputNumber
                  min={0}
                  max={10}
                  step={1}
                  size="small"
                  style={{}}
                />
              </Form.Item >
            </Col>
          </Row>
        </div>
        <div className={styles.rowLine} style={{ margin: '20px 0px' }}>
          <Space size="large" >
            <Tooltip
              color="pink"
              title="How many completions to generate for each prompt."
            >
              <Col className={styles.title}>Funcions</Col>
            </Tooltip>

            <Button type="primary" onClick={showDrawer} >Config Functions</Button>
          </Space>
        </div>

        <div className={styles.rowLine}>
          <Row>
            <Tooltip
              color="pink"
              title="Specify the function to execute"
            >
              <Col className={styles.title}>Funcion Call</Col>
            </Tooltip>
          </Row>
          <Row
            onMouseDown={(e) => e.stopPropagation()}
            align="middle"
          >
            <Form.Item className={styles.formItemStyle} name="function_call" >
              <Select
                showSearch
                allowClear={true}
                options={functonsOption}
              />
            </Form.Item>
          </Row>
        </div>
      </Form>
      <Drawer title="Functions" placement="right" size="large" onClose={onClose} open={open}>
        <Row> <Button type="primary" onClick={showModal} >Add Function</Button></Row>
        <br />
        <Space wrap size="large" >
          {dataSource.functions.map((item: any, index) => {
            return <Card
              key={index}
              style={{ width: 300, padding: '10px' }}
              cover={
                <div style={{ height: "200px", overflow: "hidden" }}>
                  {
                    item.parameters ? item.parameters.map((parameter: any, parameterIndex: number) => {
                      return <div key={parameterIndex} style={{ marginBottom: 8, padding: '5px', borderRadius: "5px", border: "1px solid #eee" }}>
                        <div>name: {parameter.name}</div>
                        <div>type: {parameter.type}</div>
                        <div>description: {parameter.description}</div>
                      </div>
                    })

                      : 'No Parameters'
                  }

                </div>
              }
              actions={[
                <EditOutlined key="edit" onClick={() => { editModelForm(item, index) }} />,
                <Popconfirm
                  placement="bottomLeft"
                  key="delete"
                  title={deleteText}
                  description={deleteDescription}
                  onConfirm={() => {
                    confirmDelete(index);
                  }}
                  okText="Yes"
                  cancelText="No"
                >
                  <DeleteOutlined />
                </Popconfirm>,
              ]}
            >
              <Meta
                title={item.name}
                description={item.description}
              />
            </Card>
          })}
        </Space>

        <Modal title="Function" footer={null} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
          <Form
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 14 }}
            layout="horizontal"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            form={modelFrom}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Missing  name' }]}
            >
              <Input placeholder="input placeholder" />
            </Form.Item>
            <Form.Item label="Description" name="description" rules={[{ required: true, message: 'Missing description' }]}>
              <TextArea ></TextArea>
            </Form.Item>

            <Form.List name="parameters">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8, padding: '5px', borderRadius: "10px", border: "1px solid #eee" }} direction="vertical" >
                      <MinusCircleOutlined onClick={() => remove(name)} />
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        label="Name"
                        rules={[{ required: true, message: 'Missing  name' }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Description"
                        name={[name, 'description']}
                        rules={[{ required: true, message: 'Missing description' }]}
                      >
                        <TextArea ></TextArea>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Type"
                        name={[name, 'type']}
                        rules={[{ required: true, message: 'type' }]}
                      >
                        <Select
                          showSearch
                          options={[
                            { value: 'string', label: 'string' },
                            { value: 'integer', label: 'integer' },
                            { value: 'number', label: 'number' },
                            { value: 'boolean', label: 'boolean' },
                            { value: 'array', label: 'array' },
                            { value: 'object', label: 'object' },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="enum"
                        name={[name, 'enum']}
                      >
                        <Select
                          mode="tags"
                          style={{ width: '100%' }}
                          placeholder="input"
                          options={[]}
                        />
                      </Form.Item>
                    </Space>
                  ))}
                  <Button style={{ marginBottom: "10px" }} type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Parameter
                  </Button>
                </>
              )}
            </Form.List>

            {/* <Form.Item label="Required" name="required">
              <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder="Please select"
                defaultValue={['a10']}
                // onChange={handleChange}
                options={[]}
              />
            </Form.Item> */}
            <Form.Item >
              <Button htmlType="submit" type="primary">{isUpdate ? "Update" : 'Submit'}</Button>
            </Form.Item>
          </Form>
        </Modal>

      </Drawer>

    </div>
  );
}
