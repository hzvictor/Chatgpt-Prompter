import { MenuOutlined, DeleteOutlined } from '@ant-design/icons';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TabList from '@/components/bpurecomponents/tabList';
import { CSS } from '@dnd-kit/utilities';
import { makeNodeId } from '@/utils/withNodeId';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { InputRef, message } from 'antd';
import { Button, Form, Input, Popconfirm, Table, Select, Row, Col, Modal } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { getProjectValidationList, newValidation, updateValidationDetail, updateActiveValidation, getTargetValidation, deleteValidation } from '@/database/prompter/validation'
import { fileUploadToOpenai} from '@/services/openai'
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

const App: React.FC = ({ tuningid }: any) => {

    const [loading, setLoading] = useState(false);
    const [tableInfo, setTableInfo] = useState({
        nanoid: '',
        name: 'Validation',
        tuningid: tuningid,
        isUpload: false, // 0 1 2
        isActive: true,
    })
    const [dataSource, setDataSource] = useState([])
    const [allDataSource, setAllDataSource] = useState([])

    useEffect(() => {
        updateTableList()
    }, [tuningid])


    const updateTableList = () => {
        getProjectValidationList(tuningid).then(res => {
            if (res.all.length == 0) {
                newValidation('Validation', tuningid,).then((id: any) => {
                    setTableInfo({
                        nanoid: id,
                        name: 'Validation',
                        tuningid: tuningid,
                        isUpload: false, // 0 1 2
                        isActive: true
                    })

                    setAllDataSource([
                        {
                            nanoid: id,
                            name: 'Validation',
                            tuningid: tuningid,
                            isUpload: false,
                            isActive: true
                        }
                    ])
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
        delete newTableInfo.tuningid

        newTableInfo.updateDate = dayjs().valueOf()
        if (tableInfo.nanoid) {
            updateValidationDetail(tableInfo.nanoid, { ...newTableInfo, list: dataSource })
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
                        <DeleteOutlined onClick={() => handleDelete(record.key)} />
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

    const Upload = () => {
        if (dataSource.length > 0) {
            setLoading(true)
            fileUploadToOpenai(dataSource.map((item: any) => ({ completion: item.completion, prompt: item.prompt }))).then(res => {
                updateValidationDetail(tableInfo.nanoid, { fileid: res.id, isUpload:true })
                const newTableInfo = JSON.parse(JSON.stringify(tableInfo))
                newTableInfo.fileid = res.id 
                newTableInfo.isUpload = true
                setTableInfo(newTableInfo)
                setLoading(false)
            })

        } else {
            message.info('Data is empty')
        }
    }





    const addNewTab = async () => {
        const id = await newValidation(`Validation ${allDataSource.length}`, tuningid)
        await updateActiveValidation(tuningid, id)
        await updateTableList()
        return id
    }
    const changeTab = async (newActiveKey: string) => {
        await updateActiveValidation(tuningid, newActiveKey)
        const tuning = await getTargetValidation(newActiveKey)

        setTableInfo(tuning)
        setDataSource(tuning.list)
    }

    const removeTab = async (targetKey: string, newActiveKey: string) => {
        if (targetKey != newActiveKey) {
            await changeTab(newActiveKey)
            await deleteValidation(targetKey)
            await updateTableList()
        } else {
            message.info('cannot delete the last')
        }
    }

    const changeTabName = async (newName: string) => {
        await updateValidationDetail(tableInfo.nanoid, { name: newName })
    }

    const saveTab = () => {
        updateTableList()
    }

    return (
        <div>
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
                        disabled={tableInfo.isUpload}
                        type="primary"
                    // style={{ marginBottom: 16 }}
                    >
                        Add a row
                    </Button>
                </Col>
                <Col>
                    <Row gutter={16}>
                        <Col> <Button
                            onClick={Upload}
                            loading={loading}
                            disabled={tableInfo.isUpload}
                            type="primary"
                        // style={{ marginBottom: 16 }}
                        >
                            {tableInfo.isUpload?'Upload Success': 'Upload'}
                        </Button></Col>
                    </Row>

                </Col>
            </Row>
            <br />
            <DndContext onDragEnd={onDragEnd}>
                <SortableContext
                    // rowKey array
                    items={dataSource.map((i) => i.key)}
                    strategy={verticalListSortingStrategy}
                >
                    <Table
                        components={ !tableInfo.isUpload ? {
                            body: {
                                row: TableRow,
                                cell: EditableCell,
                            },
                        }: undefined}
                        rowKey="key"
                        pagination={false}
                        columns={tableInfo.isUpload ?  disableColumns as ColumnTypes :  columns as ColumnTypes}
                        rowClassName={() => 'editable-row'}
                        dataSource={dataSource}
                    />
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default App;
