import { CCard, CCardBody, CCardHeader } from "@coreui/react"
import { Button, Form, Input, Radio, Switch } from "antd"
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import Notiflix from "notiflix";

import { RollbackOutlined } from '@ant-design/icons';
import HeaderFarms from "src/utils/header_farms";
import API from "src/services";

const ViewMaster = (props) => {

    const session = useSelector((state) => state.session)
    const formRef = useRef(null);

    const dispatch = useDispatch()
    let navigate = useNavigate()
    let { id } = useParams();

    const onFinish = (values) => {

        values._id = id

        API.UpdateMasterBillingTelkomsel(HeaderFarms(session.accessToken), values).then(res => {
            Notiflix.Notify.success('Updated Success')
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

    const viewUser = () => {
        API.ViewMasterBillingTelkomsel(HeaderFarms(session.accessToken), id).then(res => {
            formRef.current.setFieldsValue(res);
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
            viewUser()
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
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Provider"
                            name="provider"
                            rules={[{ required: true, message: 'Please input provider!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item required label="Bussiness Entity" name="business_entity">
                            <Radio.Group>
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
                                Update
                            </Button>
                        </Form.Item>
                    </Form>
                </CCardBody>
            </CCard>
        </>
    )

}

export default ViewMaster
