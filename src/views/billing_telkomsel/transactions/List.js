import React, { useEffect, useState } from 'react'
import { CCard, CCardHeader, CCardBody, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter } from '@coreui/react'

import HeaderFarms from 'src/utils/header_farms'
import API from 'src/services'

import { Alert, Button, Form, Upload } from 'antd';

import { _ } from 'gridjs-react';
import "gridjs/dist/theme/mermaid.css";

import { UploadOutlined, FileExcelOutlined, FileSearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Notify, Report } from 'notiflix';

const ListBillingTelkomsel = (props) => {

    const [listPeriod, setListPeriod] = useState([])
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(false)

    const session = useSelector((state) => state.session)

    const dispatch = useDispatch()
    let navigate = useNavigate()

    const onFinish = (values) => {

        Notify.init({
            width: '300px',
            position: 'center-center',
            closeButton: false,
        });

        setLoading(true)

        let bodyFormData = new FormData();

        bodyFormData.append('billing_sum', values.header.file);
        bodyFormData.append('billing_dtl', values.detail.file);
        bodyFormData.append('billing_pdf', values.pdf.file);

        API.UploadBillingTelkomsel(HeaderFarms(session.accessToken), bodyFormData).then(res => {

            Notify.success('Import Billing Success')
            window.location.reload();
            setLoading(false)
            setVisible(false)

        }).catch(err => {
            if (err.response.status === 400) {
                err.response.data.error.forEach(item => {
                    Notify.failure(item.name)
                })
            } else {
                err.response.data.error.forEach(item => {
                    Notify.failure(item.name)
                })
            }
            setLoading(false)
        })
    };

    const getListPeriod = () => {
        API.ListBillingTelkomsel(HeaderFarms(session.accessToken)).then(res => {
            let clean = []
            res.data.forEach((data, index) => {
                clean.push({
                    id: index + 1,
                    periode_upload: data.periode_upload,
                    created_by: data.created_by,
                    view: data.periode_upload
                })
            })

            setListPeriod(clean)
        }).catch(err => {

            if (err.response.status == 401) {
                dispatch({ type: 'set', session: null })
                navigate('/login')
            } else if (err.response.status == 403) {
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

    const columns = [
        // { field: 'id', headerName: 'No', width: 50 },
        {
            field: 'periode_upload',
            headerName: 'Period',
        },
        {
            field: 'created_by',
            headerName: 'Imported By',
            width: "300"
        },
        {
            field: 'id',
            headerName: 'Action',
            width: 200,
            renderCell: (data) => {
                return (
                    <>
                        <Button type='primary' icon={<FileSearchOutlined />} onClick={() => { navigate('/billing-telkomsel/' + data.row.view) }}>View</Button>
                    </>
                )
            }
        },
    ];

    useEffect(() => {
        if (!session) {
            navigate('/login')
        } else {
            getListPeriod()

        }
    }, [])

    return (
        <>
            <CCard>
                <CCardHeader>List Period</CCardHeader>
                <CCardBody style={{ height: 50 }}>
                    <Button icon={<FileExcelOutlined />} type='primary' onClick={() => setVisible(!visible)}>Import Excel</Button>
                </CCardBody>
                <CCardBody style={{ height: '400px', width: '80%' }}>
                    <DataGrid
                        rows={listPeriod}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10]}
                        initialState={{
                            sorting: {
                                sortModel: [{ field: 'periode_upload', sort: 'desc' }],
                            },
                        }}
                    />
                </CCardBody>
                <CModal alignment="center" visible={visible} onClose={() => setVisible(false)}>
                    <Form encType='multipart/form-data' onFinish={(data) => onFinish(data)}
                        labelCol={{
                            span: 4,
                        }}

                    >
                        <CModalHeader onClose={() => setVisible(false)}>
                            <CModalTitle>Import Billing</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            <Alert
                                message="Syarat Import Billing Telkomsel"
                                description="Pastikan Semua Data Master telah di update sebelum melakukan import billing"
                                type="info"
                                showIcon
                                className='mb-4'
                            />
                            <Form.Item rules={[{ required: true, message: 'Please input summary!' }]} label="Summary" name="header">
                                <Upload name='header' maxCount={1} beforeUpload={() => {
                                    return false;
                                }}>
                                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                                </Upload>

                            </Form.Item>
                            <Form.Item messageVariables={'ok'} rules={[{ required: true, message: 'Please input detail!' }]} label="Details" name="detail">
                                <Upload name='detail' maxCount={1} beforeUpload={() => {
                                    return false;
                                }}>
                                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                                </Upload>

                            </Form.Item>
                            <Form.Item rules={[{ required: true, message: 'Please input pdf!' }]} label="PDF" name="pdf">
                                <Upload name='pdf' maxCount={1} beforeUpload={() => {
                                    return false;
                                }}>
                                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                                </Upload>

                            </Form.Item>
                        </CModalBody>
                        <CModalFooter>
                            <Button color="secondary" onClick={() => {
                                setVisible(false)
                                setLoading(false)
                            }}>
                                Close
                            </Button>
                            <Button type="primary" loading={loading} htmlType='submit'>Submit</Button>
                        </CModalFooter>
                    </Form>
                </CModal>
            </CCard>
        </>
    )
}

export default ListBillingTelkomsel
