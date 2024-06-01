import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { Typography } from 'antd';
import { Report } from 'notiflix';

import HeaderFarms from 'src/utils/header_farms';
import { QRCodeSVG } from 'qrcode.react';
import API from 'src/services';
import numeral from 'numeral';  
import moment from 'moment';
import './style.css'

function PrintBillingTelkomsel() {
    let { id } = useParams();
    let navigate = useNavigate()

    const { Title } = Typography;

    const session = useSelector((state) => state.session)
    const [view, setView] = useState(null)
    const dispatch = useDispatch()

    let number_row = 0

    const viewBilling = () => {
        API.ViewBillingTelkomsel(HeaderFarms(session.accessToken), id).then(res => {
            setView(res.data)

            setTimeout(() => {
                window.print();
            }, 1000)
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
            Navigate('/login')
        } else {
            viewBilling(id)
        }
    }, [])

    return (
        <>
            <div className="container white-back-cr">
                <div className="container">
                    <div className="row">
                        <div className="col-md-5 text-center mb-2">
                            <Title level={5}>Invoice Telkomsel</Title>
                        </div>
                    </div>
                    <div className='row'>
                        <div className="col-md-5 text-center mb-2">
                            <Title level={5} style={{ fontSize: 10 }}>Periode Pembayaran : {moment(id).format(
                                "DD MMMM YYYY"
                            )}</Title>
                        </div>
                    </div>
                    <div className='row'>
                        <div className="col-md-5 text-center mb-2">
                            <Title level={5} style={{ fontSize: 10 }}>Invoice Date :  {view && view.invoice_date}</Title>
                        </div>
                    </div>
                    <div className='row'>
                        <div className="col-md-12">
                            <table id="print-bt-tb">
                                <thead>
                                    <tr>
                                        <th style={{ fontWeight: "bold", fontSize: 10, width: 20 }}>No</th>
                                        {/* <th style={{ fontWeight: "bold", fontSize: 10, width: 26 }}>Prv</th> */}
                                        {/* <th style={{ fontWeight: "bold", fontSize: 10, width: 90 }}>Invoice Number</th> */}
                                        <th style={{ fontWeight: "bold", fontSize: 10 }}>Name</th>
                                        <th style={{ fontWeight: "bold", fontSize: 10, width: 90 }}>HP Number</th>
                                        <th style={{ fontWeight: "bold", fontSize: 10 }}>Roaming</th>
                                        <th style={{ fontWeight: "bold", fontSize: 10 }}>LOCAL</th>
                                        <th style={{ fontWeight: "bold", fontSize: 10 }}>SLJJ</th>
                                        <th style={{ fontWeight: "bold", fontSize: 10 }}>SLI</th>
                                        <th style={{ fontWeight: "bold", fontSize: 10 }}>SMS</th>
                                        <th style={{ fontWeight: "bold", fontSize: 10, width: 90 }}>Paket Flash</th>
                                        <th style={{ fontWeight: "bold", fontSize: 10 }}>Amount</th>
                                        <th style={{ fontWeight: "bold", fontSize: 10 }}>total / BU</th>
                                        <th style={{ fontWeight: "bold", fontSize: 10 }}>Remarks</th>
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
                                                    <tr style={item.name ? null : { backgroundColor: '#C4D79B', fontSize: 10 }}>
                                                        <td>{item.name ? number_row : null}</td>
                                                        {/* <td>{item.provider}</td> */}
                                                        {/* <td>{item.invoice_number}</td> */}
                                                        <td style={item.name ? { textOverflow: 'ellipsis', overflow: "hidden", whiteSpace: "nowrap", width: 120, maxWidth: 120 } : { fontWeight: "bold", fontSize: 11 }}>{item.name ? item.name : item.business_entity}</td>
                                                        <td>{item.telp}</td>
                                                        <td>{item.international_roaming ? numeral(item.international_roaming).format('0,0') : '-'}</td>
                                                        <td>{item.calls_to_telkomsel_numbers ? numeral(item.calls_to_telkomsel_numbers).format('0,0') : '-'}</td>
                                                        <td>{item.calls_to_other_operators ? numeral(item.calls_to_other_operators).format('0,0') : '-'}</td>
                                                        <td>{item.idd_international_sms ? numeral(item.idd_international_sms).format('0,0') : '-'}</td>
                                                        <td>{item.domestic_sms ? numeral(item.domestic_sms).format('0,0') : '-'}</td>
                                                        <td>{item.domestic_data ? numeral(item.domestic_data).format('0,0') : '-'}</td>
                                                        <td style={{ fontWeight: "bold", fontSize: 10 }}>{item.amount_due_to_be_paid ? numeral(item.amount_due_to_be_paid).format('0,0') : '-'}</td>
                                                        <td style={item.subtotal_bu ? { fontWeight: "bold", fontSize: 11 } : null}>{item.subtotal_bu ? numeral(item.subtotal_bu).format('0,0') : ''}</td>
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
                                        {/* <td></td> */}
                                        {/* <td></td> */}
                                        <td style={{ fontSize: 13, fontWeight: "bold" }}>Total</td>
                                        <td style={{ fontSize: 13, fontWeight: "bold" }}>{view && numeral(view.recap.subTotal).format('0,0')}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className='row'>
                        {
                            view && view.process.approval_key && (
                                <div className='col-md-8 mt-2 text-center'>
                                    <QRCodeSVG size={80} height={100} className="mb-2 mt-2" value={`https://farms.brmapps.com/wf/approved/${view.process.approval_key}`} />
                                </div>
                            )
                        }
                    </div>
                    <div className='row'>
                        <div className='col-md-8 mb-3 text-center'>
                            Approval with QR Code
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}


export default PrintBillingTelkomsel