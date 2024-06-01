import { CCard, CCardBody, CCardHeader } from "@coreui/react"
import { Button, Form, Input, Radio, Select, Switch } from "antd"
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import Notiflix from "notiflix";

import { RollbackOutlined } from '@ant-design/icons';
import HeaderFarms from "src/utils/header_farms";
import API from "src/services";

const ViewOperator = () => {

    const session = useSelector((state) => state.session)
    const formRef = useRef(null);

    const dispatch = useDispatch()
    let navigate = useNavigate()
    let { id } = useParams();

    const onFinish = (values) => {
        values._id = id
        API.UpdateOperator(HeaderFarms(session.accessToken), values).then(res => {
            Notiflix.Notify.success('Updated Success')
            navigate('/operator/list')
        }).catch(err => {
            console.error(err)
            if (err.response.status === 400) {
                err.response.error.forEach(item => {
                    Notiflix.Notify.failure(item.name)
                })
            } else {
                err.response.error.forEach(item => {
                    Notiflix.Notify.failure(item.name)
                })
            }
        })
    };

    const viewOperator = () => {
        API.GetOperator(HeaderFarms(session.accessToken), id).then(res => {
            console.log(res.data)
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
            viewOperator()
        }
    }, [])

    return (
        <>
            <div className="row mb-3">
                <div className="col-md-1">
                    <Button type="primary" icon={<RollbackOutlined />} onClick={() => navigate('/operator/list')}>Back</Button>
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
                            label="Employee ID"
                            name="employee_id"
                            rules={[{ required: true, message: 'Please input Employee ID!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="ID Simper"
                            name="company_driver_license"
                            rules={[{ required: false, message: 'Please input ID Simper!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Nama Lengkap"
                            name="fullname"
                            rules={[{ required: true, message: 'Please input Nama Lengkap!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Perusahaan"
                            name="company"
                            rules={[
                                {
                                    required: true,
                                    message: 'Wajib Isi',
                                },
                            ]}
                        >
                            <Select>
                                <Select.Option value="SUMAGUD SAPTA SINA">SUMAGUD SAPTA SINA</Select.Option>
                                <Select.Option value="CITRA PALU MINERALS">CITRA PALU MINERALS</Select.Option>
                                <Select.Option value="MACMAHON MINNING SERVICE">MACMAHON MINNING SERVICE</Select.Option>
                                <Select.Option value="ADIJAYA KARYA MAKMUR">ADIJAYA KARYA MAKMUR</Select.Option>
                                <Select.Option value="PETRAMAS HARJA SEJAHTERA">PETRAMAS HARJA SEJAHTERA</Select.Option>
                                <Select.Option value="PESONA PRIMA UTAMA">PESONA PRIMA UTAMA</Select.Option>
                                <Select.Option value="KOPERASI MOSINGGANI">KOPERASI MOSINGGANI</Select.Option>
                                <Select.Option value="PARTS SENTRA MANDIRI">PARTS SENTRA MANDIRI</Select.Option>
                                <Select.Option value="Other">Lain Lain</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Nomor Handphone"
                            name="phonenumber"
                            rules={[
                                {
                                    required: true,
                                    message: 'Wajib Isi',
                                },
                            ]}
                            normalize={(value) => {
                                // Normalisasi nilai input
                                if (value.startsWith('0')) {
                                    return value.replace(/^0/, '62');
                                }
                                return value;
                            }}
                        >
                            <Input placeholder="Contoh: 081234567890" />
                        </Form.Item>
                        <Form.Item
                            label="Email ( pribadi / kantor )"
                            name="email"
                            rules={[
                                {
                                    required: false,
                                    message: 'Wajib Isi',
                                },
                            ]}
                        >
                            <Input type={"email"} />
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

export default ViewOperator
