import {
  MenuOutlined,
  DeleteOutlined,
  FileAddOutlined,
} from '@ant-design/icons';
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
import logitBiasStore from '@/stores/logitBias';
import TabList from '@/components/apureComponents/tabList';
import slideListsStore from '@/stores/slideLists';
import {
  storeLogitBias,
  getTargetLogitBiasWithFatherid,
  deleteTargetLogitBias,
} from '@/database/logitBias';
import { activeProject } from '@/stores/project';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Button,
  Form,
  InputNumber,
  Input,
  Tooltip,
  Table,
  Space,
  Row,
  Col,
} from 'antd';
import type { FormInstance } from 'antd/es/form';
import { useSnapshot } from 'valtio';
import styles from './index.less';
const { TextArea } = Input;
const { logitBiasState } = logitBiasStore;
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
  const inputRef = useRef(null);
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
        {title == 'Value' ? (
          <InputNumber
            onMouseDown={(e) => e.stopPropagation()}
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
            precision={2}
            step={0.01}
            min={-100.0}
            max={100.0}
          />
        ) : (
          <TextArea
            onMouseDown={(e) => e.stopPropagation()}
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
          />
        )}
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

const App: React.FC = ({logitBiasArray}:any) => {
  const dataSource = logitBiasArray;
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
      title: 'Word',
      dataIndex: 'word',
      width: '45%',
      editable: true,
    },
    {
      title: 'Value',
      width: '45%',
      dataIndex: 'value',
      editable: true,
    }
  ];

  const handleDelete = (e: any, key: React.Key) => {
    e.stopPropagation();
    const deletItemIndex = dataSource.findIndex((item) => item.key == key);
    logitBiasState.logitBiasArray.splice(deletItemIndex, 1);
  };

  const handleAdd = () => {
    const newData = {
      key: makeNodeId(),
      word: ``,
      value: 0.0,
    };
    logitBiasState.logitBiasArray.push(newData);
  };

  const handleSave = (row) => {
    const index = dataSource.findIndex((item) => row.key === item.key);

    logitBiasState.logitBiasArray.splice(index, 1, { ...row });
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        // editable: col.editable,
        // dataIndex: col.dataIndex,
        title: col.title,
        // handleSave,
      }),
    };
  });

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = dataSource.findIndex((i) => i.key === active.id);
      const overIndex = dataSource.findIndex((i) => i.key === over?.id);
      logitBiasState.logitBiasArray.splice(
        0,
        logitBiasState.logitBiasArray.length,
        ...arrayMove(dataSource, activeIndex, overIndex),
      );
    }
  };


  return (
    <div style={{ position: 'relative' }} className={styles.container}>
      <Row>
        <Col className={styles.headerTitle} span={24} > Logit Bias</Col>
      </Row>

      {/* <Button
        onClick={handleAdd}
        type="primary"
        shape="circle"
        style={{ position: 'absolute', top: '50px', left: '10px', zIndex: 100 }}
        icon={<FileAddOutlined />}
      ></Button> */}

      <div style={{ padding: ' 0 5px ' }}>
            <Table
              // components={{
              //   body: {
              //     row: TableRow,
              //     cell: EditableCell,
              //   },
              // }}
              rowKey="key"
              pagination={false}
              columns={columns as ColumnTypes}
              rowClassName={() => 'editable-row'}
              dataSource={dataSource}
            />
      </div>
    </div>
  );
};

export default App;
