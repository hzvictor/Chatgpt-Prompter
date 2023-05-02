import { PlusOutlined, MenuOutlined, DeleteOutlined } from '@ant-design/icons';
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
import { Button, Form, Input, Popconfirm, Table, Switch, Row, Col, Tooltip } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { getProjectTestList, newTest, updateTestDetail, updateActiveTest, getTargetTest, deleteTest } from '@/database/prompter/test'
import { fileUploadToOpenai } from '@/services/openai'
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

const App = ({ projectid }: any) => {

    const [loading, setLoading] = useState(false);
    const [tableInfo, setTableInfo] = useState({
        nanoid: '',
        name: 'Test',
        projectid: projectid,
        isSynchronize: false,
        isActive: true,
    })
    const [dataSource, setDataSource] = useState([])
    const [allDataSource, setAllDataSource] = useState([])

    useEffect(() => {
        updateTableList()
    }, [projectid])


    const updateTableList = () => {
        getProjectTestList(projectid).then(res => {
            if (res.all.length == 0) {
                newTest('Test', projectid,).then((id: any) => {
                    setTableInfo({
                        nanoid: id,
                        name: 'Test',
                        projectid: projectid,
                        isSynchronize: false, // 0 1 2
                        isActive: true
                    })

                    setAllDataSource([
                        {
                            nanoid: id,
                            name: 'Test',
                            projectid: projectid,
                            isSynchronize: false,
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
        delete newTableInfo.projectid

        newTableInfo.updateDate = dayjs().valueOf()
        if (tableInfo.nanoid) {
            updateTestDetail(tableInfo.nanoid, { ...newTableInfo, list: dataSource })
        }


    }, [dataSource, tableInfo])



    const defaultColumns: (ColumnTypes[number] & {
        editable?: boolean;
        dataIndex: string;
    })[] = [
            {
                key: 'sort',
                width: '3%',
            },
            {
                title: 'Message',
                dataIndex: 'message',
                width: '96%',
                editable: true,
            },
            {
                title: 'delete',
                width: '3%',
                dataIndex: 'delete',
                align: "center",
                render: (_, record: { key: React.Key }) =>
                    dataSource.length >= 1 ? (
                        <DeleteOutlined onClick={() => handleDelete(record.key)} />
                    ) : null,
            },
        ];


    const handleDelete = (key: React.Key) => {
        const newData = dataSource.filter((item) => item.key !== key);
        setDataSource(newData);
    };

    const handleAdd = () => {
        const newData = {
            key: makeNodeId(),
            message: ``,
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







    const addNewTab = async () => {
        const id = await newTest(`Test ${allDataSource.length}`, projectid)
        await updateActiveTest(projectid, id)
        await updateTableList()
        return id
    }
    const changeTab = async (newActiveKey: string) => {
        await updateActiveTest(projectid, newActiveKey)
        const tuning = await getTargetTest(newActiveKey)

        setTableInfo(tuning)
        setDataSource(tuning.list)
    }

    const removeTab = async (targetKey: string, newActiveKey: string) => {
        if (targetKey != newActiveKey) {
            await changeTab(newActiveKey)
            await deleteTest(targetKey)
            await updateTableList()
        } else {
            message.info('cannot delete the last')
        }
    }

    const changeTabName = async (newName: string) => {
        await updateTestDetail(tableInfo.nanoid, { name: newName })
    }

    const saveTab = () => {
        updateTableList()
    }


    const changeSynchronize = (val:any) =>{
        const newTableInfo = JSON.parse(JSON.stringify(tableInfo))

        newTableInfo.isSynchronize = val
        setTableInfo(newTableInfo)
    }

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
            <Row style={{ marginTop: "-10px", marginBottom: "5px", padding: "0 10px" }} align="middle" justify="space-between">
                <Col >
                    <Button
                        onClick={handleAdd}
                        disabled={tableInfo.isUpload}
                        type="primary"
                        shape="circle"
                        icon={<PlusOutlined />}
                    >
                    </Button>
                </Col>
                <Col>
                    <Row >
                        <Tooltip
                            title="In synchronous mode, it will be tested according to the input order,
Asynchronous mode will send both"
                            color="lime"
                        >
                            <div className={styles.model}>
                                {' '}
                                <span className={styles.modelName}>Synchronize</span>{' '}
                                <Switch
                                    checked={tableInfo.isSynchronize}
                                    onChange={(val)=>{changeSynchronize(val)}}
                                    size="small"
                                ></Switch>
                            </div>
                        </Tooltip>
                    </Row>
                </Col>
            </Row>

            <DndContext onDragEnd={onDragEnd}>
                <SortableContext
                    // rowKey array
                    items={dataSource.map((i) => i.key)}
                    strategy={verticalListSortingStrategy}
                >
                    <Table
                        components={{
                            body: {
                                row: TableRow,
                                cell: EditableCell,
                            },
                        }}
                        rowKey="key"
                        pagination={false}
                        columns={columns as ColumnTypes}
                        rowClassName={() => 'editable-row'}
                        dataSource={dataSource}
                    />
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default App;
