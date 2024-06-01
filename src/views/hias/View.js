import { Collapse, Form, Input, Row, Col, Button, Alert, Radio, Modal } from "antd";
import { RollbackOutlined } from '@ant-design/icons';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import HeaderFarms from 'src/utils/header_farms';
import React, { useEffect, useState } from "react";

import { useNavigate, useParams } from 'react-router-dom';
import { Block, Report } from "notiflix";
import { useSelector } from 'react-redux';
import API from "src/services";

const ViewHias = () => {

  let navigate = useNavigate()

  const [attachments, setAttachments] = useState([]); // Your attachments data state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const handlePreview = (fileUrl) => {
    setPreviewImage(fileUrl);
    setPreviewOpen(true);
  };

  const handleCancel = () => {
    setPreviewOpen(false);
    setPreviewImage('');
  };

  const session = useSelector((state) => state.session)
  const [form] = Form.useForm();
  let { id } = useParams();

  const { Panel } = Collapse;
  const { TextArea } = Input;

  const getDetailHS = () => {

    API.ViewHias(HeaderFarms(session.accessToken), id).then(((res) => {
      form.setFieldsValue(res.data)
      setAttachments(res.data.attachments)
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
      navigate('/login')
    } else {
      getDetailHS()
    }
  }, [])

  return (
    <>
      <div className="row mb-3">
        <div div className="col-md-1">
          <Button type='primary' icon={<RollbackOutlined />} onClick={() => navigate('/hias')}>Back</Button>
        </div>
      </div>
      <CCard className="mb-4">
        <CCardHeader>Detail Information Hias</CCardHeader>
        <CCardBody>
          <Form
            form={form}
            name="service_request_form"
            initialValues={{
              remember: true,
            }}
            autoComplete="off"
            size='small'
            layout='vertical'

          >
            <div className="container" style={{ alignSelf: "center" }}>
              <div className="row">
                <div className='col-md-12'>
                  <Alert
                    message={<b style={{ fontSize: 15 }}>HAZARD INFORMATION AND SUGGESTION</b>}
                    description="Saran dan Informasi Bahaya"
                    type="warning"
                    className='mb-2'
                  />
                  <Collapse className='collapse_sr' expandIconPosition={"end"} bordered={true} defaultActiveKey={['0', '1', '2', '3', '4', '5']}>
                    <Panel style={{ background: "#fce8b6" }} header={<b>Lokasi dan Foto</b>} key="1">
                      <Row gutter={10} className="mb-1">
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item label="Photos" name="attachments">
                            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                              {attachments.map((attachment) => (
                                <div
                                  key={attachment._id}
                                  style={{
                                    marginRight: '8px', // Add some margin between thumbnails
                                    cursor: 'pointer',
                                    padding: '40px',
                                  }}
                                  onClick={() => handlePreview(attachment.file_url)}
                                >
                                  <img
                                    alt={attachment.file_name}
                                    style={{
                                      width: '100px', // Set the width of each thumbnail as needed
                                      height: 'auto', // Maintain the aspect ratio
                                    }}
                                    src={attachment.file_url}
                                  />
                                </div>
                              ))}
                            </div>
                            <Modal
                              
                              visible={previewOpen}
                              title={"Attachment"}
                              footer={null}
                              onCancel={handleCancel}   
                              style={{ marginTop: 80 }}
                            >
                              <img
                                alt={"Attachment"}
                                style={{
                                  width: '100%',
                                  maxWidth: '100%',
                                }}
                                src={previewImage}
                              />
                            </Modal>
                          </Form.Item>
                        </Col>

                      </Row>
                      <Row gutter={10} className="mb-1">
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Lokasi"
                            name="location"
                            rules={[{ required: true, message: 'Lokasi wajib di isi' }]}
                          >
                            <Input readOnly />
                          </Form.Item>
                        </Col>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="ID HIAS"
                            name="id_record"
                            rules={[{ required: true, message: 'Lokasi wajib di isi' }]}
                          >
                            <Input readOnly />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Panel>
                  </Collapse>
                  <Collapse className='collapse_sr' expandIconPosition={"end"} bordered={true} defaultActiveKey={['0', '1', '2', '3', '4', '5']}>
                    <Panel style={{ background: "#fce8b6" }} header={<b>Identitas anda</b>} key="1">
                      <Row gutter={10}>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Nama Pelapor"
                            name="reporter_name"
                            rules={[{ required: true, message: 'Nama Pelapor wajib di isi' }]}
                          >
                            <Input readOnly placeholder="Mohamad Fazrin" />
                          </Form.Item>
                        </Col>
                        <Col xs={{ span: 23 }} sm={{ span: 8 }} xl={{ span: 7 }}>

                          <Form.Item
                            label="Nomor Handphone / WA"
                            name="number_phone"
                            rules={[{ required: true, message: 'Nomor HP Wajib di isi' }]}
                          >
                            <Input readOnly
                              placeholder="example: 628597721233"
                              inputMode="numeric"
                              pattern="[0-9]*"
                            />

                          </Form.Item>
                        </Col>
                        <Col xs={{ span: 23 }} sm={{ span: 8 }} xl={{ span: 7 }}>

                          <Form.Item
                            label="Nomor Induk Karyawan / NIK KTP"
                            name="employee_id"
                            rules={[{ required: true, message: 'NIK Wajib di isi' }]}
                          >
                            <Input readOnly />

                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={10}>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Jabatan"
                            name="position"
                            rules={[{ required: true, message: 'Jabatan wajib di isi' }]}
                          >
                            <Input readOnly />
                          </Form.Item>
                        </Col>
                        <Col xs={{ span: 23 }} sm={{ span: 8 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Departement / Divisi"
                            name="department_division"
                            rules={[{ required: true, message: 'Department wajib di isi' }]}
                          >
                            <Input readOnly />
                          </Form.Item>
                        </Col>

                      </Row>
                      <Row gutter={10}>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Perusahaan Anda bekerja saat ini?"
                            name="current_company"
                            rules={[{ required: false, message: 'Perusahaan anda wajib di isi' }]}
                          >
                            <Input readOnly />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Panel>

                  </Collapse>
                  <Collapse className='collapse_sr' expandIconPosition={"end"} bordered={true} defaultActiveKey={['0', '1', '2', '3', '4', '5']}>
                    <Panel style={{ background: "#fce8b6" }} header={<b>Kategori</b>} key="1">
                      <Row gutter={10}>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Kategori Informasi"
                            name="information_category"
                            rules={[{ required: true, message: 'Kategori wajib di isi' }]}
                            onChange={(event) =>
                              handleInformationCategory(event)
                            }
                          >
                            <Radio.Group name='information-category' >
                              <Radio value="Saran">Saran</Radio>
                              <Radio value="Ketidaksesuaian">Ketidaksesuaian</Radio>
                            </Radio.Group>
                          </Form.Item>
                        </Col>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Kategori"
                            name="category_suggestions"
                            rules={[{ required: true, message: 'Kategori wajib di isi' }]}
                          >
                            <Radio.Group name='category-suggestions' onChange={(event) =>
                              handleCategorySuggestion(event)
                            }>
                              {[
                                "kesehatan",
                                "keselamatan",
                                "lingkungan",
                                "eksternal",
                                "kepatuhan",
                              ].map((subcategory, index) => (
                                <Radio key={index} value={subcategory} style={{ marginBottom: 10 }}>{subcategory}</Radio>
                              ))}
                            </Radio.Group>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Panel>
                  </Collapse>
                  <Collapse className='collapse_sr' expandIconPosition={"end"} bordered={true} defaultActiveKey={['0', '1', '2', '3', '4', '5']}>
                    <Panel style={{ background: "#fce8b6" }} header={<b>Penyebab Langsung, Hasil Pengamatan, Tindakan Perbaikan Langsung dan Rekomendasi</b>} key="1">
                      <Row gutter={10}>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Penyebab Langsung"
                            name="direct_cause"
                            rules={[{ required: true, message: 'Penyebab Langsung wajib di isi' }]}
                          >
                            <Radio.Group >
                              <Radio style={{ marginBottom: 10 }} value="Hampir Celaka">Hampir Celaka</Radio>
                              <Radio style={{ marginBottom: 10 }} value="Kondisi Tidak Aman">Kondisi Tidak Aman</Radio>
                              <Radio style={{ marginBottom: 10 }} value="Tindakan Tidak Aman">Tindakan Tidak Aman</Radio>
                            </Radio.Group>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Panel>
                  </Collapse>
                  <Collapse className='collapse_sr' expandIconPosition={"end"} bordered={true} defaultActiveKey={['0', '1', '2', '3', '4', '5']}>
                    <Panel style={{ background: "#fce8b6" }} header={<b>Hasil Pengamatan, Tindakan Perbaikan dan Rekomendasi</b>} key="1">
                      <Row gutter={10}>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Hasil Pengamatan"
                            name="observation_results"
                            rules={[
                              { required: true, message: 'Hasil Pengamatan anda wajib di isi' },
                              { min: 10, message: 'Minimal 10 karakter' },
                              { max: 180, message: 'Maksimal 180 karakter' },
                            ]}
                          >
                            <TextArea rows={2} readOnly />
                          </Form.Item>
                        </Col>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Tindakan Perbaikan Langsung"
                            name="immediate_corrective_actions"
                            rules={[
                              { min: 10, message: 'Minimal 10 karakter' },
                              { max: 180, message: 'Maksimal 180 karakter' },
                            ]}
                          >
                            <TextArea rows={2} readOnly />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={10}>
                        <Col xs={{ span: 23 }} sm={{ span: 7 }} xl={{ span: 7 }}>
                          <Form.Item
                            label="Rekomendasi / Masukan Perbaikan"
                            name="recommendations_improvement_inputs"
                            rules={[
                              { required: true, message: 'Rekomendasi / Masukan Perbaikan anda wajib di isi' },
                              { min: 10, message: 'Minimal 10 karakter' },
                              { max: 180, message: 'Maksimal 180 karakter' },
                            ]}
                          >
                            <TextArea rows={2} readOnly />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Panel>
                  </Collapse>
                </div>
              </div>
            </div>
          </Form>
        </CCardBody>
      </CCard>
    </>
  )
}

export default ViewHias
