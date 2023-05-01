import { MenuOutlined, DeleteOutlined } from '@ant-design/icons';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import { CheckCircleFilled, CheckCircleOutlined } from '@ant-design/icons';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { makeNodeId } from '@/utils/withNodeId';
import React, { useContext, useEffect, useRef, useState } from 'react';
import type { InputRef } from 'antd';
import { Button, Form, Input, Popconfirm, Table, message, Row, Col, Modal } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { getProjectTuningList, newTuning, updateTuningDetail, updateActiveTuning, getTargetTuning, deleteTuning } from '@/database/prompter/tuning'
import { retrieveFTToOpenai } from '@/services/openai'
import TrainResult from './components/trainResult'
import TabList from '@/components/bpurecomponents/tabList';
import Train from './components/train'
import styles from './index.less';
import dayjs from 'dayjs';
const { TextArea } = Input;
const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface Item {
    key: string;
    prefix: string;
    suffix: string;
}

interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    children: React.ReactNode;
    dataIndex: keyof Item;
    record: Item;
    handleSave: (record: Item) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<InputRef>(null);
    const form = useContext(EditableContext)!;

    useEffect(() => {
        if (editing) {
            inputRef.current!.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();

            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (errInfo) { }
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form.Item
                onMouseDown={(e) => e.stopPropagation()}
                style={{ margin: 0 }}
                name={dataIndex}
                rules={[
                    {
                        required: false,
                        message: `${title} is required.`,
                    },
                ]}
            >
                <TextArea
                    onMouseDown={(e) => e.stopPropagation()}
                    ref={inputRef}
                    onPressEnter={save}
                    onBlur={save}
                />
            </Form.Item>
        ) : (
            <div
                className="editable-cell-value-wrap"
                onMouseDown={(e) => e.stopPropagation()}
                style={{ paddingRight: 24, minHeight: '30px' }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    'data-row-key': string;
}

// const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {

//     return (

//     );
// };

const TableRow = ({ children, ...props }: RowProps) => {



    const [form] = Form.useForm();
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props['data-row-key'],
    });

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Transform.toString(
            transform && { ...transform, scaleY: 1 },
        )?.replace(/translate3d\(([^,]+),/, 'translate3d(0,'),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };

    return (
        <Form
            form={form}
            onMouseDown={(e) => e.stopPropagation()}
            component={false}
        >
            <EditableContext.Provider value={form}>
                <tr
                    {...props}
                    ref={setNodeRef}
                    style={style}
                    onMouseDown={(e) => e.stopPropagation()}
                    {...attributes}
                >
                    {React.Children.map(children, (child) => {
                        if ((child as React.ReactElement).key === 'sort') {
                            return React.cloneElement(child as React.ReactElement, {
                                children: (
                                    <MenuOutlined
                                        onMouseDown={(e) => e.stopPropagation()}
                                        ref={setActivatorNodeRef}
                                        style={{ touchAction: 'none', cursor: 'move' }}
                                        {...listeners}
                                    />
                                ),
                            });
                        }
                        return child;
                    })}
                </tr>
            </EditableContext.Provider>
        </Form>
    );
};

const App: React.FC = ({ projectid }: any) => {
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [trainResult, setTrainResult] = useState({})
    const [tableInfo, setTableInfo] = useState({
        nanoid: '',
        name: 'Tuning',
        projectid: projectid,
        fine_tuned_model: '',
        trainConfig: {},
        isTrain: false,
        isActive: true,
    })
    const [dataSource, setDataSource] = useState([])
    const [allDataSource, setAllDataSource] = useState([])


    useEffect(() => {
        updateTableList()
    }, [])


    const updateTableList = () => {
        getProjectTuningList(projectid).then(res => {
            if (res.all.length == 0) {
                newTuning('Tuning', projectid).then((id: any) => {
                    setTableInfo({
                        nanoid: id,
                        name: 'Tuning',
                        projectid: projectid,
                        fine_tuned_model: '',
                        trainConfig: {},
                        isTrain: false,
                        isActive: true,
                    })
                    setAllDataSource([{
                        nanoid: id,
                        name: 'Tuning',
                        projectid: projectid,
                        fine_tuned_model: '',
                        trainConfig: {},
                        isTrain: false,
                        isActive: true,
                    }])
                })

            } else {
                setAllDataSource(res.all)
                setTableInfo(res?.active)
                setDataSource(res?.active?.list)
            }
        })
    }


    useEffect(() => {
        const newTableInfo = JSON.parse(JSON.stringify(tableInfo))

        delete newTableInfo.nanoid
        delete newTableInfo.creatData
        delete newTableInfo.projectid
        delete newTableInfo.trainConfig

        newTableInfo.updateDate = dayjs().valueOf()
        if (tableInfo.nanoid) {
            updateTuningDetail(tableInfo.nanoid, { ...newTableInfo, list: dataSource })
        }


    }, [dataSource, tableInfo])

    // const modifyStateShot = useSnapshot(modifyState);
    // const [dataSource, setDataSource] = useState([
    //     {
    //         key: '1',
    //         prefix: 'Edward King 0',
    //         suffix: 'London, Park Lane no. 0',
    //     },
    // ]);

    const defaultColumns: (ColumnTypes[number] & {
        editable?: boolean;
        dataIndex: string;
    })[] = [
            {
                key: 'sort',
            },
            {
                title: 'Prompt',
                dataIndex: 'prompt',
                width: '37%',
                editable: true,
            },
            {
                title: 'Completion',
                width: '30%',
                dataIndex: 'completion',
                editable: true,
            },
            {
                title: 'Remark',
                width: '20%',
                dataIndex: 'remark',
                editable: true,
            },
            {
                title: 'delete',
                width: '3%',
                dataIndex: 'delete',
                render: (_, record: { key: React.Key }) =>
                    dataSource.length >= 1 ? (
                        <Popconfirm
                            title="Sure to delete?"
                            onConfirm={() => handleDelete(record.key)}
                        >
                            <DeleteOutlined />
                        </Popconfirm>
                    ) : null,
            },
        ];

    const disableColumns: (ColumnTypes[number] & {
        editable?: boolean;
        dataIndex: string;
    })[] = [
            {
                title: 'Prompt',
                dataIndex: 'prompt',
                width: '37%',
                editable: true,
            },
            {
                title: 'Completion',
                width: '30%',
                dataIndex: 'completion',
                editable: true,
            },
            {
                title: 'Remark',
                width: '20%',
                dataIndex: 'remark',
                editable: true,
            },
        ];

    const handleDelete = (key: React.Key) => {
        const newData = dataSource.filter((item) => item.key !== key);
        setDataSource(newData);
    };

    const handleAdd = () => {
        const newData = {
            key: makeNodeId(),
            completion: ``,
            remark: ``,
            prompt: ``,
        };
        setDataSource([...dataSource, newData]);

    };

    const handleSave = (row) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        setDataSource(newData);
    };

    const columns = defaultColumns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: DataType) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave,
            }),
        };
    });

    const onDragEnd = ({ active, over }: DragEndEvent) => {
        if (active.id !== over?.id) {
            setDataSource((previous) => {
                const activeIndex = previous.findIndex((i) => i.key === active.id);
                const overIndex = previous.findIndex((i) => i.key === over?.id);
                return arrayMove(previous, activeIndex, overIndex);
            });
        }
    };

    // const Train = () => {
    //    
    // }

    // const handleChange = (value: string) => {
    //     console.log(`selected ${value}`);
    //     const newData = { ...tableInfo, model: value };
    //     setTableInfo(newData)
    // };

    const showModal = () => {
        if (dataSource.length > 0) {
            setIsModalOpen(true);
        } else {
            message.info('Data is empty')
        }


    };

    const handleOk = () => {
        setIsModalOpen(false);
    };


    const showResultModal = () => {
        setIsResultModalOpen(true);
    };

    const handleResultOk = () => {
        setIsResultModalOpen(false);
    };

    const handleResultCancel = () => {
        setIsResultModalOpen(false);
    };

    const handleCancel = async (isTrain: boolean) => {
        if (isTrain) {
            const newTableInfo = JSON.parse(JSON.stringify(tableInfo))
            newTableInfo.isTrain = true
            setTableInfo(newTableInfo)
            setIsModalOpen(false);
        } else {
            setIsModalOpen(false);
        }
    };




    const addNewTab = async () => {
        const id = await newTuning(`Tuning ${allDataSource.length}`, projectid,)
        await updateActiveTuning(projectid, id)
        await updateTableList()
        return id
    }
    const changeTab = async (newActiveKey: string) => {
        await updateActiveTuning(projectid, newActiveKey)
        const tuning = await getTargetTuning(newActiveKey)

        setTableInfo(tuning)
        setDataSource(tuning.list)
    }

    const removeTab = async (targetKey: string, newActiveKey: string) => {

        if (targetKey != newActiveKey) {
            await changeTab(newActiveKey)
            await deleteTuning(targetKey)
            await updateTableList()
        } else {
            message.info('cannot delete the last')
        }
    }

    const changeTabName = async (newName: string) => {
        await updateTuningDetail(tableInfo.nanoid, { name: newName })
    }

    const saveTab = () => {
        updateTableList()
    }

    const startRetrieveFineTune = async () => {

        const tuning = await getTargetTuning(tableInfo.nanoid)
        if (tuning.trainConfig.ftid) {
            setLoading(true)
            retrieveFTToOpenai(tuning.trainConfig.ftid).then(res => {
                setLoading(false)
                if (res.data) {
                    setTrainResult(res.data)
                    showResultModal()
                    if (res.data.fine_tuned_model) {
                        const newTableInfo = JSON.parse(JSON.stringify(tableInfo))
                        newTableInfo.fine_tuned_model = res.data.fine_tuned_model
                        setTableInfo(newTableInfo)
                    } else {
                        // updateRetrieveFineTune(tableInfo.nanoid, tuning.trainConfig.ftid)
                    }
                } else {
                    message.info('Result not exit')
                }
            })
        } else {
            message.info('Fine Tuning id not exit')
        }
    }

    // const updateRetrieveFineTune = async (tuningid: string, ftid: string) => {
    //     const update = setInterval(() => {
    //         if (tuningid == tableInfo.nanoid) {
    //             setLoading(true)
    //             retrieveFTToOpenai(ftid).then(res => {
    //                 setLoading(false)
    //                 if (res.data) {
    //                     setTrainResult(res.data)
    //                     if (res.data.fine_tuned_model) {
    //                         const newTableInfo = JSON.parse(JSON.stringify(tableInfo))
    //                         newTableInfo.fine_tuned_model = res.data.fine_tuned_model
    //                         setTableInfo(newTableInfo)
    //                         clearInterval(update)
    //                     }
    //                 }
    //             })
    //         } else {
    //             retrieveFTToOpenai(ftid).then(res => {
    //                 if (res.data) {
    //                     setTrainResult(res.data)
    //                     if (res.data.fine_tuned_model) {
    //                         updateTuningDetail(tuningid, { fine_tuned_model: res.data.fine_tuned_model })
    //                         clearInterval(update)
    //                     }
    //                 }
    //             })
    //         }



    //     }, 5000)

    //     setTimeout(() => {
    //         clearInterval(update)
    //     }, 1000 * 60  * 5);
    // }

    return (

        <div className={`componentContainer  ${styles.container}`}>
            <Row>
                {/* <Col className={styles.headerTitle} span={5} > Parameter</Col> */}
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
            <Row justify="space-between">
                <Col >
                    <Button
                        onClick={handleAdd}
                        type="primary"
                        disabled={tableInfo.isTrain}
                    // style={{ marginBottom: 16 }}
                    >
                        Add a row
                    </Button>
                </Col>
                <Col>
                    <Row gutter={16}>
                        <Col>
                            <Button
                                onClick={startRetrieveFineTune}
                                loading={loading}
                                icon={tableInfo.fine_tuned_model ? <CheckCircleFilled style={{ color: "green" }} /> : <CheckCircleOutlined />}
                            // style={{ marginBottom: 16 }}
                            >
                                Training Result
                            </Button>
                        </Col>
                        <Col> <Button
                            onClick={showModal}
                            type="primary"
                            icon={tableInfo.isTrain ? <CheckCircleOutlined /> : ''}
                        // style={{ marginBottom: 16 }}
                        >
                            Train
                        </Button></Col>
                    </Row>

                </Col>
            </Row>
            <br />
            <DndContext onDragEnd={onDragEnd}>
                <SortableContext
                    // rowKey array
                    items={dataSource && dataSource.map((i) => i.key)}
                    strategy={verticalListSortingStrategy}
                >
                    <Table
                        components={!tableInfo.isTrain ? {
                            body: {
                                row: TableRow,
                                cell: EditableCell,
                            },
                        } : undefined}
                        rowKey="key"
                        pagination={false}
                        columns={tableInfo.isTrain ? disableColumns as ColumnTypes : columns as ColumnTypes}
                        rowClassName={() => 'editable-row'}
                        dataSource={dataSource}
                    />
                </SortableContext>
            </DndContext>
            <Modal width={600} destroyOnClose={true} title="Training Settings" footer={null} open={isModalOpen} onOk={handleOk} onCancel={() => { handleCancel(false) }}>
                <Train tableInfo={tableInfo} onCancel={handleCancel}  ></Train>
            </Modal>
            <Modal width={1000} destroyOnClose={true} title="Training Result" open={isResultModalOpen} onOk={handleResultOk} onCancel={handleResultCancel}>
                <TrainResult result={trainResult} ></TrainResult>
            </Modal>
        </div>

    );
};

export default App;
