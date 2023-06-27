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
import { InputRef, Space, message } from 'antd';
import { Button, Form, Input, Popconfirm, Table, Select, Row, Col, Tooltip } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { getProjectPromptList, newPrompt, updatePromptDetail, updateActivePrompt, getTargetPrompt, deletePrompt } from '@/database/prompter/prompt'
import { getProjectSlidelistList } from '@/database/prompter/slidelist'
import { chatToOpenaiServer } from '@/services/openai'
import { SearchOutlined } from '@ant-design/icons';

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
                    autoSize={true}
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


const initDataSourece = [
    {
        key: makeNodeId(),
        role: 'system',
        name: '',
        state: '',
        function_call: '',
        remake: '',
        message: ``,
    },
    {
        key: makeNodeId(),
        role: 'user',
        name: '',
        function_call: '',
        state: '',
        remake: '',
        message: ``,
    },
    {
        key: makeNodeId(),
        role: 'assistant',
        name: '',
        function_call: '',
        state: '',
        remake: '',
        message: ``,
    },
]

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

    const [tableInfo, setTableInfo] = useState({
        nanoid: '',
        name: 'Prompt',
        projectid: projectid,
        isSynchronize: false,
        isActive: true,
    })
    const [dataSource, setDataSource] = useState([

    ])
    const [allDataSource, setAllDataSource] = useState([])

    useEffect(() => {
        updateTableList()
    }, [projectid])


    const updateTableList = () => {
        getProjectPromptList(projectid).then(res => {
            if (res.all.length == 0) {
                newPrompt('Prompt', projectid,).then((id: any) => {
                    setTableInfo({
                        nanoid: id,
                        name: 'Prompt',
                        projectid: projectid,
                        isSynchronize: false, // 0 1 2
                        isActive: true
                    })

                    setAllDataSource([
                        {
                            nanoid: id,
                            name: 'Prompt',
                            projectid: projectid,
                            isSynchronize: false,
                            isActive: true
                        }
                    ])
                })

                setDataSource(initDataSourece)

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
            updatePromptDetail(tableInfo.nanoid, { ...newTableInfo, list: dataSource })
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
                title: 'Role',
                dataIndex: 'role',
                width: '10%',
                render: (_, record: { key: React.Key }) => {
                    return <Space size="small">
                        <Select
                            value={_}
                            bordered={false}
                            style={{ width: 110 }}
                            onChange={(value) => { changeValue(value, record) }}
                            options={[{ value: 'user', label: 'User' },
                            { value: 'assistant', label: 'Assistant' },
                            { value: 'system', label: 'System' }]}
                        />

                    </Space>
                }
            },
            {
                title: 'Message',
                dataIndex: 'message',
                width: '80%',
                editable: true,
                render: (_, record: any) => {


                    // return <Space>{record.role == 'assistant' && _ == '' && <Button onClick={(event) => { genrateContent(event, record) }} type="primary"  > {record.state} Generate </Button>}{_}</Space>
                    return <Space>{record.role == 'assistant' && _ == '' && <Button loading={record.state == 'loading'} onClick={(event) => { genrateContent(event, record) }} type="primary"  > {record.state} Generate </Button>}{_}</Space>
                }
            },
            {
                title: 'Name',
                dataIndex: 'name',
                width: '10%',
                editable: true,
            },
            {
                title: 'Remark',
                dataIndex: 'remark',
                width: '10%',
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

    const genrateContent = async (event: any, recode: any) => {
        event.stopPropagation();

        const slidelist = await getProjectSlidelistList(projectid)
        if (!slidelist.active) {
            message.info("parameter not exist")
            return
        }
        const parameter = slidelist.active.config

        if (parameter.model == "gpt-3.5-turbo") {
            message.error("gpt-3.5-turbo cant use function")
            return
        }

        const targeIndex = dataSource.findIndex((item: any) => item.key == recode.key)
        const messages = dataSource.map((item: any) => { return { role: item.role, content: item.message } })
        const newDataSource = JSON.parse(JSON.stringify(dataSource))
        newDataSource[targeIndex].state = 'loading'
        setDataSource(newDataSource)

        if (!parameter.function_call) {
            delete parameter.function_call
        }
        if (parameter.functions.length == 0) {
            delete parameter.functions
        } else {
            parameter.functions = parameter.functions.map((item: any) => {

                const required = item.parameters.map((parameter: any) => parameter.name)

                const properties = {} as any
                item.parameters.forEach((parameter: any) => {
                    if (parameter.enum) {
                        properties[parameter.name] = {
                            type: parameter.type,
                            description: parameter.description,
                            enum: parameter.enum,
                        }
                    } else {
                        properties[parameter.name] = {
                            type: parameter.type,
                            description: parameter.description,
                        }
                    }


                })

                return {
                    "name": item.name,
                    "description": item.description,
                    "parameters": {
                        "type": "object",
                        "properties": properties,
                        "required": required,
                    },
                }

            })
        }


        chatToOpenaiServer({
            "messages": messages,
            ...parameter
        }).then((res) => {
            if (res) {
                const newDataSource = JSON.parse(JSON.stringify(dataSource))
                if(res.data.message.content){
                    newDataSource[targeIndex].message = res.data.message.content
                }else{
                    newDataSource[targeIndex].message = JSON.stringify(res.data.message.function_call)
                }
                
                newDataSource[targeIndex].state = 'done'
                setDataSource(newDataSource)
            }
        })
        // console.log(record, 1111111)
    }

    const handleDelete = (key: React.Key) => {
        const newData = dataSource.filter((item) => item.key !== key);
        setDataSource(newData);
    };

    const changeValue = (value: any, recode: any) => {
        const targeIndex = dataSource.findIndex((item: any) => item.key == recode.key)

        console.log(targeIndex, 11111)

        const newDataSource = JSON.parse(JSON.stringify(dataSource))
        newDataSource[targeIndex].role = value
        setDataSource(newDataSource)
    }

    const handleAdd = () => {
        let role = dataSource[dataSource.length - 1].role
        if (role == 'user') {
            role = 'assistant'
        } else if (role == 'assistant') {
            role = 'user'
        } else {
            role = 'user'
        }



        const newData = {
            key: makeNodeId(),
            role: role,
            name: '',
            function_call: '',
            state: '',
            remake: '',
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
        const id = await newPrompt(`Prompt ${allDataSource.length}`, projectid)
        await updateActivePrompt(projectid, id)
        await updateTableList()
        return id
    }
    const changeTab = async (newActiveKey: string) => {
        await updateActivePrompt(projectid, newActiveKey)
        const tuning = await getTargetPrompt(newActiveKey)

        setTableInfo(tuning)
        setDataSource(tuning.list)
    }

    const removeTab = async (targetKey: string, newActiveKey: string) => {
        if (targetKey != newActiveKey) {
            await changeTab(newActiveKey)
            await deletePrompt(targetKey)
            await updateTableList()
        } else {
            message.info('cannot delete the last')
        }
    }

    const changeTabName = async (newName: string) => {
        await updatePromptDetail(tableInfo.nanoid, { name: newName })
    }

    const saveTab = () => {
        updateTableList()
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
            <Row style={{ marginBottom: "5px", padding: "0 10px" }} >
                <Col >
                    <Button
                        onClick={handleAdd}
                        disabled={tableInfo.isUpload}
                        type="primary"
                    >
                        ADD
                    </Button>
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
