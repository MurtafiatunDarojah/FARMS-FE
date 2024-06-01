import { CCard, CCardBody, CCardHeader } from "@coreui/react"
import { Button, Form, Input, Radio, Select, Switch } from "antd"
import { RollbackOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import Notiflix from "notiflix";

import HeaderFarms from "src/utils/header_farms";
import API from "src/services";

const CreateEquipment = () => {

    const session = useSelector((state) => state.session)
    const formRef = useRef(null);

    let navigate = useNavigate()

    const onFinish = (values) => {

        API.CreateEquipment(HeaderFarms(session.accessToken), values).then(res => {
            Notiflix.Notify.success('Create Success')
            navigate('/equipment/list')
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
                    <Button type="primary" icon={<RollbackOutlined />} onClick={() => navigate('/equipment/list')}>Back</Button>
                </div>
            </div>
            <CCard>
                <CCardHeader>New Equipment</CCardHeader>
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
                            label="Nomor Lambung"
                            name="identity_number"
                            rules={[{ required: true, message: 'Please input Nomor Lambung!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Nama Alat"
                            name="equipment_name"
                            rules={[{ required: true, message: 'Please input Nama Alat!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Nomor Plat"
                            name="number_plate"
                            rules={[{ required: true, message: 'Please input Nomor Plat!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Kategori"
                            name="category"
                            rules={[{ required: true, message: 'Please select a category!' }]}
                        >
                            <Select placeholder="Select a category">
                                <Select.Option value="Alat Support">Alat Support</Select.Option>
                                <Select.Option value="Drilling">Drilling</Select.Option>
                                <Select.Option value="Alat Berat">Alat Berat</Select.Option>
                                <Select.Option value="Pabrik TPD 4500">Alat Berat</Select.Option>
                                <Select.Option value="Alat angkut material">Alat angkut material</Select.Option>
                                <Select.Option value="Operasional Kantor">Operasional Kantor</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label="Owner"
                            name="equipment_owner"
                            rules={[{ required: true, message: 'Please select a owner!' }]}
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
                            rules={[{ required: false, message: 'Please select a description!' }]}
                            name="description" label="Deskripsi">
                            <Input.TextArea />
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

export default CreateEquipment
