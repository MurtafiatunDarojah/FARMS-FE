import { Collapse, Form, AutoComplete, Input, Row, Col, Checkbox, message, Descriptions, Modal, Button, Affix, Timeline, Alert, Avatar, Comment } from "antd";
import { RollbackOutlined, PrinterOutlined } from '@ant-design/icons';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import HeaderFarms from 'src/utils/header_farms';
import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from 'react-router-dom';
import { Block, Confirm, Report } from "notiflix";
import { useSelector } from 'react-redux';
import { QRCodeSVG } from "qrcode.react";
import API from "src/services";
import moment from 'moment';

const ViewServiceRequest = () => {

  let navigate = useNavigate()

  const session = useSelector((state) => state.session)
  const [form] = Form.useForm();
  let { id } = useParams();

  const { Panel } = Collapse;
  const { TextArea } = Input;

  const [statusColor, setStatusColor] = useState({ background: null, color: null })
  const [typeRequestExplain, setTypeRequestExplain] = useState(true);
  const [EquipmentDetails, SetEquipmentDetails] = useState(true);
  const [completeLoadSR, setcompleteLoadSR] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [justification, setJustification] = useState(true)
  const [applications, setApplications] = useState([]);
  const [secApprover, setSecApprover] = useState([]);

  const [otherChecked, setOtherChecked] = useState(false);
  const [otherAccountChecked, setOtherAccountChecked] = useState(false);

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

      form.setFieldsValue(res.data);

      setcompleteLoadSR(res.data)
      styleStatus(res.data)

      const approverOptions = res.data.approval_process_id.detail
        .filter(detail => detail.status === false)
        .map(detail => ({
          id: detail._id,
          label: detail.approved_by.fullname,
          nik: detail.approved_by.nik,
        }));

      setSecApprover(approverOptions)


    })).catch((err) => {
      console.error(err)
      Report.info(
        "Service Request",
        "Sorry, Service Request not founding",
        "Okay"
      );

    })

  }

  const closedServiceRequest = () => {
    Confirm.show(
      'Important Confirmation',
      'Are you sure ?',
      'Yes',
      'No',
      () => {
        API.ServiceRequestClosed(HeaderFarms(session.accessToken), {
          approval_id: completeLoadSR.approval_process_id._id,
        }).then(res => {
          Report.success(
            `Closed Success`,
            `Service Request berhasil di tutup`,
            "Okay",
            function () {
              navigate('/service-request')
            })
        }).catch((err) => {
          console.log(err)
          message.warning('Terjadi Kesalahan saat close service request')
        });
      },
    );

  }

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

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const secApproveAction = (data) => {
    Confirm.show(
      'Important Confirmation',
      'Are you sure ?',
      'Yes',
      'No',
      () => {
        data.header_id = completeLoadSR.approval_process_id.id

        API.ServiceITApproval(HeaderFarms(session.accessToken), data).then(res => {
          Report.success(
            `Approved Success`,
            `Service Request berhasil di setujui by IT`,
            "Okay",
            function () {
              navigate('/service-request')
            })
        }).catch((err) => {
          console.log(err)
          message.warning('Terjadi Kesalahan saat approved service request')
        });
      })
  }

  const styleStatus = (res) => {
    let status = res.approval_process_id.status;

    if (status === "Waiting Approval") {
      setStatusColor({
        background: "#FF9900",
        color: "#FFFFFF"
      })
    } else if (status === "Approved") {
      setStatusColor({
        background: "#1890FF",
        color: "#FFFFFF"
      })
    } else {
      setStatusColor({
        background: "#F5222D",
        color: "#FFFFFF"
      })
    }
  }

  useEffect(() => {
    if (!session) {
      navigate('/login')
    } else {
      getDetailSR()
      getApplications()

    }
  }, [])

  return (
    <>
      <div className="row mb-3">
        <div className="col-md-1">
          <Button type='primary' icon={<RollbackOutlined />} onClick={() => navigate('/service-request')}>Back</Button>
        </div>
        {

          completeLoadSR &&

          (completeLoadSR.approval_process_id.status === 'Approved' || completeLoadSR.approval_process_id.status === 'Closed') && (

            <div style={{ marginLeft: 10 }} className="col-md-1">

              <Button type="primary" onClick={() => navigate('/sr/print/' + id)} icon={<PrinterOutlined />}>Print</Button>

            </div>

          )

        }
      </div>
      <CCard>
        <CCardHeader>Detail</CCardHeader>
        <CCardBody>
          <Form
            form={form}
            name="service_request_form"
            initialValues={{
              remember: true,
            }}
            onFinish={null}
            onFinishFailed={() => message.warning('Mohon lengkapi formulir.')}
            autoComplete="off"
            size='small'
            layout='vertical'
          >
            <div className="container p-3" style={{ alignSelf: "center" }}>

              <div className="row">
                <div className="col-md-12 mb-2">
                  <Collapse bordered={true} defaultActiveKey={['1']}>
                    <Panel style={{ background: "#fce8b6" }} header={<b>Service Request Information</b>} key="1">
                      {completeLoadSR ? (
                        <>
                          <div className="row mt-3">
                            <div className="col-md-12">
                              {
                                completeLoadSR && (
                                  <Descriptions size="small" bordered title="Information" className="mb-4">
                                    <Descriptions.Item label="Form ID">
                                      {completeLoadSR.form_record}
                                    </Descriptions.Item>
                                    {/* {
                                                                            completeLoadSR.approval_process_id.detail.map(i => {
                                                                                return (<Descriptions.Item label="Approver">
                                                                                    {i.approved_by.fullname}
                                                                                </Descriptions.Item>)
                                                                            })
                                                                        } */}
                                    <Descriptions.Item style={{ background: statusColor.background, color: statusColor.color }} label="Status">
                                      {completeLoadSR.approval_process_id.status}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Created at">
                                      {moment(completeLoadSR.created_at).format('LLL')}
                                    </Descriptions.Item>
                                  </Descriptions>
                                )
                              }
                            </div>
                          </div>
                          <div className='row'>
                            <div className="col-md-12 mb-3">
                              {
                                completeLoadSR && completeLoadSR.comments.length > 0 && (
                                  <Collapse bordered="false" defaultActiveKey={['1']}>
                                    <Panel header="Comments" key="1">
                                      {
                                        completeLoadSR && completeLoadSR.comments.map(data => {
                                          return (
                                            <Comment
                                              author={<a>{data.uid.fullname}</a>}
                                              avatar={<Avatar src="https://joeschmoe.io/api/v1/joe" alt="Han Solo" />}
                                              content={
                                                <p>
                                                  {data.text_plain}
                                                </p>
                                              }
                                            />
                                          )
                                        })
                                      }
                                    </Panel>
                                  </Collapse>
                                )
                              }
                            </div>
                          </div>
                          <div className='row'>
                            <div className='col-md-8'>
                              <label style={{ fontSize: 15, fontWeight: "bold" }}>Approval Status</label>
                              <Timeline style={{ marginTop: 30, marginBottom: -30 }}>
                                {
                                  completeLoadSR.approval_process_id.detail.map(item => {
                                    return (
                                      <Timeline.Item >{item.approved_by.fullname}
                                        <Alert
                                          message={item.status ? 'Approved' : 'Waiting Approval'}
                                          className='mt-1 w-50 p-1'
                                          type={item.status ? 'success' : 'warning'}
                                          showIcon
                                        />
                                      </Timeline.Item>
                                    )
                                  })
                                }
                              </Timeline>
                            </div>
                            {
                              completeLoadSR.approval_process_id.approval_key && (
                                <div className='col-md-3' style={{ display: "flex", alignItems: "end" }}>
                                  <QRCodeSVG size={110} value={`https://farms.brmapps.com/wf/approved/${completeLoadSR.approval_process_id.approval_key}`} />
                                </div>
                              )
                            }
                          </div>
                        </>
                      ) : (
                        <></>
                      )}
                    </Panel>
                  </Collapse>
                </div>
                <div className='col-md-12'>
                  <Collapse className='collapse_sr' expandIconPosition={"end"} bordered={true} defaultActiveKey={['0', '1', '2', '3', '4', '5']} onChange={null}>
                    <Panel style={{ background: "#fce8b6" }} header={<b>User Requiring Access</b>} key="1">
                      <Row gutter={10} className="mb-3">
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Fullname"
                            name="fullname"
                            rules={[{ required: false, message: 'Please input fullname' }]}
                          >
                            <AutoComplete
                              options={null}
                              onSelect={null}
                              filterOption={(inputValue, option) => {
                                return option.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                              }
                              }
                            >
                              <Input.Search readOnly size="middle" placeholder="Search.." />
                            </AutoComplete>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={10}>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Position"
                            name="position"
                            rules={[{ required: false, message: 'Please input Position' }]}
                          >
                            <Input readOnly />
                          </Form.Item>
                        </Col>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Department"
                            name="department"
                            rules={[{ required: false, message: 'Please input Department' }]}
                          >
                            <Input readOnly />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={10}>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="NIK"
                            name="nik"
                            rules={[{ required: false, message: 'Please input nik' }]}
                          >
                            <Input readOnly />
                          </Form.Item>
                        </Col>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Business Unit"
                            name="company"
                            rules={[{ required: false, message: 'Please input business unit' }]}
                          >
                            <Input readOnly />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={10}>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Phone"
                            name="phone_number"
                            rules={[{ required: false, message: 'Please input phone' }]}
                          >
                            <Input readOnly />
                          </Form.Item>
                        </Col>
                        <Form.Item
                          label="Employee Status"
                          name="employee_status"
                          rules={[{ required: false, message: 'Please input status' }]}
                        >
                          <Input readOnly />
                        </Form.Item>
                      </Row>
                    </Panel>
                    <Panel style={{ background: "#fce8b6" }} header={<b>Equipment Request</b>} key="2">
                      <Row className='mt-3' gutter={20}>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
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
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
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
                    <Panel style={{ background: "#fce8b6" }} header={<b>System Request</b>} key="3">
                      <Row gutter={10}>
                        <Col xs={{ span: 23 }} sm={{ span: 12 }} xl={{ span: 12 }}>
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
                    <Panel style={{ background: "#fce8b6" }} header={<b>Network Access and Communication Request</b>} key="4">
                      <Row gutter={10}>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Login Name"
                            name="login_name"
                            rules={[{ required: false, message: 'Please input login name' }]}
                          >
                            <Input readOnly />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={20}>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Network Folder"
                            name="network_folder"
                            rules={[{ required: false, message: 'Please input network folder' }]}
                          >
                            <Input readOnly placeholder='Example : HSE or Legal' />
                          </Form.Item>
                        </Col>
                        <Col xs={{ span: 23 }} sm={{ span: 10 }} xl={{ span: 10 }}>
                          <Form.Item
                            label="Permissions"
                            name="permission_network_folder"
                            rules={[{ required: false, message: 'Please input network folder' }]}
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
                          <Form.Item
                            label="Communication Access"
                            name="communication_access"
                            rules={[{ required: false, message: 'Please input communication access' }]}
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
                    <Panel style={{ background: "#fce8b6" }} header={<b>Description</b>} key="5">
                      <Row gutter={10}>
                        <Col xs={{ span: 23 }} span={12}>
                          <Form.Item
                            label={<><span>Description ( Brief description of the requirements & justification )</span></>}
                            name="description"
                            rules={[
                              {
                                required: false,
                                message: 'Please input Brief description of the requirements & justification',
                              },
                            ]}
                          >
                            <TextArea rows={4} readOnly className="mt-3" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Panel>
                  </Collapse>
                </div>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-md-12">
                <Affix offsetBottom={10}>
                  {

                    completeLoadSR && completeLoadSR.approval_process_id.status === 'Approved' && (
                      <Form.Item className="text-center">
                        <Button type="primary" size="large" htmlType="submit" onClick={() => closedServiceRequest()}>
                          Closed
                        </Button>
                      </Form.Item>
                    )
                  }
                  {

                    completeLoadSR && completeLoadSR.approval_process_id.status === 'Waiting Approval' && (
                      <Form.Item className="text-center">
                        <Button type="primary" size="large" htmlType="submit" onClick={showModal}>
                          Approved by IT
                        </Button>
                      </Form.Item>
                    )
                  }
                </Affix>
              </div>
            </div>
          </Form>
          <Modal
            title="Secondary Approver"
            footer={null}
            visible={isModalVisible}
            onOk={null}
            onCancel={handleCancel}
            style={{ top: 250 }}
          >
            <Form
              name="basic"
              wrapperCol={{ span: 24 }}
              onFinish={secApproveAction}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item
                label="Select items to approve"
                labelCol={{
                  xs: { span: 24 },
                  sm: { span: 24 },
                  lg: { span: 24 }
                }}
              >
                <Form.Item rules={[
                  {
                    required: true,
                    message: "Please select secondary approver. ",
                  },
                ]} name="app_id" noStyle>
                  <Checkbox.Group>
                    {secApprover && secApprover.map(option => (
                      <Checkbox value={{ id: option.id, nik: option.nik }} key={option.id}>{option.label}</Checkbox>
                    ))}
                  </Checkbox.Group>
                </Form.Item>
              </Form.Item>

              <Form.Item
                className="mt-3"
                wrapperCol={{
                  xs: { offset: 8, span: 18 },
                  sm: { offset: 7, span: 18 },
                  lg: { offset: 8, span: 18 }
                }}
              >
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </CCardBody>
      </CCard>
    </>)
}

export default ViewServiceRequest
