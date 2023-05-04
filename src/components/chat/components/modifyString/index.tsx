
import { MenuOutlined, DeleteOutlined } from '@ant-design/icons';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { makeNodeId } from '@/utils/withNodeId';
import modifys from '@/stores/modify';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { InputRef, Select } from 'antd';
import { Button, Form, Input, Popconfirm, Table, Space, Row, Col } from 'antd';
import type { FormInstance } from 'antd/es/form';
import styles from './index.less';
const { TextArea } = Input;
import { updateChatbotDetail } from '@/database/prompter/chatbot'
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

const App = ({ chatbotInfo }: any) => {

  const [dataSource, setDataSource] = useState([
    {
      key: '1',
      prefix: '',
      suffix: '',
    },
    {
      key: '2',
      prefix: 'The prefix will be added in front of the user input as prompt',
      suffix: 'The suffix is also a function of',
    },
  ]);

  const [modify, setModify] = useState({ key: '1', prefix: '', suffix: '' })

  useEffect(() => {
    console.log(dataSource)
    updateChatbotDetail(chatbotInfo.nanoid, { allModify: dataSource })
  }, [dataSource])

  useEffect(() => {
    if (chatbotInfo.allModify) {
      setDataSource(chatbotInfo.allModify)
    }else{
      setDataSource([
        {
          key: '1',
          prefix: '',
          suffix: '',
        },
        {
          key: '2',
          prefix: 'The prefix will be added in front of the user input as prompt',
          suffix: 'The suffix is also a function of',
        },
      ])
    }
    if (chatbotInfo.modify) {
      setModify(chatbotInfo.modify)
    }else{
      setModify( { key: '1', prefix: '', suffix: '' })
     
    }
  }, [chatbotInfo])

  const defaultColumns: (ColumnTypes[number] & {
    editable?: boolean;
    dataIndex: string;
  })[] = [
      {
        key: 'sort',
      },

      {
        title: 'Prefix',
        dataIndex: 'prefix',
        width: '38%',
        editable: true,
      },
      {
        title: 'Suffix',
        width: '38%',
        dataIndex: 'suffix',
        editable: true,
      },
      {
        title: 'delete',
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
      prefix: ``,
      suffix: ``,
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




  const rowSelection = {
    onChange: (selectedRowKeys: any, selectedRows: any) => {
      console.log('selectedRows: ', selectedRows);
      if (selectedRows[0]) {
        updateChatbotDetail(chatbotInfo.nanoid, { modify: selectedRows[0] })
        setModify(selectedRows[0])
      }

    },
  };

  return (
    <>
      <Row justify="space-between">
        <Col>
          <Button
            onClick={handleAdd}
            type="primary"
            style={{ marginBottom: 16 }}
          >
            Add a row
          </Button>
        </Col>
        <Col>
          {/* Select Modify:&nbsp;&nbsp;
          <Select
            value={currentuse}
            style={{ width: 120 }}
            onChange={handleChange}
            options={dataSource.map((item: any) => {
              return { value: item?.apikey, label: item?.name }
            })}
          >

          </Select> */}
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
            rowSelection={{
              type: 'radio',
              selectedRowKeys: [modify.key],
              ...rowSelection,
            }}
            rowKey="key"
            pagination={false}
            columns={columns as ColumnTypes}
            rowClassName={() => 'editable-row'}
            dataSource={dataSource}
          />
        </SortableContext>
      </DndContext>
    </>
  );
};

export default App;
