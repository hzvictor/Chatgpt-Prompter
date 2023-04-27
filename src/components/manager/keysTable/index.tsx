import React, { useContext, useEffect, useRef, useState } from 'react';
import type { InputRef } from 'antd';
import { Button, Form, Input, Popconfirm, Table, Row, Select,Col } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { apikeysState } from '@/stores/apikeys';
import { useSnapshot } from 'valtio';
import styles from './index.less'
const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface Item {
    key: string;
    name: string;
    age: string;
    address: string;
}

interface EditableRowProps {
    index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

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
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{ margin: 0 }}
                name={dataIndex}
                rules={[
                    {
                        required: true,
                        message: `${title} is required.`,
                    },
                ]}
            >
                <Input  style={{width:'90px',minHeight:'39px'}} ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        ) : (
            <div className="editable-cell-value-wrap"  style={{ paddingRight: 24,width:'90px',minHeight:'39px' }} onClick={toggleEdit}>
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];

interface DataType {
    key: React.Key;
    name: string;
    apikey: string;
    remark: string;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

export default () => {
    // const [dataSource, setDataSource] = useState<DataType[]>([
    //     {
    //         key: '0',
    //         name: 'Test',
    //         apikey: 'TTTTTTTTTTTTTT',
    //         remark: '',
    //     },
    // ]);

    const dataSource = useSnapshot(apikeysState)
    const [count, setCount] = useState(2);

    const handleDelete = (key: React.Key) => {
        const newData = dataSource.keys.filter((item) => item.key !== key);
        apikeysState.keys.splice(0,apikeysState.keys.length,...newData)
    };

    const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
        {
            title: 'name',
            dataIndex: 'name',
            width: '30%',
            editable: true,
        },
        {
            title: 'API key',
            width: '30%',
            dataIndex: 'apikey',
            editable: true,
        },
        {
            title: 'Remark',
            width: '30%',
            dataIndex: 'remark',
            editable: true,
        },
        {
            title: 'operation',
            dataIndex: 'operation',
            render: (_, record: { key: React.Key }) =>
                dataSource.keys.length >= 1 ? (
                    <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
                        <a>Delete</a>
                    </Popconfirm>
                ) : null,
        },
    ];

    const handleAdd = () => {
        const newData: DataType = {
            key: count,
            name: ``,
            apikey: '',
            remark: ``,
        };
        // setDataSource([...dataSource, newData]);
        apikeysState.keys.push(newData)
        setCount(count + 1);
    };

    const handleSave = (row: DataType) => {
        const newData = [...dataSource.keys];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        apikeysState.keys.splice(0,apikeysState.keys.length,...newData)
    };

    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
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

    const handleChange = (value: string) => {
        apikeysState.currentuse = value
    };
    const handleChangeServer = (value: boolean) => {
        console.log()
        apikeysState.isUseServer = value
    };

    return (
        <div>
            <span className={styles.modelName}> All your keys will be saved locally, and all requests will be sent from your local to openai.</span>
            <Row align="middle" gutter={16} >
                <Col>Current Use</Col>
                <Col> <Select
                    defaultValue={dataSource.keys[0]?.apikey}
                    value={dataSource.currentuse}
                    style={{ width: 120 }}
                    onChange={handleChange}
                    options={dataSource.keys.map((item:any)=>{
                        return  { value: item?.apikey, label: item?.name }
                    })}
                /></Col>
                <Col>Server Forwarding</Col>
                <Col> <Select
                    // defaultValue={false}
                    value={dataSource.isUseServer}
                    style={{ width: 120 }}
                    onChange={handleChangeServer}
                    options={[ { value: false, label: 'No' }, { value: true,label: 'Yes'}]}
                /></Col>
            </Row>
            <br />
            <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
                Add a row
            </Button>
            <Table
                components={components}
                rowClassName={() => 'editable-row'}
                bordered
                dataSource={dataSource.keys}
                columns={columns as ColumnTypes}
            />
        </div>
    );
};
