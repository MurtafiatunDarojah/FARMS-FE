import { CCard, CCardBody, CCardHeader } from "@coreui/react"
import { Alert, Button, Form, Input, Radio, Select, Switch } from "antd"
import { RollbackOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import Notiflix from "notiflix";

import HeaderFarms from "src/utils/header_farms";
import API from "src/services";

const CreateEquipmentActivity = () => {

    const session = useSelector((state) => state.session)
    const formRef = useRef(null);

    let navigate = useNavigate()

    const onFinish = (values) => {

        API.CreateEquipmentActivity(HeaderFarms(session.accessToken), values).then(res => {
            Notiflix.Notify.success('Create Success')
            navigate('/equipment-activity/list')
        }).catch(err => {
            if (err.response.status === 400) {
                err.response.data.error.forEach(item => {
                    Notiflix.Notify.failure(item.name)
                })
            } else {
                err.response.data.error.forEach(item => {
                    Notiflix.Notify.failure(item.name)
                })
            }
        })
    };

    useEffect(() => {
        if (!session) {
            navigate('/login')
        }
    }, [])

    return (
        <>
            <div className="row mb-3">
                <div className="col-md-1">
                    <Button type="primary" icon={<RollbackOutlined />} onClick={() => navigate('/equipment-activity/list')}>Back</Button>
                </div>
            </div>
            <CCard>
                <CCardHeader>New Activity Equipment</CCardHeader>
                <CCardBody>
                    <Form
                        name="basic"
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 8 }}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        autoComplete="off"
                        ref={formRef}
                    >
                        <Alert showIcon type="warning" className="mb-3" message="Mohon di sesuaikan dengan data Segment EPICOR"></Alert>
                        <Form.Item
                            label="ID Activitas"
                            name="segment_code"
                            rules={[{ required: true, message: 'Please input ID Activitas!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Nama Aktifitas"
                            name="segment_name"
                            rules={[{ required: true, message: 'Please input Nama Aktifitas!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type="primary" htmlType="submit">
                                Save
                            </Button>
                        </Form.Item>
                    </Form>
                </CCardBody>
            </CCard>
        </>
    )

}

export default CreateEquipmentActivity
