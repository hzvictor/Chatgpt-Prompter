import styles from './index.less';
import { DownloadOutlined, DeleteOutlined, FolderOutlined } from '@ant-design/icons';
import { downloadfileToOpenai, retrieveFTToOpenai, fileDeleteToOpenai, listfilesToOpenai, listfinetunesToOpenai, cancelfinetuneToOpenai, deletemodelToOpenai } from '@/services/openai'
import { Row, Col, Popconfirm, Tabs, Table, Space, message, Modal, Button } from 'antd';
import { useEffect, useState } from 'react';
import TrainResult from '@/components/tuning/components/trainResult'
import dayjs from 'dayjs';




export default function IndexPage() {
  const [trainResult, setTrainResult] = useState({})
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const fileColumns = [
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: {
        compare: (a, b) => a.created_at - b.created_at,
        multiple: 1,
      },
      render: (text) => <span>{dayjs(text * 1000).format('YYYY-MM-DD-HH:mm:ss')}</span>,
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Purpose',
      dataIndex: 'purpose',
      key: 'purpose',
    },
    {
      title: 'Filename',
      dataIndex: 'filename',
      key: 'filename',
    },
    {
      title: 'Bytes',
      dataIndex: 'bytes',
      key: 'bytes',
      sorter: {
        compare: (a, b) => a.bytes - b.bytes,
        multiple: 3,
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },

    {
      title: 'operation',
      width: '5%',
      dataIndex: 'operation',
      render: (_, record: any) =>
        fileData.length >= 1 ? (
          <Space size="large">
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDeleteFile(record.id)}
            >
              <DeleteOutlined />
            </Popconfirm>
            <DownloadOutlined onClick={() => { downloadFile(record) }} />
          </Space>
        ) : null,
    },
  ]

  const modelColumns = [
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: {
        compare: (a, b) => a.created_at - b.created_at,
        multiple: 3,
      },
      render: (text) => <span>{dayjs(text * 1000).format('YYYY-MM-DD-HH:mm:ss')}</span>,
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Name',
      dataIndex: 'fine_tuned_model',
      key: 'fine_tuned_model',
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: "center",
      render: (_, record: any) =>
        modelData.length >= 1 ?
          record.status == 'pending' || record.status == 'running' ? <Button type="primary"  loading={loadingStop} onClick={() => { cancelfinetune(record) }}  > Stop </Button> : <span>{record.status}</span>
          : null,
    },
    {
      title: 'Result Files',
      dataIndex: 'status',
      key: 'status',
      align: "center",
      render: (_, record: any) =>
        modelData.length >= 1 ?
          record.result_files.length > 0 ? <Button onClick={() => { downloadFile(record.result_files[0]) }} icon={<DownloadOutlined />} ></Button> : <span>no data</span>
          : null,
    },
    {
      title: 'Training Files',
      dataIndex: 'training_files',
      key: 'training_files',
      align: "center",
      render: (_, record: any) =>
        modelData.length >= 1 ?
          record.training_files.length > 0 ? <Button onClick={() => { downloadFile(record.training_files[0]) }} icon={<DownloadOutlined />} ></Button> : <span>no data</span>
          : null,
    },
    {
      title: 'validation Files',
      dataIndex: 'validation_files',
      align: "center",
      key: 'validation_files',
      render: (_, record: any) =>
        modelData.length >= 1 ?
          record.validation_files.length > 0 ? <Button onClick={() => { downloadFile(record.validation_files[0]) }} icon={<DownloadOutlined />} ></Button> : <span>no data</span>
          : null,
    },

    {
      title: 'operation',
      width: '5%',
      dataIndex: 'operation',
      render: (_, record: any) =>
        modelData.length >= 1 ? (
          <Space size="large">
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDeleteModel(record)}
            >
              <DeleteOutlined />
            </Popconfirm>
            <Button loading={loadingResult} shape="circle" icon={<FolderOutlined />} onClick={() => { checkResult(record) }} ></Button>
          </Space>
        ) : null,
    },
  ]


  const cancelfinetune = (record: any) => {
    setLoadingStop(true)
    cancelfinetuneToOpenai(record.id).then(res => {
      setLoadingStop(false)
      if (res) {
        message.success('Fine Tuning is stoped')
      } else {
        message.info('Fine Tuning is stoped')
      }

      let newList = modelData.map((item: any) => {
        if (item.id == record.id) {
          item.status = 'cancelled'
          return item
        }else{
          return item
        }
      })

      setModelData(newList)
    }
    )
  }

  const handleDeleteModel = (record: any) => {
    if (!record.fine_tuned_model) {
      message.info("openai does not provide a deletion failure model")
      return
    }

    deletemodelToOpenai(record.fine_tuned_model).then((res: any) => {
      console.log(res)
      if (JSON.stringify(res.code) == '0') {

        let newList = modelData.filter((item: any) => item.id != record.id)

        setModelData(newList)

        message.success("delete success")
      } else {
        message.warning("delete fail")
      }
    })
  }

  const checkResult = (record: any) => {
    setLoadingResult(true)
    retrieveFTToOpenai(record.id).then(res => {
      setLoadingResult(false)
      if (res) {
        setTrainResult(res.data)
        showResultModal()
      } else {
        message.info('Result not exit')
      }
    })
  }



  const downloadFile = (record: any) => {
    downloadfileToOpenai(record.id).then((res: any) => {
      console.log(res)
      if (JSON.stringify(res.code) == '0') {
        let fileData, url
        const suffix = record.filename.split('.')[1]
        const name = record.filename.split('.')[0]
        console.log(suffix)
        if (suffix == 'jsonl') {

          fileData = typeof res.data === 'object' ? JSON.stringify(res.data) : res.data; // 你要下载的文件内容
          const blob = new Blob([fileData], { type: 'text/plain' });
          url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = name + '.text'; // 下载的文件名
          document.body.appendChild(link);
          link.click();

          // 下载完成后，清理创建的 URL 对象
          URL.revokeObjectURL(url);
        } else {
          fileData = res.data; // 你要下载的文件内容
          const blob = new Blob([fileData], { type: 'application/csv' });
          url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = record.filename; // 下载的文件名
          document.body.appendChild(link);
          link.click();

          // 下载完成后，清理创建的 URL 对象
          URL.revokeObjectURL(url);
        }
        message.success("download success")
      } else {
        message.warning("download fail")
      }
    })
  }

  const handleDeleteFile = (id: string) => {
    fileDeleteToOpenai(id).then((res: any) => {
      console.log()
      if (JSON.stringify(res.code) == '0') {

        let newList = fileData.filter((item: any) => item.id != id)

        setFileData(newList)

        message.success("delete success")
      } else {
        message.warning("delete fail")
      }
    })
  }

  const [loadingStop, setLoadingStop] = useState(false);
  const [fileData, setFileData] = useState([])
  const [modelData, setModelData] = useState([])
  const [loadingFile, setLoadingFile] = useState(false)
  const [loadingResult, setLoadingResult] = useState(false)
  const [loadingModel, setLoadingModel] = useState(false)
  useEffect(() => {
    setLoadingFile(true)
    listfilesToOpenai().then(res => {
      setLoadingFile(false)
      if (res) {
        setFileData(
          res.data.data.map((item: any) => {
          item.key = item.id
          return item
        }).sort((a, b) =>   b.created_at - a.created_at)
        )
      }
    })
    setLoadingModel(true)
    listfinetunesToOpenai().then(res => {
      setLoadingModel(false)
      if (res) {
        setModelData(
          res.data.data.map((item: any) => {
          item.key = item.id
          return item
        }).sort((a, b) =>   b.created_at - a.created_at)
        )
      }
    })
  }, [])


  const onChange = () => {

  }

  const showResultModal = () => {
    setIsResultModalOpen(true);
  };

  const handleResultOk = () => {
    setIsResultModalOpen(false);
  };

  const handleResultCancel = () => {
    setIsResultModalOpen(false);
  };

  const items = [
    {
      key: '1',
      label: `Files`,
      children: <div >
        <Table loading={loadingFile} dataSource={fileData} columns={fileColumns} ></Table>
      </div>,
    },
    {
      key: '2',
      label: `Fine Tune Model`,
      children: <div >
        <Table loading={loadingModel} dataSource={modelData} columns={modelColumns} ></Table>
      </div>,
    },
  ];

  return <div className={styles.container}>
    <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    <Modal width={1000} destroyOnClose={true} title="Training Result" open={isResultModalOpen} onOk={handleResultOk} onCancel={handleResultCancel}>
      <TrainResult result={trainResult} ></TrainResult>
    </Modal>
  </div>;
}
