import React, { useState, useRef, useEffect } from 'react';
import { Card, Avatar, Rate, Space, Row, Col, Skeleton, Tooltip } from 'antd';
import {
  HeartOutlined,
  ShareAltOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useIntl } from 'umi';
import './index.less';

interface PluginCardProps {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  rating: number;
  collectionCount: number;
  supportCount: number;
  downloadCount: number;
  category: string;
  updateDate: string;
  publisherName: string;
  publisherAvatarUrl: string;
  loading: boolean;
}

const PluginCard: React.FC<PluginCardProps> = ({
  imageUrl,
  title,
  description,
  rating,
  collectionCount,
  supportCount,
  downloadCount,
  category,
  updateDate,
  publisherName,
  publisherAvatarUrl,
  loading,
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  const handleMouseEnter = () => {
    if (
      descriptionRef.current &&
      descriptionRef.current.scrollWidth > descriptionRef.current.clientWidth
    ) {
      setShowPopover(true);
    }
  };
  const [isXsScreen, setIsXsScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsXsScreen(window.innerWidth < 576);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseLeave = () => {
    setShowPopover(false);
  };

  const intl = useIntl();
  return (
    <Card
      className="card-container"
      style={{
        borderRadius: '10px',
        width: '100%',
      }}
    >
      <Row style={{ display: 'flex' }}>
        <Col xs={24} sm={9} md={9} style={{ position: 'relative' }}>
          {loading ? (
            <div
              style={{
                width: isXsScreen ? '175px' : 'auto',
                height: isXsScreen ? '175px' : 'auto',
              }}
            >
              <Skeleton.Image
                style={{
                  borderRadius: '10px',
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
                active
              />
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={title}
              style={{ borderRadius: '10px', width: '100%' }}
            />
          )}
        </Col>

        <Col
          xs={24}
          sm={15}
          md={15}
          style={{
            paddingLeft: isXsScreen ? '0' : '1.5rem',
            paddingTop: isXsScreen ? '1.5rem' : '0',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Skeleton
            title={{ width: '40%' }}
            paragraph={{ rows: 1, width: '100%' }}
            loading={loading}
            active
          >
            <h3>{title}</h3>
            <Tooltip
              placement="topLeft"
              title={<div>{description}</div>}
              trigger="hover"
              open={showPopover}
              showArrow={true}
              arrowPointAtCenter={true}
            >
              <p
                ref={descriptionRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                  lineHeight: '1.0',
                  maxHeight: '1.5em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: '0.3em',
                }}
              >
                {description}
              </p>
            </Tooltip>
          </Skeleton>

          <Skeleton
            title={{ width: '40%' }}
            paragraph={{ rows: 4, width: ['30%', '50%', '40%', '60%'] }}
            loading={loading}
            active
          >
            <Space style={{ marginTop: '0rem' }}>
              <Rate disabled allowHalf value={rating} />
              <span style={{ lineHeight: '0', marginLeft: '-0rem' }}>
                {rating}
              </span>
            </Space>

            <p style={{ marginTop: '0.5rem' }}>
              {intl.formatMessage({
                id: 'card_category',
              })}
              :&nbsp;{category}
            </p>

            <p>
              {intl.formatMessage({
                id: 'card_updatedate',
              })}
              :&nbsp;
              {updateDate}
            </p>
            <p>
              {intl.formatMessage({
                id: 'card_developer',
              })}
              :&nbsp;
              <Space>
                <Avatar src={publisherAvatarUrl} />
                <span>{publisherName}</span>
              </Space>
            </p>
            <Space>
              <HeartOutlined /> {collectionCount}
              <ShareAltOutlined /> {supportCount}
              <DownloadOutlined /> {downloadCount}
            </Space>
          </Skeleton>
        </Col>
      </Row>
    </Card>
  );
};

export default PluginCard;
