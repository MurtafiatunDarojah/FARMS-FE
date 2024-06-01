import { CCard, CCardBody, CCardHeader } from "@coreui/react"
import { Button, Form, Input, Radio, Select, Switch } from "antd"
import { RollbackOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import Notiflix from "notiflix";

import HeaderFarms from "src/utils/header_farms";
import API from "src/services";

const CreateOperator = () => {

    const session = useSelector((state) => state.session)
    const formRef = useRef(null);

    let navigate = useNavigate()

    const onFinish = (values) => {

        API.CreateOperator(HeaderFarms(session.accessToken), values).then(res => {
            Notiflix.Notify.success('Create Success')
            navigate('/operator/list')
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
                    <Button type="primary" icon={<RollbackOutlined />} onClick={() => navigate('/operator/list')}>Back</Button>
                </div>
            </div>
            <CCard>
                <CCardHeader>New Operator</CCardHeader>
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

export default CreateOperator
