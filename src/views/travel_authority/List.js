import { CCard, CCardHeader, CCardBody, CSpinner } from '@coreui/react'
import React, { useEffect, useState } from 'react'
import HeaderFarms from 'src/utils/header_farms'
import API from 'src/services'

import { Alert, Button, DatePicker, Form, Popover, Select, Timeline, Tooltip } from 'antd';

import { _ } from 'gridjs-react';
import "gridjs/dist/theme/mermaid.css";

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FileSearchOutlined } from '@ant-design/icons';
import { DataGrid, GridToolbarFilterButton } from '@mui/x-data-grid';
import { Report } from 'notiflix';
import moment from 'moment';

let XLSX = require("xlsx");

const ListTravelAuthority = () => {

    const [ListTravelAuthority, setTravelAuthority] = useState([])
    const [filterCurrent, setFilterCurrent] = useState('Approved')
    const [periode, setPeriode] = useState(localStorage.getItem('periode_date_ta'))
    const [loading, setLoading] = useState(false)

    const [sumWaiting, setSumWaiting] = useState(0)
    const [sumApproved, setSumApproved] = useState(0)

    const session = useSelector((state) => state.session)

    const dispatch = useDispatch()
    let navigate = useNavigate()

    const filterListHandler = (e) => {
        setFilterCurrent(e)
    }

    const onChange = (_, dateString) => {
        setPeriode(dateString)
        localStorage.setItem("periode_date_ta", dateString)
        setLoading(true)
    };

    const getListSR = () => {

        API.ListTravelAuthority(HeaderFarms(session.accessToken), periode).then(res => {

            let DTO = []
            let sumApprovedIn = 0
            let sumWaitingIn = 0

            res.data.forEach(i => {

                const joinedNames = i.t_ta_user_dtl.map(employee => employee.muser?.fullname.trim()).join(', ');

                if ((filterCurrent === i.approval_process_id.status) || i.approval_process_id.status === "Closed") {
                    DTO.push({
                        id: i._id,
                        status: i.approval_process_id.status,
                        traveller: joinedNames,
                        form_record: i.id_record,
                        type_travel: i.type_travel,
                        created_by: i.approval_process_id.uid.fullname,
                        created_at: i.created_at,
                        unit: i.approval_process_id.uid.company.code,
                        dispather: i.dispatcher_ta && i.dispatcher_ta.fullname,
                        detail: i.approval_process_id.detail
                    })
                }

                if (i.approval_process_id.status === 'Approved') {
                    sumApprovedIn++
                }

                if (i.approval_process_id.status === 'Waiting Approval') {
                    sumWaitingIn++
                }

            });

            setSumWaiting(sumWaitingIn)
            setSumApproved(sumApprovedIn)

            setTravelAuthority(DTO)

            setLoading(false)

        }).catch(err => {
            console.log(err)
            if (err.response) {
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
            } else {
                Report.warning(
                    "Oops.. something wrong",
                    err.toString(),
                    "Okay"
                );
            }
        })
    }

    async function processTravelAuthorities() {
        try {
            let DTOS = [];

            await Promise.all(ListTravelAuthority.map(async TA => {
                let { data: { t_ta_user_dtl: travellers, approval_process_id } } = await API.viewTA(HeaderFarms(session.accessToken), TA.form_record);

                travellers.map(traveller => {
                    DTOS.push({
                        'Employee Name': traveller.user_id.fullname,
                        'Employee ID': traveller.user_id?.nik || "-",
                        'Department': traveller.user_id.department?.fullname,
                        'Level': traveller.user_id.level.fullname,
                        'Branch': traveller.user_id.company.code,
                        'Expense Type': traveller.expense_type,
                        'Reason Travel': traveller.reason_for_travel,
                        'Site': traveller.site || "-",
                        'Departure Date': moment(traveller.departure_date_start || traveller.fieldbreak_date_start).format('YYYY-MM-DD'),
                        'Return Date': moment(traveller.departure_date_end || traveller.fieldbreak_date_end).format('YYYY-MM-DD'),
                        'From Destination': traveller.t_ta_rsv_dst_dtl[0]?.from,
                        'To Destination': traveller.t_ta_rsv_dst_dtl[0]?.to,
                        'Approval Status': approval_process_id.status,
                        'Remarks': traveller.objective
                    });
                });
            }));

            return DTOS

        } catch (error) {
            console.error('Error processing travel authorities:', error);
        }
    }

    const onExportExcel = async () => {
        setLoading(true);

        try {
            let exportTSList = await processTravelAuthorities();

            let wb = XLSX.utils.book_new();
            let ws = XLSX.utils.json_to_sheet(exportTSList);

            var wscols = [
                { wch: 32 },
                { wch: 20 },
                { wch: 30 },
                { wch: 15 },
                { wch: 10 },
                { wch: 15 },
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                { wch: 20 },
                { wch: 10 },
                { wch: 50 },
            ];

            ws['!cols'] = wscols;

            XLSX.utils.book_append_sheet(wb, ws, moment(periode, 'YYYY-MM').format('YYYY-MM'));

            XLSX.writeFile(wb, "Travel Authority Export - " + moment(periode, 'YYYY-MM').format('YYYY-MM') + ".xlsx");
        } catch (error) {
            alert("Error during export :" + error.toString());
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            field: 'id',
            headerName: 'Action',
            width: 100,
            renderCell: (data) => {
                return (
                    <>
                        <Button size='small' style={{ margin: "auto" }} type='primary' icon={<FileSearchOutlined />} onClick={() => { navigate('/travel-authority/' + data.row.form_record) }}>View</Button>
                    </>
                )
            }
        },
        {
            field: 'form_record',
            headerName: 'Record ID',
            width: 200
        },
        {
            field: 'traveller',
            headerName: 'Travellers',
            width: 300
        },
        // {
        //     field: 'type_travel',
        //     headerName: 'Type Travel',
        //     width: 100
        // },
        {
            field: 'status',
            headerName: 'Status',
            width: 140,
            renderCell: (data) => {
                let content = (
                    <Timeline style={{ marginTop: 30 }}>
                        {
                            data && data.row.detail.map(item => {
                                return (
                                    <Timeline.Item >{item.approved_by.fullname}
                                        <Alert
                                            message={item.status ? 'Approved' : 'Waiting Approval'}
                                            className='mt-1 p-1'
                                            type={item.status ? 'success' : 'warning'}
                                            showIcon
                                        />
                                    </Timeline.Item>
                                )
                            })
                        }
                    </Timeline>
                )

                return (<Popover content={content} title="Process" trigger="click">
                    <Button type="link">{data.value}</Button>
                </Popover>)
            }
        },
        {
            field: 'created_by',
            headerName: 'Created by',
            width: 180,
            renderCell: (data) => {
                return <Tooltip placement="top" title={data.value}>{data.value}</Tooltip>
            }
        },
        {
            field: 'dispather',
            headerName: 'Dispatcher',
            width: 100,
            renderCell: (data) => {
                return <Tooltip placement="top" title={data.value}>{data.value}</Tooltip>
            }
        },
        {
            field: 'unit',
            headerName: 'Unit',
            width: 100
        },
        {
            field: 'created_at',
            headerName: 'Created at',
            width: 100,
            renderCell: (data) => {
                return moment(data.value).format('YYYY-MM-DD')
            }

        },
    ];

    useEffect(() => {

        if (!session) {
            navigate('/login')
        } else {

            if (periode) {
                getListSR()
            }
        }

    }, [filterCurrent, periode])

    return (
        <>
            <CCard>
                <CCardHeader>List Travel Authority</CCardHeader>
                <CCardBody style={{ marginBottom: -10, display: "flex" }}>

                    {
                        loading && <Form.Item className='m-4'><CSpinner color="primary" /></Form.Item>
                    }

                    <Form.Item>
                        <Select
                            defaultValue={filterCurrent}
                            style={{
                                width: 130,
                            }}
                            onChange={filterListHandler}
                        >
                            <Option value="Waiting Approval">Waiting ({sumWaiting})</Option>
                            <Option value="Approved">Approved ({sumApproved})</Option>
                            <Option value="Reject">Reject</Option>
                            <Option value="Closed">Closed</Option>
                            <Option value="Cancel">Cancel</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item style={{ marginLeft: 20 }}>
                        <DatePicker
                            size={'middle'}
                            defaultValue={periode ? moment(periode, 'YYYY-MM') : null}
                            onChange={onChange}
                            picker="month"
                            allowClear={false}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button style={{ marginLeft: 10 }} onClick={() => onExportExcel()}>Export Excel</Button>
                    </Form.Item>
                </CCardBody>
                <CCardBody style={{ height: '400px' }}>
                    <DataGrid
                        components={{ Toolbar: GridToolbarFilterButton }}
                        rows={ListTravelAuthority}
                        columns={columns}
                        pageSize={100}
                        rowsPerPageOptions={[100]}
                        style={{ fontSize: 12 }}
                        density={"compact"}
                        initialState={{
                            sorting: {
                                sortModel: [{ field: 'created_at', sort: 'desc' }],
                            },
                        }}
                    />
                </CCardBody>
            </CCard>
        </>
    )
}

export default ListTravelAuthority
