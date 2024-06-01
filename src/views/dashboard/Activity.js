import { useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import API from 'src/services';

import { Button, DatePicker, Skeleton, Space, Statistic, Table } from 'antd';
import { Line, Bar, Pie } from '@ant-design/charts';
import HeaderFarms from 'src/utils/header_farms';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Report } from 'notiflix';

const Dashboard = () => {

    const session = useSelector((state) => state.session)
    const { RangePicker } = DatePicker;
    let navigate = useNavigate()

    const [loading, setLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [activityUser, setActivityUser] = useState([])
    const [mostUsedService, setMostUsedService] = useState([])
    const [mostUserRequest, setMostUserRequest] = useState([])
    const [mostUnitRequest, setMostUnitRequest] = useState([])
    const [mostOsMostRequest, setMostOsMostRequest] = useState([])
    const [mostMethodRequest, setMostMethodRequest] = useState([])
    const [mostBrowserRequest, setMostBrowserRequest] = useState([])
    const [trafficRequest, setTrafficRequest] = useState([])


    const handleDateChange = (date, dateString) => {
        setSelectedDate(date);
    };

    const getDataTraffic = async () => {
        try {

            let result = await API.GetTrafficRequest(HeaderFarms(session.accessToken));

            setTrafficRequest(result.data);

        } catch (err) {
            console.log(err);
            //return navigate("/")

        }
    }

    const getDataActivity = async () => {
        try {
            let result = await API.GetActivityUsers(HeaderFarms(session.accessToken));

            const rowsWithId = result.data.map((row, index) => ({ ...row, id: index + 1 }));
            setActivityUser(rowsWithId);
        } catch (err) {
            console.log(err);
            //return navigate("/")
        }
    }

    const getDataMostUsedService = async () => {
        try {
            let result = await API.GetMostUsedService(HeaderFarms(session.accessToken));

            setMostUsedService(result.data)

        } catch (err) {
            console.log(err);
            //return navigate("/")
        }
    }

    const getDataMostMethodRequest = async () => {
        try {
            let result = await API.GetMostMethodRequest(HeaderFarms(session.accessToken));

            setMostMethodRequest(result.data)

        } catch (err) {
            console.log(err);
            //return navigate("/")
        }
    }

    const getDataOsMostORequest = async () => {
        try {
            let result = await API.GetMostOsRequest(HeaderFarms(session.accessToken));

            setMostOsMostRequest(result.data)

        } catch (err) {
            console.log(err);
            return navigate("/")
        }
    }

    const getDataBrowserMostORequest = async () => {
        try {
            let result = await API.GetMostBrowserRequest(HeaderFarms(session.accessToken));

            setMostBrowserRequest(result.data)

        } catch (err) {
            console.log(err);
            //return navigate("/")
        }
    }

    const getDataBrowserMostUserRequest = async () => {
        try {
            let result = await API.GetMostUserRequest(HeaderFarms(session.accessToken));

            setMostUserRequest(result.data)

        } catch (err) {
            console.log(err);
            //return navigate("/")
        }
    }

    const getDataBrowserMostUnitRequest = async () => {
        try {
            let result = await API.GetMostUnitRequest(HeaderFarms(session.accessToken));

            setMostUnitRequest(result.data)

        } catch (err) {
            console.log(err);
            //return navigate("/")
        }
    }

    const LineChartConfigUnit = {
        data: trafficRequest,
        xField: (d) => new Date(d.time_request),
        yField: 'count',
        sizeField: 'count',
        shapeField: 'trail',
        legend: { size: false, color: true, layout: { marginBottom: 10 } },
        colorField: 'companyFullName',
        height: 300,
        title: 'Lalu lintas Pengguna Per-Hari'
    };

    const BarChartConfigMostUsedApp = {
        data: mostUsedService,
        xField: 'appName',
        yField: 'count',
        height: 300,
        responsive: true,
        title: 'Penggunaan Layanan Terbanyak'
    };

    const BarChartConfigMostUnitApp = {
        data: mostUnitRequest,
        xField: 'appName',
        yField: 'count',
        colorField: 'companyFullName',
        height: 300,
        responsive: true,
        stack: true,
        title: 'Penggunaan Layanan Per-Unit'
    };

    const BarChartMostUser = {
        data: mostUserRequest,
        xField: '_id',
        yField: 'count',
        height: 300,
        responsive: true,
        title: 'Penggunaan 10 User Terbanyak'
    };

    const pieChartConfigMostMethodRequest = {
        data: mostMethodRequest,
        angleField: 'count',
        colorField: 'method',
        height: 300,
        responsive: true,
        label: {
            text: 'method',
            style: {
                fontWeight: 'bold',
            },
        },
        tooltip: {
            formatter: (datum) => ({ name: datum.method, value: datum.count }),
        },
        legend: {
            layout: 'vertical',
            position: 'right',
        },
        title: 'HTTP Request Method',
    };

    const pieChartConfigMostOsRequest = {
        data: mostOsMostRequest,
        angleField: 'count',
        colorField: 'os',
        height: 300,
        responsive: true,
        label: {
            text: 'os',
            style: {
                fontWeight: 'bold',
            },
        },
        tooltip: {
            formatter: (datum) => ({ name: datum.os, value: datum.count }),
        },
        legend: {
            layout: 'vertical',
            position: 'right',
        },
        title: 'Operating System',
    };

    const pieChartConfigMostBrowserRequest = {
        data: mostBrowserRequest,
        angleField: 'count',
        colorField: 'browser',
        height: 300,
        responsive: true,
        label: {
            text: 'browser',
            style: {
                fontWeight: 'bold',
            },
        },
        tooltip: {
            formatter: (datum) => ({ name: datum.browser, value: datum.count }),
        },
        legend: {
            layout: 'vertical',
            position: 'right',
        },
        title: 'Browser',
    };

    const getColumnWidth = (fieldName) => {
        // Mendapatkan nilai terpanjang dalam kolom
        const maxLength = Math.max(...activityUser.map(row => String(row[fieldName]).length));
        // Menambahkan margin agar lebih legible
        const margin = 20;
        // Menambahkan lebar minimum agar kolom tidak terlalu kecil
        const minWidth = 100;
        // Menghitung lebar berdasarkan panjang nilai dan menambahkan margin
        return Math.max(minWidth, maxLength * 8 + margin);
    };

    const columns = [
        {
            headerName: 'Date',
            field: 'time_request',
            width: 140,
            key: 'time_request',
            renderCell: (params) => {
                const date = new Date(params.value);
                return date.toLocaleString();
            }
        },
        {
            headerName: 'App',
            field: 'appName',
            width: getColumnWidth('appName'),
            key: 'appName'
        },
        {
            headerName: 'URL',
            field: 'url',
            width: 250,
            key: 'url'
        },
        {
            headerName: 'NIK',
            field: 'nik',
            width: getColumnWidth('nik'),
            width: 80,
            key: 'nik'
        },
        {
            headerName: 'Email',
            field: 'email',
            width: 140,
            key: 'email'
        },
        {
            headerName: 'Page',
            field: 'page',
            width: getColumnWidth('page'),
            key: 'page'
        },
        {
            headerName: 'Browser',
            field: 'browser',
            width: getColumnWidth('browser'),
            key: 'browser'
        },
        {
            headerName: 'Method',
            field: 'method',
            width: getColumnWidth('method'),
            key: 'method'
        },
        {
            headerName: 'OS',
            field: 'os',
            width: getColumnWidth('os'),
            key: 'os'
        },
    ];

    useEffect(() => {
        if (!session) {
            return navigate('/login')
        } else {
            const fetchData = async () => {
                setLoading(true);
                await getDataOsMostORequest();
                await getDataMostUsedService();
                await getDataMostMethodRequest();
                await getDataBrowserMostORequest();
                await getDataBrowserMostUnitRequest();
                await getDataBrowserMostUserRequest();
                await getDataActivity()
                await getDataTraffic()
                setLoading(false);
                setDataLoaded(true);
            };

            fetchData();

            const interval = setInterval(fetchData, 300000);

            return () => clearInterval(interval);
        }
    }, []);

    return (
        <div className="container-fluid" style={{ backgroundColor: '#f0f0f0' }}>
            {/* <div className="row mb-2">
                <div className="col-sm-12">
                    <Space direction="vertical" style={{ marginBottom: 16 }}>
                        <Space direction="horizontal">
                            <RangePicker />
                            <Button type="primary" onClick={null}>Load Data</Button>
                        </Space>
                    </Space>
                </div>
            </div> */}
            <div className="row mb-2">
                <div className="col-sm-6">
                    <div className="online-users p-0" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                        {loading && !dataLoaded ? (
                            <Skeleton active style={{ padding: '20px' }} />
                        ) : (
                            <Line {...LineChartConfigUnit} />
                        )}
                    </div>
                </div>
                <div className="col-sm-6 mb-4">
                    <div className="bar-chart" style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                        {loading && !dataLoaded ? (
                            <Skeleton active style={{ padding: '20px' }} />
                        ) : (
                            <Bar {...BarChartConfigMostUnitApp} />
                        )}
                    </div>
                </div>
            </div>
            <div className="row mb-4">
                <div className="col-sm-6 mb-4">
                    <div className="bar-chart" style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                        {loading && !dataLoaded ? (
                            <Skeleton active style={{ padding: '20px' }} />
                        ) : (
                            <Bar {...BarChartConfigMostUsedApp} />
                        )}
                    </div>
                </div>
                <div className="col-sm-6">
                    <div className="bar-chart" style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                        {loading && !dataLoaded ? (
                            <Skeleton active style={{ padding: '20px' }} />
                        ) : (
                            <Bar {...BarChartMostUser} />
                        )}
                    </div>
                </div>
            </div>
            <div className='row mb-2'>
                <div className="col-sm-12">
                    <div className="user-activity p-3"
                        style={{
                            backgroundColor: '#fff', padding: '20px',
                            borderRadius: '10px',
                            marginBottom: '20px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}>

                        {loading && !dataLoaded ? (
                            <Skeleton active style={{ padding: '20px' }} />
                        ) : (
                            <>
                                <h5 className='mb-3'>Aktivitas Pengguna</h5>
                                <DataGrid
                                    rows={activityUser}
                                    columns={columns}
                                    pageSize={5}
                                    style={{ fontSize: 12 }}
                                    density={"compact"}
                                    autoHeight={true}
                                    sortModel={[
                                        {
                                            field: 'time_request',
                                            sort: 'desc',
                                        },
                                    ]}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="row mb-4">
                <div className="col-sm-4 mb-4">
                    <div className="pie-chart" style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                        {loading && !dataLoaded ? (
                            <Skeleton active style={{ padding: '20px' }} />
                        ) : (
                            <Pie {...pieChartConfigMostMethodRequest} />
                        )}
                    </div>
                </div>
                <div className="col-sm-4 mb-4">
                    <div className="pie-chart" style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                        {loading && !dataLoaded ? (
                            <Skeleton active style={{ padding: '20px' }} />
                        ) : (
                            <Pie {...pieChartConfigMostOsRequest} />
                        )}
                    </div>
                </div>
                <div className="col-sm-4 mb-4">
                    <div className="pie-chart" style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                        {loading && !dataLoaded ? (
                            <Skeleton active style={{ padding: '20px' }} />
                        ) : (
                            <Pie {...pieChartConfigMostBrowserRequest} />
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Dashboard;
