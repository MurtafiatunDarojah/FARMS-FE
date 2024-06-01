import { QRCodeSVG } from 'qrcode.react';
import { Checkbox, Col, Collapse, Form, Input, Row, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import './style.css'

import HeaderFarms from 'src/utils/header_farms';
import { useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom';
import { Report } from 'notiflix';
import API from 'src/services';

function PrintServiceRequest() {

    const { Title } = Typography;
    const { TextArea } = Input;
    const { Panel } = Collapse;

    const [form] = Form.useForm();
    let { id } = useParams();

    const session = useSelector((state) => state.session)

    const [typeRequestExplain, setTypeRequestExplain] = useState(true);
    const [EquipmentDetails, SetEquipmentDetails] = useState(true);
    const [_, setcompleteLoadSR] = useState(false)
    const [justification, setJustification] = useState(true)
    const [applications, setApplications] = useState([]);
    const [all, setAll] = useState(null)

    const [otherChecked, setOtherChecked] = useState(false);
    const [otherAccountChecked, setOtherAccountChecked] = useState(false);


    const getApplications = () => {
        API.ServiceRequestApps(HeaderFarms(session.accessToken), null).then(res => {

            let DTO = []

            res.forEach(i => {
                DTO.push({
                    id: i.app_id,
                    name: i.name
                })
            })

            setApplications(DTO)
        }).catch((err) => {
            console.log(err)
            message.warning('Terjadi Kesalahan saat load data application')
        });
    }

    const getDetailSR = () => {

        API.ServiceRequestView(HeaderFarms(session.accessToken), id).then(((res) => {

            res.data.fullname = res.data.fullname + ' - ' + res.data.nik
            res.data.department = res.data.department && res.data.department
            res.data.company = res.data.uid.company.fullname

            res.data.justification && setJustification(false)
            res.data.equipment_details_explain && SetEquipmentDetails(false)
            res.data.type_request_explain && setTypeRequestExplain(false)
            res.data.system_request_other && setOtherChecked(true)
            res.data.account_request_other && setOtherAccountChecked(true)

            setAll(res.data)

            form.setFieldsValue(res.data);

            setcompleteLoadSR(res.data)

            setTimeout(() => {
                window.print();
            }, 1000)

        })).catch((err) => {
            console.error(err)
            Report.info(
                "Service Request",
                "Sorry, Service Request not founding",
                "Okay"
            );

        })

    }


    useEffect(() => {
        if (!session) {
            Navigate('/login')
        } else {
            getDetailSR()
            getApplications()
        }
    }, [])

    return (<>

        <div className="container">
            <div className="row">
                <div className="col-md-12 text-center mb-2">
                    <Title level={4}>Service Request Form</Title>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12 mb-2">
                    <Title style={{ fontSize: 13 }}>Division : Information Technology</Title>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12 mb-4">
                    <Title style={{ fontSize: 13, fontWeight: "bold" }}>{all && all.form_record}</Title>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12 mb-2">
                    <Form
                        form={form}
                        size='small'
                        name="basic"
                        layout={
                            'vertical'
                        }

                    >
                        <Collapse style={{ marginBottom: -20 }} bordered={false} defaultActiveKey={['1']}>
                            <Panel showArrow={false} header={<b>User Requiring Access</b>} key="1">
                                <Row gutter={20}>
                                    <Col xs={{ span: 10 }}>
                                        <Form.Item className='mb-2'
                                            label="Fullname"
                                            name="fullname"
                                        >
                                            <Input readOnly />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={{ span: 10 }}>
                                        <Form.Item className='mb-2'
                                            label="Business Unit"
                                            name="company"
                                        >
                                            <Input readOnly />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={20}>
                                    <Col xs={{ span: 10 }}>
                                        <Form.Item className='mb-2'
                                            label="Position"
                                            name="position"
                                        >
                                            <Input readOnly />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={{ span: 10 }}>
                                        <Form.Item className='mb-2'
                                            label="NIK"
                                            name="nik"
                                        >
                                            <Input readOnly />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={20}>
                                    <Col xs={{ span: 10 }}>
                                        <Form.Item className='mb-2'
                                            label="Department"
                                            name="department"
                                        >
                                            <Input readOnly />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={{ span: 10 }}>
                                        <Form.Item className='mb-2'
                                            label="Phone"
                                            name="phone_number"
                                        >
                                            <Input readOnly />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={{ span: 10 }}>
                                        <Form.Item
                                            label="Employee Status"
                                            name="employee_status"
                                            rules={[{ required: false, message: 'Please input status' }]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Panel>
                        </Collapse>
                        <Collapse style={{ marginBottom: -20 }} bordered={false} defaultActiveKey={['2']}>
                            <Panel header={<b>Equipment Request</b>} key="2">
                                <Row className='mt-3' gutter={20}>
                                    <Col xs={10}>
                                        <Form.Item
                                            label="Type of Request"
                                            name="type_request"
                                            rules={[
                                                {
                                                    required: false,
                                                    message: 'Please input type request',
                                                },
                                            ]}
                                        >
                                            <Input readOnly />
                                        </Form.Item>
                                        <Form.Item
                                            className='mt-4'
                                            label="Explain"
                                            name="type_request_explain"
                                            hidden={typeRequestExplain}
                                            rules={[
                                                {
                                                    required: !typeRequestExplain,
                                                    message: 'Please input type explain',
                                                },
                                            ]}
                                        >
                                            <TextArea rows={4} readOnly />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={10}>
                                        <Form.Item
                                            label="Equipment"
                                            name="equipment_details"
                                            rules={[
                                                {
                                                    required: false,
                                                    message: 'Please input type request',
                                                },
                                            ]}
                                        >
                                            <TextArea rows={4} readOnly />
                                        </Form.Item>
                                        <Form.Item
                                            className='mt-4'
                                            label="Equipment Other"
                                            name="equipment_details_explain"
                                            hidden={EquipmentDetails}
                                            rules={[
                                                {
                                                    required: false,
                                                    message: 'Please input type explain',
                                                },
                                            ]}
                                        >
                                            <TextArea rows={4} readOnly />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Panel>
                        </Collapse>
                        <Collapse style={{ marginBottom: -20 }} bordered={false} defaultActiveKey={['3']}>
                            <Panel header={<b>System Request</b>} key="3">
                                <Row gutter={10}>
                                    <Col xs={{ span: 10 }}>
                                        <Form.Item
                                            style={{ pointerEvents: "none" }}
                                            className='mt-4'
                                            label={<b>Account</b>}
                                            name="account_request"
                                            rules={[
                                                {
                                                    required: false,
                                                    message: 'Please input account',
                                                },
                                            ]}
                                        >
                                            <Checkbox.Group
                                            >
                                                <Row>
                                                    <Col span={12}>
                                                        <Checkbox value="Email">Email</Checkbox>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Checkbox value="AD / FARMS">AD / FARMS</Checkbox>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Checkbox value="Internet Access">Internet Access</Checkbox>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Checkbox value="PLC">PLC</Checkbox>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Checkbox value="Epicor Account">Epicor Account</Checkbox>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Checkbox value="CCTV">CCTV</Checkbox>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Checkbox value="VPN">VPN</Checkbox>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Checkbox value="Other">Other</Checkbox>
                                                        {otherAccountChecked && (
                                                            <Form.Item
                                                                label={<em style={{ fontSize: 10, marginTop: 10 }}>(Explained)</em>}
                                                                name="account_request_other"
                                                                rules={[
                                                                    {
                                                                        required: true,
                                                                        message: 'Please input account',
                                                                    },
                                                                ]}
                                                            >
                                                                <TextArea
                                                                    rows={2}
                                                                    placeholder="Please input other account"
                                                                />
                                                            </Form.Item>
                                                        )}
                                                    </Col>
                                                </Row>
                                            </Checkbox.Group>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={10}>
                                    <Col xs={{ span: 23 }} sm={{ span: 12 }} xl={{ span: 12 }}>
                                        <Form.Item
                                            className='mt-4'
                                            label={<b>System</b>}
                                            name="system_request"
                                            rules={[
                                                {
                                                    required: false,
                                                    message: 'Please input system',
                                                },
                                            ]}
                                            style={{ pointerEvents: "none" }}
                                        >
                                            <Checkbox.Group>
                                                <Row>
                                                    {
                                                        applications.map(item => {
                                                            return (
                                                                <Col span={12}>
                                                                    <Checkbox value={item.id}>{item.name}</Checkbox>
                                                                </Col>
                                                            )
                                                        })
                                                    }
                                                    <Col span={12}>
                                                        <Checkbox value={'Other'}>
                                                            Other
                                                        </Checkbox>
                                                        {otherChecked && (
                                                            <Form.Item
                                                                label={<em style={{ fontSize: 10, marginTop: 10 }}>( Explained )</em>}
                                                                name="system_request_other"
                                                                rules={[
                                                                    {
                                                                        required: false,
                                                                        message: 'Please input system',
                                                                    },
                                                                ]}
                                                            >
                                                                <TextArea
                                                                    rows={2}
                                                                    placeholder="Please input other system"
                                                                />
                                                            </Form.Item>
                                                        )}
                                                    </Col>
                                                </Row>
                                            </Checkbox.Group>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row className='mt-3' gutter={10}>
                                    <Col xs={{ span: 23 }} span={12}>
                                        <Form.Item
                                            label={<><span style={{ fontSize: 11 }}>Justication ( Why internet acces required and/or why additional new access point is required ?  ) </span></>}
                                            name="justification"
                                            hidden={justification}
                                            rules={[
                                                {
                                                    required: false,
                                                    message: 'Please input type explain',
                                                }
                                            ]}
                                        >

                                            <TextArea rows={4} readOnly />
                                        </Form.Item>

                                    </Col>
                                </Row>
                            </Panel>
                        </Collapse>
                        <Collapse style={{ marginBottom: -20 }} bordered={false} defaultActiveKey={['1']}>
                            <Panel showArrow={false} header={<b>Network Access and Communication Request</b>} key="1">
                                <Row gutter={10}>
                                    <Col xs={{ span: 10 }}>
                                        <Form.Item className='mb-2'
                                            label="Login Name"
                                            name="login_name"
                                        >
                                            <Input readOnly />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={20}>
                                    <Col xs={{ span: 10 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                                        <Form.Item className='mb-2'
                                            label="Network Folder"
                                            name="network_folder"
                                        >
                                            <Input readOnly placeholder='Example : HSE or Legal' />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={{ span: 10 }} sm={{ span: 10 }} xl={{ span: 10 }}>
                                        <Form.Item className='mb-2'
                                            label="Permissions"
                                            name="permission_network_folder"
                                            style={{ pointerEvents: "none" }}
                                        >
                                            <Checkbox.Group>
                                                <Row>
                                                    <Col span={12}>
                                                        <Checkbox value="Full Access">Full Access</Checkbox>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Checkbox value="Modifiy / Write">Modifiy /Write</Checkbox>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Checkbox value="Read Only">Read Only</Checkbox>
                                                    </Col>
                                                </Row>
                                            </Checkbox.Group>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={20}>
                                    <Col xs={{ span: 24 }} sm={{ span: 12 }} xl={{ span: 12 }}>
                                        <Form.Item className='mb-2'
                                            label="Communication Access"
                                            name="communication_access"
                                            style={{ pointerEvents: "none" }}
                                        >
                                            <Checkbox.Group>
                                                <Row>
                                                    <Col span={12}>
                                                        <Checkbox value="Extension Phone">Extension Phone</Checkbox>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Checkbox value="GSM">GSM</Checkbox>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Checkbox value="Internet Data Package">Internet Data Package</Checkbox>
                                                    </Col>
                                                </Row>
                                            </Checkbox.Group>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Panel>

                        </Collapse>
                        <Collapse style={{ marginBottom: -20 }} bordered={false} defaultActiveKey={['1']}>
                            <Panel showArrow={false} header={<b>Description</b>} key={1}>
                                <Row gutter={10}>
                                    <Col xs={{ span: 23 }} span={12}>
                                        <Form.Item className='mb-2'
                                            label={<><span>Description ( Brief description of the requirements & justification )</span></>}
                                            name="description"
                                        >
                                            <TextArea rows={4} readOnly className="mt-3" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Panel>
                        </Collapse>
                    </Form>
                </div>
            </div>
            <div className='row '>
                {
                    true && (
                        <div className='col-md-12 mt-3 text-center'>
                            <QRCodeSVG size={80} height={100} className="mb-2 mt-2" value={`https://farms.brmapps.com/wf/approved/${all && all.approval_process_id.approval_key}`} />
                        </div>
                    )
                }
            </div>
            <div className='row'>
                <div className='col-md-12 mb-3 text-center'>
                    Approval with QR Code
                </div>
            </div>
        </div>
    </>)
}


export default PrintServiceRequest