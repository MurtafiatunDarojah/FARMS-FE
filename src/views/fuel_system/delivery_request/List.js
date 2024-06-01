import React, { useEffect, useState } from 'react'
import { CCard, CCardHeader, CCardBody } from '@coreui/react'
import HeaderFarms from 'src/utils/header_farms'
import API from 'src/services'

import { Button, DatePicker, Space } from 'antd';

import { SearchOutlined } from '@ant-design/icons';

import "gridjs/dist/theme/mermaid.css";
import { _ } from 'gridjs-react';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DataGrid, GridToolbarFilterButton } from '@mui/x-data-grid';
import { Report } from 'notiflix';
import moment from 'moment';

let XLSX = require("xlsx");

const ListFuelDelivery = () => {

    const [historyRequest, setHistoryRequest] = useState([])
    const session = useSelector((state) => state.session)
    const [startDate, setStartDate] = useState(moment());
    const [endDate, setEndDate] = useState(moment());
    const [sortModel, setSortModel] = useState([
        {
            field: "name",
            sort: "asc"
        },
    ]);
    const [loading, setLoading] = useState(false)
    const [changePage, setChangePage] = useState(0)

    const dispatch = useDispatch()
    let navigate = useNavigate()

    function search() {

        let startDateFormat = new Date(startDate);
        let endDateFormat = new Date(endDate);

        const savedEndDate = sessionStorage.getItem('endDate');
        const savedStartDate = sessionStorage.getItem('startDate');

        // Set startDate and endDate if they exist in sessionStorage
        if (savedStartDate) {
            startDateFormat = new Date(savedStartDate)
            setStartDate(savedStartDate)
        }
        if (savedEndDate) {
            endDateFormat = new Date(savedEndDate)
            setEndDate(savedEndDate)
        }

        // Set the time part of the dates to 00:00:00 for start date and 23:59:59 for end date
        startDateFormat.setHours(0, 0, 0, 0);
        endDateFormat.setHours(23, 59, 59, 999);

        getHistory(session.accessToken, startDateFormat, endDateFormat)
    }

    function getHistory(accessToken, startDate, endDate) {

        API.HistoryRequestDelivery(HeaderFarms(accessToken), { startDate: startDate, endDate: endDate }).then(res => {

            res.data.forEach((data, index) => {
                data.id = index + 1
                data.operator = data.operator.fullname
                data.date = moment(data.date).format("YYYY-MMM-DD")
                data.time = moment(data.time).format("HH:mm:ss")
            })

            setHistoryRequest(res.data)
        })
            .catch((err) => {
                Report.warning(
                    "Oops.. something wrong",
                    err.message,
                    "Okay"
                );
            });

    }

    function handleStartDateChange(date) {
        setStartDate(date);
        sessionStorage.setItem('startDate', date);
    }

    function handleEndDateChange(date) {
        setEndDate(date);
        sessionStorage.setItem('endDate', date);
    }

    const columns = [
        {
            field: 'record_id',
            headerName: 'Nomor Permintaan',
            width: 190,
            tooltip: 'Nomor Permintaan'
        },
        {
            field: 'date',
            headerName: 'Tanggal Permintaan',
            width: 150,
            tooltip: 'Tanggal Permintaan'
        },
        {
            field: 'time',
            headerName: 'Waktu Permintaan',
            width: 150,
            tooltip: 'Waktu Permintaan'
        },
        {
            field: 'fuel_truck',
            headerName: 'Truk Bahan Bakar',
            width: 150,
            tooltip: 'Truk Bahan Bakar'
        },
        {
            field: 'fuel_type_delivery',
            headerName: 'Jenis Bahan Bakar',
            width: 180,
            tooltip: 'Jenis Bahan Bakar'
        },
        {
            field: 'operator_id',
            headerName: 'ID Operator',
            width: 120,
            tooltip: 'ID Operator'
        },
        {
            field: 'location_storage',
            headerName: 'Lokasi Penyimpanan',
            width: 180,
            tooltip: 'Lokasi Penyimpanan'
        },
        {
            field: 'sounding_after',
            headerName: 'Sounding Sesudah',
            width: 160,
            tooltip: 'Sounding Sesudah'
        },
        {
            field: 'sounding_before',
            headerName: 'Sounding Sebelum',
            width: 160,
            tooltip: 'Sounding Sebelum'
        },
        {
            field: 'tank_kondition',
            headerName: 'Kondisi Tangki',
            width: 150,
            tooltip: 'Kondisi Tangki'
        },
        {
            field: 'quantity_request',
            headerName: 'Jumlah Permintaan',
            width: 160,
            tooltip: 'Jumlah Permintaan'
        },
        {
            field: 'issued_period_date_from',
            headerName: 'Dikeluarkan Dari Tanggal',
            width: 220,
            tooltip: 'Dikeluarkan Dari Tanggal'
        },
        {
            field: 'issued_period_date_to',
            headerName: 'Dikeluarkan Sampai Tanggal',
            width: 230,
            tooltip: 'Dikeluarkan Sampai Tanggal'
        },
        {
            field: 'issued_period_before',
            headerName: 'Periode Sebelumnya Dikeluarkan',
            width: 250,
            tooltip: 'Periode Sebelumnya Dikeluarkan'
        },
        {
            field: 'remaining_fuel_period',
            headerName: 'Sisa Bahan Bakar Periode',
            width: 220,
            tooltip: 'Sisa Bahan Bakar Periode'
        },
        {
            field: 'flowmeter_total',
            headerName: 'Total Flowmeter',
            width: 180,
            tooltip: 'Total Flowmeter'
        },
        {
            field: 'issued_total',
            headerName: 'Total Dikeluarkan',
            width: 160,
            tooltip: 'Total Dikeluarkan'
        },
        {
            field: 'branch',
            headerName: 'Cabang',
            width: 120,
            tooltip: 'Cabang'
        },
    ];

    const onExportExcel = async () => {
        setLoading(true);
        try {
            // Salin data dengan menghilangkan kolom-kolom yang tidak diperlukan
            const exportData = historyRequest.map(item => {
                const { _id, created_at, updated_at, updatedAt,
                    __v, id, ...rest } = item;
                return rest;
            });

            // Mendapatkan nama kolom
            const columnNames = Object.keys(exportData[0]);

            // Hitung panjang teks terpanjang di setiap kolom
            const columnLengths = {};
            columnNames.forEach(key => {
                const headerText = columns.find(col => col.field === key)?.headerName || '';
                const maxCellTextLength = Math.max(headerText.length, ...exportData.map(item => item[key].toString().length));
                columnLengths[key] = maxCellTextLength;
            });

            // Mengonversi nilai tanggal ke format yang diinginkan
            exportData.forEach(item => {
                columnNames.forEach(key => {
                    if (key.includes('date') || key.includes('time')) {
                        const dateValue = moment(item[key]);
                        if (dateValue.isValid()) {
                            item[key] = dateValue.format('YYYY-MM-DD HH:mm');
                        }
                    }
                });
            });

            let wb = XLSX.utils.book_new();
            let ws = XLSX.utils.json_to_sheet(exportData);

            // Mendefinisikan lebar kolom sesuai dengan panjang teks terpanjang
            const wscols = columnNames.map(key => ({ wch: columnLengths[key] }));

            ws['!cols'] = wscols;

            XLSX.utils.book_append_sheet(wb, ws, moment().format('YYYY-MM-DD'));

            XLSX.writeFile(wb, "Fuel_Delivery_Export.xlsx");
        } catch (error) {
            alert("Error during export: " + error.toString());
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (!session) {
            navigate('/login')
        } else {

            setChangePage(parseInt(localStorage.getItem("page_master") || 0))

            let startDateFormat = new Date(startDate);
            let endDateFormat = new Date(endDate);

            // Retrieve startDate and endDate from sessionStorage
            const savedEndDate = sessionStorage.getItem('endDate');
            const savedStartDate = sessionStorage.getItem('startDate');

            // Set startDate and endDate if they exist in sessionStorage
            if (savedStartDate) {
                startDateFormat = new Date(savedStartDate)
                setStartDate(savedStartDate)
            }
            if (savedEndDate) {
                endDateFormat = new Date(savedEndDate)
                setEndDate(savedEndDate)
            }

            // Set the time part of the dates to 00:00:00 for start date and 23:59:59 for end date
            startDateFormat.setHours(0, 0, 0, 0);
            endDateFormat.setHours(23, 59, 59, 999);

            getHistory(session.accessToken, startDateFormat, endDateFormat)

        }
    }, [])

    return (
        <>
            <CCard>
                <CCardHeader>Fuel Delivery</CCardHeader>
                {
                    loading && <Form.Item className='m-4'><CSpinner color="primary" /></Form.Item>
                }
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
                    <Button className="mt-2 m-1" type="primary"
                        onClick={search}
                        size="small">
                        <Space>
                            <SearchOutlined className='ml-2' />
                        </Space>
                        Cari
                    </Button>
                    <Button
                        style={{ marginLeft: 10 }}
                        onClick={() => onExportExcel()}
                    >Export Excel</Button>
                </CCardBody>
                <CCardBody>
                    <DataGrid
                        rows={historyRequest}
                        columns={columns}
                        style={{ fontSize: 12 }}
                        density={"compact"}
                        autoHeight={true}
                        sortModel={sortModel}
                        onSortModelChange={(model) => setSortModel(model)}
                        page={changePage}
                        components={{ Toolbar: GridToolbarFilterButton }}
                        onPageChange={(a) => {
                            setChangePage(a)
                            // save page
                            dispatch({ type: 'page_master', page_master_billing: a })
                        }}
                    />
                </CCardBody>
            </CCard>

        </>
    )
}

export default ListFuelDelivery
