import React, { useEffect, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import type { UploadProps } from 'antd';
import { Button, Form, message, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { getUploadKey } from '@/services/uploadFile'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';

interface OSSDataType {
    dir: string;
    expire: string;
    host: string;
    accessid: string;
    policy: string;
    signature: string;
}



const getSrcFromFile = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
    });
};



const AliyunOSSUpload = ({ value, imgUrl, changImg, children }: any) => {
    const [OSSData, setOSSData] = useState<OSSDataType>();
    const [loading, setLoading] = useState(false);
    const [imgUrlPre, setImgUrlPre] = useState('');

    // const shotBotState = useSnapshot(botStore.botState);
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
            changImg(imgUrlPre)
            // botStore.botState.avatar = ;
        }
    };

    // const onRemove = (file: UploadFile) => {
    //     const files = (value || []).filter((v) => v.url !== file.url);

    //     if (onChange) {
    //         onChange(files);
    //     }
    // };

    const getExtraData: UploadProps['data'] = (file) => {
        const suffix = file.name.slice(file.name.lastIndexOf('.'));
        const filename = Date.now() + suffix;
        // @ts-ignore
        file.url = OSSData.dir + filename;
        setImgUrlPre(`${OSSData?.host}/${file.url}`)
        return {
            key: file.url,
            OSSAccessKeyId: OSSData?.accessid,
            policy: OSSData?.policy,
            Signature: OSSData?.signature,
        }
    };

    const beforeUpload: UploadProps['beforeUpload'] = async (file) => {

        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
            return false
        }

        const isLt2M = file.size / 1024 / 1024 < 0.2;

        if (!isLt2M) {
            message.error('Image must smaller than 200kb!');
            return false
        }

        if (!OSSData) return false;

        const expire = Number(OSSData.expire) * 1000;

        if (expire < Date.now()) {
            await init();
        }


        return file;
    };

    const onPreview = async (file: UploadFile) => {
        console.log(file, 111111111)
        const src = file.url || (await getSrcFromFile(file));
        const imgWindow = window.open(src);

        if (imgWindow) {
            const image = new Image();
            image.src = src;
            imgWindow.document.write(image.outerHTML);
        } else {
            window.location.href = src;
        }

    };

    const uploadProps: UploadProps = {
        name: 'file',
        fileList: value,
        action: OSSData?.host,
        onChange: handleChange,
        onPreview: onPreview,
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
        <ImgCrop rotationSlider cropShape="round" >
            <Upload name="avatar"
                listType="picture-circle"
                className="avatar-uploader"
                showUploadList={false} {...uploadProps}>
                {imgUrl != '' ? (
                    <img
                        src={imgUrl}
                        alt="avatar"
                        style={{ width: '70%', borderRadius:"50%" }}
                    />
                ) : (
                    uploadButton
                )}
            </Upload>
        </ImgCrop>
    );
};



export default AliyunOSSUpload;