import { CCard, CCardBody, CCardHeader } from "@coreui/react"
import { Button, Form, Input, Radio, Select, Switch } from "antd"
import { RollbackOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import Notiflix from "notiflix";

import HeaderFarms from "src/utils/header_farms";
import API from "src/services";

const CreateJobLocation = () => {

    const session = useSelector((state) => state.session)
    const formRef = useRef(null);

    let navigate = useNavigate()

    const onFinish = (values) => {

        API.CreateJobLocation(HeaderFarms(session.accessToken), values).then(res => {
            Notiflix.Notify.success('Create Success')
            navigate('/job-location/list')
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
                    <Button type="primary" icon={<RollbackOutlined />} onClick={() => navigate('/job-location/list')}>Back</Button>
                </div>
            </div>
            <CCard>
                <CCardHeader>New Job Location</CCardHeader>
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
                            label="Location"
                            name="location"
                            rules={[{ required: true, message: 'Please input Location!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Unit"
                            name="company_code"
                            rules={[{ required: false, message: 'Please input Unit!' }]}
                        >
                            <Select>
                                <Option value="CPM">CPM</Option>
                                <Option value="LMR">LMR</Option>
                                <Option value="SHS">SHS</Option>
                                <Option value="GMI">GMI</Option>
                            </Select>
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

export default CreateJobLocation
