import styles from './index.less'
import { Input, Row, Col, Select, message, ConfigProvider } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import DragModel from '@/components/apureComponents/dragModel';
import { EditOutlined } from '@ant-design/icons';
import { getUploadKey } from '@/services/uploadFile'

const getBase64 = (img: any, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
};


interface OSSDataType {
    dir: string;
    expire: string;
    host: string;
    accessid: string;
    policy: string;
    signature: string;
}

export default ({ node }: any) => {
    const { fileList } = node.getData()
    const [open, setOpen] = useState(false);
    const [OSSData, setOSSData] = useState<OSSDataType>();

    const init = async () => {
        try {
            const result = await getUploadKey();
            setOSSData(result);
        } catch (error) {
            message.error(error);
        }
    };

    // useEffect(() => {
    //     ;
    // }, []);


    const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 0.2;
        if (!isLt2M) {
            message.error('Image must smaller than 200kb!');
        }

        if (!OSSData) return false;

        const expire = Number(OSSData.expire) * 1000;

        if (expire < Date.now()) {
            await init();
        }

        const suffix = file.name.slice(file.name.lastIndexOf('.'));
        const filename = Date.now() + suffix;
        // @ts-ignore
        file.url = OSSData.dir + filename;

        return file;
    };

    const onChange = (info: any) => {
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            info.fileList[info.fileList.length - 1].url =  `${OSSData?.host}/${info.file.url}`
            node.setData({
                fileList: info.fileList,
            })
        }

    }

    const showModal = () => {
        init()
        setOpen(true);
    };



    const handleOk = (e: React.MouseEvent<HTMLElement>) => {

        setOpen(false);
    };

    const handleCancel = (e: React.MouseEvent<HTMLElement>) => {

        setOpen(false);
    };

    const getExtraData: UploadProps['data'] = (file) => ({
        key: file.url,
        OSSAccessKeyId: OSSData?.accessid,
        policy: OSSData?.policy,
        Signature: OSSData?.signature,
    });

    const uploadProps: UploadProps = {
        // name: 'file',
        // fileList: value,
        action: OSSData?.host,
        onChange: onChange,
        // onRemove,
        data: getExtraData,
        beforeUpload,
    };

    return <div className={styles.nodeContainer} >
        <div className={styles.nodeTitle} >
            Send Picture
        </div>
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#00AA90',
                },
            }}

        >

            <div onClick={showModal} className={styles.matchString}>
                <EditOutlined />
                Upload {fileList.length} picture
            </div>

            <DragModel open={open}
                mask={false}
                destroyOnClose={true}
                onOk={handleOk}
                footer={null}

                title="Send Picture"
                onCancel={handleCancel}>
                <Upload
                    listType="picture"
                    defaultFileList={[...fileList]}
                    className="upload-list-inline"
                    {...uploadProps}
                >
                    <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
            </DragModel>
        </ConfigProvider>
    </div>
}