import React, { useEffect, useState } from 'react'
import { CCard, CCardHeader, CCardBody, CSpinner } from '@coreui/react'
import HeaderFarms from 'src/utils/header_farms'
import API from 'src/services'

import { Alert, Button, DatePicker, Popover, Space, Timeline, Tooltip } from 'antd';

import { _ } from 'gridjs-react';
import "gridjs/dist/theme/mermaid.css";

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { SearchOutlined, FileSearchOutlined } from '@ant-design/icons';

import { DataGrid } from '@mui/x-data-grid';
import { Report } from 'notiflix';
import moment from 'moment';

const ListWorkingPermit = () => {

    const [startDate, setStartDate] = useState(moment());
    const [endDate, setEndDate] = useState(moment());
    const [loading, setLoading] = useState(false)
    const [WPList, setWPList] = useState([])

    const session = useSelector((state) => state.session)

    const dispatch = useDispatch()
    let navigate = useNavigate()

    function handleStartDateChange(date) {
        setStartDate(date);
        sessionStorage.setItem('startDate', date);
    }

    function handleEndDateChange(date) {
        setEndDate(date);
        sessionStorage.setItem('endDate', date);
    }

    function search() {
        getListHS()
    }

    const getListHS = () => {

        setLoading(true)

        API.ListWorkingPermit(HeaderFarms(session.accessToken), { startDate: startDate, endDate: endDate }).then(res => {

            setWPList(res.data)
            setLoading(false)

        }).catch(err => {
            console.log(err)
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
        {
            field: 'id_record',
            headerName: "ID Record",
            width: 250,
            renderCell: (data) => {
                return (
                    <Button
                        size='small'
                        type='link'
                        icon={<FileSearchOutlined />}
                        onClick={() => {
                            window.open(`https://farms.brmapps.com/wp/view/${data.row.id_record}`, '_blank');
                        }}
                    >
                        {data.row.id_record}
                    </Button>
                );
            },
        },
        {
            field: 'approver_fullname',
            headerName: "PIC",
            width: 100,
            renderCell: (data) => {

                // Assuming data.approval_process_id.uid.fullname is a valid string
                const approverFullname = data.row.approval_process_id?.uid?.fullname || 'N/A';

                return (
                    <div style={{ textAlign: 'center' }}>
                        <Tooltip
                            title={`${approverFullname}`}
                            style={{ backgroundColor: 'rgba(255, 255, 255, 1)' }}
                        >
                            <span>{approverFullname}</span>
                        </Tooltip>
                    </div>
                );
            }
        },
        {
            field: 'permit_type',
            headerName: "Type Permit",
            width: 100
        },
        {
            field: 'approval_process_id',
            headerName: 'Status Approval',
            width: 130,
            renderCell: (data) => {
                console.log(data)
                let content = (
                    <Timeline style={{ marginTop: 30 }}>
                        {
                            data && data.row.approval_process_id.detail.map(item => {
                                return (
                                    <Timeline.Item key={item._id}>{item.deputy_approver ? `Deputy (${item.deputy_approver})` : item.approved_by.fullname}
                                        <Alert
                                            message={item.status ? `Approved - ${moment(item.approved_at).format('YYYY-MM-DD HH:mm')}` : `Waiting Approval`}
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
                    <Button type="link">{data.value.status}</Button>
                </Popover>)
            }
        },
        {
            field: 'department_name',
            headerName: "Department",
            width: 100,
            renderCell: (data) => {
                return (
                    <>
                        <Tooltip
                            title={data.row.department_name}
                            style={{ backgroundColor: 'rgba(255, 255, 255, 1)' }}
                        >
                            <span>{data.row.department_name}</span>
                        </Tooltip>
                    </>
                )
            }
        },
        {
            field: 'activity_description',
            headerName: "Activity",
            width: 180,
            renderCell: (data) => {
                return (
                    <>
                        <Tooltip
                            style={{ backgroundColor: 'rgba(255, 255, 255, 1)' }}
                            title={data.row.activity_description}>
                            <span>{data.row.activity_description}</span>
                        </Tooltip>
                    </>
                )
            }
        },
        {
            field: 'status',
            headerName: "Permit status",
            width: 100
        },
        {
            field: 'execution_period',
            headerName: "Execution Period",
            width: 180,
            renderCell: (data) => {
                // Assuming data.row.execution_time, data.row.job_start_time, and data.row.job_end_time are valid date strings
                const executionTime = moment(data.row.execution_time).format('MMM D, YYYY');
                const jobStartTime = moment(data.row.job_start_time).format('HH:mm A');
                const jobEndTime = moment(data.row.job_end_time).format('HH:mm A');

                const formattedExecutionPeriod = `${executionTime} (${jobStartTime} - ${jobEndTime})`;

                return (
                    <div style={{ textAlign: 'center' }}>
                        <Tooltip
                            title={formattedExecutionPeriod}
                            style={{ backgroundColor: 'rgba(255, 255, 255, 1)' }}
                        >
                            <span>{formattedExecutionPeriod}</span>
                        </Tooltip>
                    </div>
                );
            }
        },
        {
            field: 'created_at',
            headerName: "Created at",
            width: 100,
            renderCell: (data) => {
                // Assuming data.row.created_at is a valid Date object
                const formattedDate = moment(data.row.created_at).format('YYYY-MM-DD');

                return (
                    <>
                        <div style={{ textAlign: 'center' }}>
                            <Tooltip
                                title={formattedDate}
                                style={{ backgroundColor: 'rgba(255, 255, 255, 1)' }}
                            >
                                <span>{formattedDate}</span>
                            </Tooltip>
                        </div>
                    </>
                );
            }
        },
    ];

    useEffect(() => {
        if (!session) {
            navigate('/login')
        } else {

            // Retrieve startDate and endDate from sessionStorage
            const savedEndDate = sessionStorage.getItem('endDate');
            const savedStartDate = sessionStorage.getItem('startDate');

            // Set startDate and endDate if they exist in sessionStorage
            if (savedStartDate) {
                setStartDate(new Date(savedStartDate));
            }
            if (savedEndDate) {
                setEndDate(new Date(savedEndDate));
            }

        }
    }, [])

    return (
        <>
            <CCard>
                <CCardHeader> Working Permit </CCardHeader>
                <CCardBody style={{ marginBottom: -10, width: "100%" }}>
                    <DatePicker
                        size="small"
                        className="m-1"
                        onChange={handleStartDateChange}
                        placeholder="Select Date"
                        value={moment(startDate)}
                        allowClear={false}
                    />
                    <DatePicker
                        size="small"
                        className="m-1"
                        onChange={handleEndDateChange}
                        placeholder="End Date"
                        value={moment(endDate)}
                        allowClear={false}
                    />
                    <Button className="mt-2 m-1" type="primary" onClick={search} size="small">
                        <Space>
                            <SearchOutlined className='ml-2' />
                        </Space>
                        Cari
                    </Button>
                </CCardBody>
                <CCardBody style={{ height: '400px' }}>
                    {
                        loading && <CSpinner color="primary" />
                    }
                    <DataGrid
                        rows={WPList}
                        columns={columns}
                        pageSize={100}
                        style={{ fontSize: 12 }}
                        density={"compact"}
                        initialState={{
                            sorting: {
                                sortModel: [{ field: 'report_date', sort: 'asc' }],
                            },
                        }}
                    />
                </CCardBody>
            </CCard>
        </>
    )

}

export default ListWorkingPermit
