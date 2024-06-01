import { CCard, CCardBody, CCardHeader } from "@coreui/react"
import { Button, Form, Input, Radio, Select, Switch } from "antd"
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import Notiflix, { Report } from "notiflix";

import { RollbackOutlined } from '@ant-design/icons';
import HeaderFarms from "src/utils/header_farms";
import API from "src/services";

const ViewJobLocation = () => {

    const session = useSelector((state) => state.session)
    const formRef = useRef(null);

    const dispatch = useDispatch()
    let navigate = useNavigate()
    let { id } = useParams();

    const onFinish = (values) => {
        values._id = id
        API.UpdateJobLocation(HeaderFarms(session.accessToken), values).then(res => {
            Notiflix.Notify.success('Updated Success')
            navigate('/job-location/list')
        }).catch(err => {
            console.error(err)
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

    const viewJobLocation = () => {
        API.GetJobLocation(HeaderFarms(session.accessToken), id).then(res => {
            formRef.current.setFieldsValue(res.data);
        }).catch(err => {
            if (err.response.status === 401) {
                dispatch({ type: 'set', session: null })
                navigate('/login')
            } else if (err.response.status === 403) {
                navigate('/')
                Report.warning(
                    "Oops.. anda tidak berhak masuk ke halaman",
                    err.message,
                    "Okay"
                );
            } else {
                Report.warning(
                    "Oops.. something wrong",
                    err.message,
                    "Okay"
                );
            }
        })
    }

    useEffect(() => {
        if (!session) {
            navigate('/login')
        } else {
            viewJobLocation()
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
                <CCardHeader>View Operator</CCardHeader>
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
                            rules={[{ required: true, message: 'Please input Unit!' }]}
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

export default ViewJobLocation
