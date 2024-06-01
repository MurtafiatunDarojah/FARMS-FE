import { CCard, CCardBody, CCardHeader, CSpinner } from '@coreui/react'
import { FileExcelOutlined, CheckCircleOutlined, RollbackOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import { Alert, Button, Descriptions, Timeline } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Confirm, Notify, Report } from 'notiflix';
import React, { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react';
import "gridjs/dist/theme/mermaid.css";
import { _ } from 'gridjs-react';
import numeral from 'numeral';

import HeaderFarms from 'src/utils/header_farms';
import API from 'src/services';
import moment from 'moment';
import AWS from 'aws-sdk';

let XLSX = require("xlsx");

const ViewBillingTelkomsel = (props) => {

    const session = useSelector((state) => state.session)

    const [statusColor, setStatusColor] = useState({ background: null, color: null })
    const [loadingApply, setLoadingApply] = useState(false)
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState(null)
    const dispatch = useDispatch()
    let navigate = useNavigate()

    let { id } = useParams();
    let number_row = 0

    Notify.init({
        width: '300px',
        position: 'center-center',
        closeButton: false,
    });

    const viewBilling = () => {
        API.ViewBillingTelkomsel(HeaderFarms(session.accessToken), id).then(res => {
            setView(res.data)
            setLoading(false)
            styleStatus(res.data)
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

    const ApplyToApproval = () => {

        Confirm.show(
            'Important Confirmation',
            'Are you sure ? Bill will be submitted.',
            'Yes',
            'No',
            () => {
                setLoadingApply(true)

                API.ApplyToApproval(HeaderFarms(session.accessToken), { period: id }).then(res => {

                    Notify.success('Apply to Approval Success')
                    setLoadingApply(false)
                })
                    .catch(err => {
                        setLoadingApply(false)
                        if (err.response.status === 400) {
                            err.response.data.error.forEach(item => {
                                Notify.failure(item.name)
                            })
                        } else {
                            err.response.data.error.forEach(item => {
                                Notify.failure(item.name)
                            })
                        }
                    })
            },
        );
    }

    const onExportExcel = () => {

        view.billing.push({
            "seq": null,
            "provider": null,
            "invoice_number": null,
            "name": null,
            "telp": null,
            "international_roaming": null,
            "calls_to_telkomsel_numbers": null,
            "calls_to_other_operators": null,
            "idd_international_sms": null,
            "domestic_sms": null,
            "domestic_data": null,
            "amount_due_to_be_paid": null,
            "business_entity": "Total",
            "subtotal_bu": view.recap.subTotal,
            "remarks": null
        })

        view.billing.forEach(element => {
            element.international_roaming = element.international_roaming ? numeral(element.international_roaming).format('0,0') : '-'
            element.calls_to_telkomsel_numbers = element.calls_to_telkomsel_numbers ? numeral(element.calls_to_telkomsel_numbers).format('0,0') : '-'
            element.calls_to_other_operators = element.calls_to_other_operators ? numeral(element.calls_to_other_operators).format('0,0') : '-'
            element.idd_international_sms = element.idd_international_sms ? numeral(element.idd_international_sms).format('0,0') : '-'
            element.domestic_sms = element.domestic_sms ? numeral(element.domestic_sms).format('0,0') : '-'
            element.domestic_data = element.domestic_data ? numeral(element.domestic_data).format('0,0') : '-'
            element.amount_due_to_be_paid = element.amount_due_to_be_paid ? numeral(element.amount_due_to_be_paid).format('0,0') : '-'
            element.business_entity = element.business_entity ? element.business_entity : numeral(element.business_entity).format('0,0')
            element.subtotal_bu = numeral(element.subtotal_bu).format('0,0')
        });

        let Heading = [['Seq', 'Prv', 'Invoice Number', 'Name', 'HP Number', 'Roaming', 'LOCAL', 'SLJJ', 'SLI', 'SMS', 'Paket Flash', 'IDR', 'BE', 'Total / BE', 'Remarks']];


        let wb = XLSX.utils.book_new()
        let ws = XLSX.utils.json_to_sheet([])

        XLSX.utils.sheet_add_aoa(ws, Heading);

        var wscols = [
            { wch: 6, }, //seq
            { wch: 6 }, // provider
            { wch: 14.00 }, //invoice number
            { wch: 22 }, //name 
            { wch: 17 }, //telp 
            { wch: 10 }, //roaming
            { wch: 10 }, // local
            { wch: 10 }, // sljj
            { wch: 10 }, // sli
            { wch: 10 }, //sms
            { wch: 11 }, //paket flash
            { wch: 11 }, // idr
            { wch: 7 }, // BE
            { wch: 11 }, //TOTAL BE
            { wch: 11 }, //remarks
            
        ];


        ws['!cols'] = wscols;
        ws['!rows'] = [{ hpx: 30, hpt: 15 }];


        XLSX.utils.sheet_add_json(ws, view.billing, { origin: 'A2', skipHeader: true });


        XLSX.utils.book_append_sheet(wb, ws, id)


        XLSX.writeFile(wb, id + ".xlsx")

    }


    const styleStatus = (res) => {
        let status = res.process.status;

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
            viewBilling(id)
        }

    }, [])

    return (
        <>
            <div className="row mb-3">
                <div className="col-md-1">
                    <Button type='primary' icon={<RollbackOutlined />} onClick={() => navigate('/billing-telkomsel')}>Back</Button>
                </div>
            </div>
            <CCard>
                <CCardHeader>View Period</CCardHeader>
                <CCardBody style={{ height: 50 }}>
                    <Button type="primary" onClick={() => onExportExcel()} icon={<FileExcelOutlined />}>Export Excel</Button>
                    {
                        view && !view.process ? (
                            <Button loading={loadingApply} style={{ marginLeft: 10 }} type="primary" icon={<CheckCircleOutlined />} onClick={() => ApplyToApproval()}>Apply to Approval</Button>
                        ) : null
                    }

                    {
                        view && view.process ? (
                            <Button type="primary" style={{ marginLeft: 10 }} onClick={() => navigate('/bt/invoice/' + id)} icon={<PrinterOutlined />}>Print</Button>
                        ) : null
                    }
                
                </CCardBody>
                {
                    view && view.process && (
                        <CCardBody>
                            <div className='row'>
                                <div className='col-md-12'>
                                    <Descriptions size="small" bordered title="Information" className="mb-4">
                                        <Descriptions.Item label="Record">
                                            {view.process.form_submit_id}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Requestor">
                                            {view.process.uid.fullname}
                                        </Descriptions.Item>
                                        <Descriptions.Item style={{ background: statusColor.background, color: statusColor.color }} label="Status">
                                            {view.process.status}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Document Name">
                                            Billing Telkomsel
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Submission Time">
                                            {moment(view.process.created_at).format('LLL')}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </div>
                            </div>
                            <div className='row'>
                                <div className='col-md-8'>
                                    <label style={{ fontSize: 15, fontWeight: "bold" }}>Approval Status</label>
                                    <Timeline style={{ marginTop: 30, marginBottom: -50 }}>
                                        {
                                            view.process.detail.map(item => {
                                                return (
                                                    <Timeline.Item >{item.approved_by.fullname}
                                                        <Alert
                                                            message={item.status ? 'Approved' : 'Waiting Approval'}
                                                            className='mt-1 w-25 p-1'
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
                                    view.process.approval_key && (
                                        <div className='col-md-3' style={{ display: "flex", alignItems: "end" }}>
                                            <QRCodeSVG size={110} value={`https://farms.brmapps.com/wf/approved/${view.process.approval_key}`} />
                                        </div>
                                    )
                                }
                            </div>
                        </CCardBody>
                    )
                }
                <CCardBody className='mt-4'>
                    {
                        loading && <CSpinner color="primary" />
                    }
                    <table style={{ fontSize: 10 }} className="table table-bordered table-striped ">
                        <thead>
                            <tr>
                                <th style={{ fontWeight: "bold", fontSize: 11 }}>No</th>
                                {/* <th style={{ fontWeight: "bold", fontSize: 11 }}>Prv</th> */}
                                {/* <th style={{ fontWeight: "bold", fontSize: 11 }}>Invoice Number</th> */}
                                <th style={{ fontWeight: "bold", fontSize: 11 }}>Name</th>
                                <th style={{ fontWeight: "bold", fontSize: 11 }}>HP Number</th>
                                <th style={{ fontWeight: "bold", fontSize: 11 }}>Roaming</th>
                                <th style={{ fontWeight: "bold", fontSize: 11 }}>LOCAL</th>
                                <th style={{ fontWeight: "bold", fontSize: 11 }}>SLJJ</th>
                                <th style={{ fontWeight: "bold", fontSize: 11 }}>SLI</th>
                                <th style={{ fontWeight: "bold", fontSize: 11 }}>SMS</th>
                                <th style={{ fontWeight: "bold", fontSize: 11 }}>Paket Flash</th>
                                <th style={{ fontWeight: "bold", fontSize: 11 }}>Amount</th>
                                <th style={{ fontWeight: "bold", fontSize: 11 }}>total / BU</th>
                                <th style={{ fontWeight: "bold", fontSize: 11 }}>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {

                                view && view.billing.map((item, index) => {


                                    if (item.name) {
                                        number_row += 1
                                    }

                                    return (
                                        <>
                                            <tr style={item.name ? null : { backgroundColor: '#C4D79B', fontSize: 11 }}>
                                                <td>{item.name ? number_row : null}</td>
                                                {/* <td>{item.provider}</td> */}
                                                {/* <td>{item.invoice_number}</td> */}
                                                <td>{item.name ? item.name : item.business_entity}</td>
                                                <td>{item.telp}</td>
                                                <td>{item.international_roaming ? numeral(item.international_roaming).format('0,0') : '-'}</td>
                                                <td>{item.calls_to_telkomsel_numbers ? numeral(item.calls_to_telkomsel_numbers).format('0,0') : '-'}</td>
                                                <td>{item.calls_to_other_operators ? numeral(item.calls_to_other_operators).format('0,0') : '-'}</td>
                                                <td>{item.idd_international_sms ? numeral(item.idd_international_sms).format('0,0') : '-'}</td>
                                                <td>{item.domestic_sms ? numeral(item.domestic_sms).format('0,0') : '-'}</td>
                                                <td>{item.domestic_data ? numeral(item.domestic_data).format('0,0') : '-'}</td>
                                                <td style={{ fontWeight: "bold", fontSize: 11 }}>{item.amount_due_to_be_paid ? numeral(item.amount_due_to_be_paid).format('0,0') : '-'}</td>
                                                <td style={{ fontWeight: "bold", fontSize: 11 }}>{item.subtotal_bu ? numeral(item.subtotal_bu).format('0,0') : ''}</td>
                                                <td>{item.remarks}</td>
                                            </tr>
                                        </>
                                    )

                                })

                            }
                            <tr style={{ backgroundColor: '#C4D79B' }}>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                {/* <td></td> */}
                                <td style={{ fontSize: 11, fontWeight: "bold" }}>Total</td>
                                <td style={{ fontSize: 11, fontWeight: "bold" }}>{view && numeral(view.recap.subTotal).format('0,0')}</td>

                            </tr>
                        </tbody>
                    </table>
                </CCardBody>
            </CCard>
        </>
    )
}
export default ViewBillingTelkomsel
