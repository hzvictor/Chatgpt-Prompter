import styles from './index.less';
import React, { useEffect, useState } from 'react';
import { CheckCircleFilled, CheckCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Drawer, Select, InputNumber, Switch, Divider } from 'antd';
import { updateTuningDetail, getTargetTuning } from '@/database/prompter/tuning'
import { getProjectValidationList } from '@/database/prompter/validation'
import { fileTrainToOpenai } from '@/services/openai'
import TextArea from 'antd/es/input/TextArea';
import Validation from '../validation'
import dayjs from 'dayjs';
type LayoutType = Parameters<typeof Form>[0]['layout'];

const App: React.FC = ({ tableInfo, onCancel }: any) => {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([])
  const [trainConfig, setTrainConfig] = useState({
    openValidation: false,
    openMoreSetting: false,
    model: 'davinci',
    n_epochs: 4,
    batch_size: 0,
    learning_rate_multiplier: 0.05,
    prompt_loss_weight: 0.01
  })
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const onFormChange = (value: any) => {
    updateTrainConfig(Object.keys(value)[0], value[Object.keys(value)[0]])
  };


  useEffect(() => {
    getTargetTuning(tableInfo.nanoid).then((res: any) => {
      if (JSON.stringify(res.trainConfig) != '{}') {
        setTrainConfig(res.trainConfig)
        form.setFieldsValue(res.trainConfig)
      } else {
        form.setFieldsValue({
          model: 'davinci',
          n_epochs: 4,
          batch_size: 0,
          learning_rate_multiplier: 0.05,
          prompt_loss_weight: 0.01
        })
      }

      setDataSource(res.list)
    })

  }, [tableInfo])




  const updateTrainConfig = async (key: string, info: any) => {

    const newTableInfo = JSON.parse(JSON.stringify(trainConfig))

    newTableInfo[key] = info

    setTrainConfig(newTableInfo)


    await updateTuningDetail(tableInfo.nanoid, { trainConfig: newTableInfo })
  }

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);


    // fileUploadToOpenai(dataSource.map((item: any) => ({ completion: item.completion, prompt: item.prompt })))
  };
  const onFinish = (errorInfo: any) => {
    setLoading(true)
    const config = JSON.parse(JSON.stringify(trainConfig))
    if (!config.openValidation) {
      delete config.validation_file
      delete config.compute_classification_metrics
      delete config.classification_n_classes
      delete config.classification_positive_class
      delete config.classification_betas
    }
    if (!config.openMoreSetting) {
      delete config.n_epochs
      delete config.batch_size
      delete config.learning_rate_multiplier
      delete config.prompt_loss_weight
    }

    if (config.classification_betas) {
      config.classification_betas = config.classification_betas.map((item: any) => Number(item))
    }

    if (config.classification_n_classes > 2) {
      delete config.classification_positive_class
    }

    delete config.openMoreSetting
    delete config.openValidation



    fileTrainToOpenai({
      jsonl: dataSource.map((item: any) => ({ completion: item.completion, prompt: item.prompt })),
      config: config
    }).then((res: any) => {
      if (res?.data) {
        updateTrainConfig('ftid', res.data).then(() => {
          onCancel(true)
        })

      }

      setLoading(false)
    })
  };

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    getProjectValidationList(tableInfo.nanoid).then((res: any) => {
      if (res.all.length > 0) {
        updateTrainConfig('validation_file', res.active.fileid)
      }
    })
    setOpen(false);
  };




  return (
    <>

      <Form
        form={form}
        disabled={trainConfig.ftid}
        labelCol={{ span: 9 }}
        onValuesChange={onFormChange}
        onFinish={onFinish}
        labelWrap
        onFinishFailed={onFinishFailed}
      >
        <Form.Item label="Model" name="model" >
          <Select
            style={{ width: 120 }}
            options={[
              { value: 'davinci', label: 'davinci' },
              { value: 'curie', label: 'curie' },
              { value: 'babbage', label: 'babbage' },
              { value: 'ada', label: 'ada' },
            ]}
          />
        </Form.Item>
        <Form.Item label="suffix" name="suffix" >
          <Input></Input>
        </Form.Item>
        <Form.Item label="Model Name"  >
          {`${trainConfig?.model}:ft-your-org:${trainConfig?.suffix}-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}`}
        </Form.Item>
        <Divider />
        <Form.Item label="More Setting" >
          <Switch checked={trainConfig.openMoreSetting} onChange={(val) => { updateTrainConfig('openMoreSetting', val) }} />
        </Form.Item>
        {trainConfig.openMoreSetting && <>

          <Form.Item label="N Epochs" name="n_epochs"  >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item label="Batch Size" name="batch_size" >
            <InputNumber min={0} max={256} />
          </Form.Item>
          <Form.Item label="Learning Rate Multiplier" name="learning_rate_multiplier" >
            <InputNumber step={0.01} min={0.00} />
          </Form.Item>
          <Form.Item label="Prompt Loss Weight" name="prompt_loss_weight" >
            <InputNumber step={0.01} min={0.00} />
          </Form.Item>




        </>}
        <Divider />
        <Form.Item label="Open Validation">
          <Switch checked={trainConfig.openValidation} onChange={(val) => { updateTrainConfig('openValidation', val) }} />
        </Form.Item>
        {trainConfig.openValidation && <>
          <Form.Item label="validation" name="validation" valuePropName="checked" >
            <Button icon={trainConfig.validation_file ? <CheckCircleFilled style={{ color: "green" }} /> : <CheckCircleOutlined />} onClick={showDrawer} >Select Validation File</Button>
          </Form.Item>
          {trainConfig.validation_file &&
            <>
              <Form.Item label="Compute Classification Metrics" name="compute_classification_metrics" valuePropName="checked" >
                <Switch />
              </Form.Item>
              {
                trainConfig.compute_classification_metrics && <>
                  <Form.Item label="Classification N Classes" name="classification_n_classes" >
                    <InputNumber />
                  </Form.Item>
                  {trainConfig.classification_n_classes <= 2 && <Form.Item label="classification Positive Class" name="classification_positive_class" >
                    <TextArea></TextArea>
                  </Form.Item>}

                  <Form.Item label="Classification Betas" name="classification_betas" >
                    <Select
                      mode="tags"
                      style={{ width: '100%' }}
                      tokenSeparators={[',']}
                      options={[
                        {
                          value: '0.5',
                          label: '0.5',
                        },
                        {
                          value: '1',
                          label: '1',
                        },
                        {
                          value: '2',
                          label: '2',
                        },
                      ]}
                    />
                  </Form.Item>
                </>
              }
            </>

          }
        </>}


        <Form.Item wrapperCol={{ offset: 9, span: 16 }} >
          <Button loading={loading} htmlType="submit" type="primary">Submit</Button>
        </Form.Item>
      </Form>
      <Drawer width={900} destroyOnClose={true} title="Validation File" size="large" placement="right" onClose={onClose} open={open}>
        <Validation tuningid={tableInfo.nanoid}  ></Validation>
      </Drawer>
    </>
  );
};

export default App;
