import styles from './index.less';
import { Button, Spin, Card, Input, Pagination, Row, Col, Popconfirm } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  DislikeOutlined,
  LikeOutlined,
} from '@ant-design/icons';
import Avatar from 'react-avatar';
import { useEffect, useState } from 'react';
import Jazzicon from 'react-jazzicon';
const { Meta } = Card;
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { messageFunction } from '@/stores/globalFunction';
import { getCommunityChatbot, searchCommunityChatbot, addChatbotPoints, mineChatbotPoints } from '@/services/bots'
const { Search } = Input;
dayjs.extend(relativeTime);
export default ({

}: any) => {
  const messageApi = messageFunction.messageApi;
  const [isBottom, setIsBottom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const [list, setList] = useState([]);

  useEffect(() => {
    setLoading(true)
    getCommunityChatbot(1).then(res => {
      setList(res.data)
      setPagination(res.meta.pagination)
      setLoading(false)
    })
  }, []);


  // useEffect(() => {
  //   const handleScroll = () => {
  //     const elem = document.getElementById('my-scrollable-div');
  //     if (!elem) return; // 如果找不到该div，则不进行任何操作

  //     const scrollTop = elem.scrollTop;
  //     const scrollHeight = elem.scrollHeight;
  //     const clientHeight = elem.clientHeight;
  //     const isBottom = scrollTop + clientHeight >= scrollHeight;

  //     console.log(isBottom,111111)
  //   };
  //   window.addEventListener('scroll', handleScroll);
  //   return () => {
  //     window.removeEventListener('scroll', handleScroll);
  //   };
  // }, []);

  function add(bot: any) {
    const newList = list.concat([])
    const targetIndex = newList.findIndex((item: any) => item.id == bot.id)
    newList[targetIndex].attributes.ponits = newList[targetIndex].attributes.ponits + 1
    addChatbotPoints(bot.id)
    setList(newList)
  }

  function mine(bot: any) {
    const newList = list.concat([])
    const targetIndex = newList.findIndex((item: any) => item.id == bot.id)
    newList[targetIndex].attributes.ponits = newList[targetIndex].attributes.ponits - 1
    mineChatbotPoints(bot.id)
    setList(newList)
  }

  function textToDecimal(text: string) {
    let decimal = '';
    // Step 1: 截取前五个字符
    let substring = text.substring(0, 5);
    for (let i = 0; i < substring.length; i++) {
      // Step 2
      let charCode = substring.charCodeAt(i);
      // Step 3
      let charDecimal = charCode.toString(10);
      // Step 4
      decimal += charDecimal;
    }
    return parseInt(decimal);
  }

  const openNewPage = (item: any) => {
    window.open(`${window.location.origin}/chat/${item.attributes.projectid}`, '_blank');
  }

  const onSearch = (value: string) => {
    setLoading(true)
    searchCommunityChatbot(value).then(res => {
      setList(res.data)
      setLoading(false)
    })
  };

  const onChange = (page: any) => {
    getCommunityChatbot(page).then(res => {
      setList(res.data)
      setPagination(res.meta.pagination)
    })
  };

  return (
    <div className={styles.container} id="my-scrollable-div">
      <Row justify="center" ><Col span={18}><Search size="large" placeholder="input search text" loading={loading} onSearch={onSearch} enterButton /></Col></Row>
      <br />
      {loading ? <div className={styles.containerSpin} >
        <Spin size="large" />
      </div> : <div>
        <div className={styles.containerFlex}>
          {list?.map((item: any, index) => {
            return (
              <Card
                hoverable
                style={{ width: 300, marginTop: '30px', marginLeft: '30px' }}
                key={index}
                // cover={
                //   <div className={styles.cover}>
                //     <Jazzicon
                //       diameter={300}
                //       paperStyles={{ marginTop: '-55px' }}
                //       seed={textToDecimal(item.attributes.projectid)}
                //     />
                //   </div>
                // }
                actions={[
                  <Button onClick={() => { openNewPage(item) }} > Try </Button>,
                  <div style={{ cursor: 'pointer' }} onClick={() => { add(item) }} ><LikeOutlined />({item.attributes.ponits})</div>,
                  <DislikeOutlined style={{ cursor: 'pointer' }} onClick={() => { mine(item) }} />
                ]}
              >
                <Meta
                  avatar={
                    item.attributes.config?.avatar == '' ? <Avatar name={item.attributes.config?.name} size="39" round={true} /> : <Avatar size="39" round={true} src={item.attributes.config?.avatar} />
                  }
                  title={item.attributes.config?.name}
                  description={
                    <>
                      <div>{item.attributes.config?.describe ? item.attributes.config?.describe : '...'}</div>
                      <div>{dayjs(item.attributes.createdAt).format('YY-MM HH:mm')}</div>
                    </>
                  }
                />
              </Card>
            );
          })}
        </div>
        <div className={styles.pagination} >
          <Pagination current={pagination.page} onChange={onChange} total={pagination.total} pageSize={16} />
        </div>
      </div>}


    </div>
  );
};
// .fromNow()
