import React, { useContext, useEffect, useRef, useState } from 'react';
import type { InputRef } from 'antd';
import { Button, Form, Input, Popconfirm, Table, Row, Select, Col } from 'antd';
import type { FormInstance } from 'antd/es/form';
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
                <Input style={{ width: '90px', minHeight: '39px' }} ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        ) : (
            <div className="editable-cell-value-wrap" style={{ paddingRight: 24, width: '90px', minHeight: '39px' }} onClick={toggleEdit}>
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
    const [dataSource, setDataSource] = useState([]);
    const [currentuse, setCurrentuse] = useState('')
    const [isUseServer, setIsUseServer] = useState(false)
    const [count, setCount] = useState(2);


    useEffect(()=>{
        const info = JSON.parse(localStorage.getItem('apiKeys'))
        if(info){
            setDataSource(info.dataSource)
            setCurrentuse(info.currentuse)
            setIsUseServer(info.isUseServer)
            setCount(info.count)
        }
    },[])

    useEffect(()=>{
        localStorage.setItem('apiKeys',JSON.stringify({
            dataSource,currentuse,isUseServer,count
        }))
    },[isUseServer,currentuse,dataSource,count])

    const handleDelete = (key: React.Key) => {


        const newData = dataSource.filter((item) => item.key !== key);
        setDataSource(newData)
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
                dataSource.length >= 1 ? (
                    <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
                        <a>Delete</a>
                    </Popconfirm>
                ) : null,
        },
    ];

    const handleAdd = () => {
        const newData: DataType = {
            key: count,
            name: `API Key ${count}`,
            apikey: '',
            remark: ``,
        };
        setDataSource([...dataSource, newData]);
        setCount(count + 1);
        
    };

    const handleSave = (row: DataType) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });

        if(dataSource.length == 1){
            setCurrentuse(item.apikey)
        }
        setDataSource(newData);
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
        setCurrentuse(value)
    };
    const handleChangeServer = (value: boolean) => {
        setIsUseServer(value)
    };

    return (
        <div>
            <span className={styles.modelName}> All your keys will be saved locally, and all requests will be sent from your local to openai.</span>
            <Row align="middle" gutter={16} >
                <Col>Current Use</Col>
                <Col> <Select
                    defaultValue={dataSource[0]?.apikey}
                    value={currentuse}
                    style={{ width: 120 }}
                    onChange={handleChange}
                    options={dataSource.map((item: any) => {
                        return { value: item?.apikey, label: item?.name }
                    })}
                /></Col>
                <Col>Server Forwarding</Col>
                <Col> <Select
                    // defaultValue={false}
                    value={isUseServer}
                    style={{ width: 120 }}
                    onChange={handleChangeServer}
                    options={[{ value: false, label: 'No' }, { value: true, label: 'Yes' }]}
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
                dataSource={dataSource}
                columns={columns as ColumnTypes}
            />
        </div>
    );
};
