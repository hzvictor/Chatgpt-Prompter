import React, { useEffect, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { Button, Form, message, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { getUploadKey } from '@/services/uploadFile'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { subscribe, useSnapshot } from 'valtio';
import botStore from '@/stores//bot';
interface OSSDataType {
    dir: string;
    expire: string;
    host: string;
    accessid: string;
    policy: string;
    signature: string;
}

interface AliyunOSSUploadProps {
    value?: UploadFile[];
    onChange?: (fileList: UploadFile[]) => void;
}




const AliyunOSSUpload = ({ value, children }: any) => {
    const [OSSData, setOSSData] = useState<OSSDataType>();
    const [loading, setLoading] = useState(false);

    const shotBotState = useSnapshot(botStore.botState);
    // Mock get OSS api
    // https://help.aliyun.com/document_detail/31988.html

    const init = async () => {
        try {
            const result = await getUploadKey();
            setOSSData(result);
        } catch (error) {
            message.error(error);
        }
    };

    useEffect(() => {
        init();
    }, []);

    const handleChange: UploadProps['onChange'] = (
        info: UploadChangeParam<UploadFile>,
    ) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            setLoading(false);
            botStore.botState.avatar = `${OSSData?.host}/${info.file.url}`;
        }
    };

    // const onRemove = (file: UploadFile) => {
    //     const files = (value || []).filter((v) => v.url !== file.url);

    //     if (onChange) {
    //         onChange(files);
    //     }
    // };

    const getExtraData: UploadProps['data'] = (file) => ({
        key: file.url,
        OSSAccessKeyId: OSSData?.accessid,
        policy: OSSData?.policy,
        Signature: OSSData?.signature,
    });

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

    const uploadProps: UploadProps = {
        name: 'file',
        fileList: value,
        action: OSSData?.host,
        onChange: handleChange,
        // onRemove,
        data: getExtraData,
        beforeUpload,
    };

    const uploadButton = (
        <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );


    return (
        <Upload name="avatar"
            listType="picture-circle"
            className="avatar-uploader"
            showUploadList={false} {...uploadProps}>
            {shotBotState.avatar ? (
                <img
                    src={shotBotState.avatar}
                    alt="avatar"
                    style={{ width: '70%' }}
                />
            ) : (
                uploadButton
            )}
        </Upload>
    );
};



export default AliyunOSSUpload;