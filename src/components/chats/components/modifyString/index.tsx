import { MenuOutlined } from '@ant-design/icons';
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
import type { InputRef } from 'antd';
import { Button, Form, Input, Popconfirm, Table, Space, Row, Col } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { useSnapshot } from 'valtio';
import styles from './index.less';
const { TextArea } = Input;
const { modifyState } = modifys;
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
    } catch (errInfo) {}
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

const App: React.FC = () => {
  const dataSource = useSnapshot(modifyState.list);
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
      title: 'operation',
      dataIndex: 'operation',
      render: (_, record: { key: React.Key }) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            title="Sure to delete?"
            onConfirm={() => handleDelete(record.key)}
          >
            <a onMouseDown={(e) => e.stopPropagation()}>Delete</a>
          </Popconfirm>
        ) : null,
    },
  ];

  const handleDelete = (key: React.Key) => {
    const deletItemIndex = dataSource.findIndex((item) => item.key == key);
    modifyState.list.splice(deletItemIndex, 1);
  };

  const handleAdd = () => {
    const newData = {
      key: makeNodeId(),
      prefix: `call me `,
      suffix: `说中文`,
    };
    modifyState.list.push(newData);
  };

  const handleSave = (row) => {
    const index = dataSource.findIndex((item) => row.key === item.key);

    modifyState.list.splice(index, 1, { ...row });
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
      const activeIndex = dataSource.findIndex((i) => i.key === active.id);
      const overIndex = dataSource.findIndex((i) => i.key === over?.id);
      modifyState.list.splice(
        0,
        modifyState.list.length,
        ...arrayMove(dataSource, activeIndex, overIndex),
      );
    }
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
          <span style={{ color: 'rgba(0,0,0,.6)' }}>
            {' '}
            Only the first line of modifiers will take effect{' '}
          </span>
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
    </>
  );
};

export default App;
