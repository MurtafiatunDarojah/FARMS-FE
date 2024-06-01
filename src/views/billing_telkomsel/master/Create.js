import { CCard, CCardBody, CCardHeader } from "@coreui/react"
import { Button, Form, Input, Radio, Switch } from "antd"
import { RollbackOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import Notiflix from "notiflix";

import HeaderFarms from "src/utils/header_farms";
import API from "src/services";

const CreateMaster = () => {

    const session = useSelector((state) => state.session)
    const formRef = useRef(null);

    let navigate = useNavigate()

    const onFinish = (values) => {

        API.CreateMasterBillingTelkomsel(HeaderFarms(session.accessToken), values).then(res => {
            Notiflix.Notify.success('Create Success')
            navigate('/billing-telkomsel/master')
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
                    <Button type="primary" icon={<RollbackOutlined />} onClick={() => navigate('/billing-telkomsel/master')}>Back</Button>
                </div>
            </div>
            <CCard>
                <CCardHeader>View User</CCardHeader>
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
                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[{ required: true, message: 'Please input name!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Telp"
                            name="telp"
                            rules={[{ required: true, message: 'Please input telp!' }]}
                        >
                            <Input placeholder="Example : 628119492324" />
                        </Form.Item>
                        <Form.Item
                            label="Provider"
                            name="provider"
                            rules={[{ required: true, message: 'Please input provider!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item required label="Bussiness Entity" name="business_entity">
                            <Radio.Group defaultValue={"BRM"}>
                                <Radio.Button value="BRM">BRM</Radio.Button>
                                <Radio.Button value="CPM">CPM</Radio.Button>
                                <Radio.Button value="GM">GM</Radio.Button>
                                <Radio.Button value="SHS">SHS</Radio.Button>
                                <Radio.Button value="DPM">DPM</Radio.Button>
                                <Radio.Button value="LMR">LMR</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item name="remarks" label="Remarks">
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item name="active" label="Active" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </CCardBody>
            </CCard>
        </>
    )

}

export default CreateMaster
