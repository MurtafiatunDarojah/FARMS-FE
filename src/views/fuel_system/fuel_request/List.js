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

const ListFuelRequest = () => {

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

        API.HistoryRequestFuel(HeaderFarms(accessToken), { startDate: startDate, endDate: endDate }).then(res => {

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
            headerName: 'Date',
            width: 100,
            tooltip: 'Tanggal Permintaan'
        },
        {
            field: 'time',
            headerName: 'Time',
            width: 90,
            tooltip: 'Waktu Permintaan'
        },
        {
            field: 'operator_id',
            headerName: 'ID Operator',
            width: 90,
            tooltip: 'ID Operator'
        },
        {
            field: 'hull_number',
            headerName: 'Nomor Lambung',
            width: 130,
            tooltip: 'Nomor Lambung'
        },
        {
            field: 'equipment_name',
            headerName: 'Nama Alat',
            width: 250,
            tooltip: 'Nama Alat'
        },
        {
            field: 'equipment_owner',
            headerName: 'Owner',
            width: 200,
            tooltip: 'Pemilik Alat'
        },
        {
            field: 'category',
            headerName: 'Kategory',
            width: 200,
            tooltip: 'Kategory'
        },
        {
            field: 'fuel_type',
            headerName: 'Jenis Bahan Bakar',
            width: 150,
            tooltip: 'Jenis Bahan Bakar'
        },
        {
            field: 'kilometer',
            headerName: 'Kilometer',
            width: 100,
            tooltip: 'Kilometer'
        },
        {
            field: 'hourmeter',
            headerName: 'Hourmeter',
            width: 100,
            tooltip: 'Hourmeter'
        },
        {
            field: 'amount_submitted',
            headerName: 'Jumlah Diajukan',
            width: 120,
            tooltip: 'Jumlah Diajukan'
        },
        {
            field: 'amount_issued',
            headerName: 'Jumlah Dikeluarkan',
            width: 130,
            tooltip: 'Jumlah Dikeluarkan'
        },
        {
            field: 'location',
            headerName: 'Lokasi',
            width: 150,
            tooltip: 'Lokasi'
        },
    ];

    const onExportExcel = async () => {
        setLoading(true);
        try {
            // Mendapatkan array dari semua nama kolom yang dibutuhkan
            const requiredColumns = ['record_id', 'date', 'time', 'operator_id', 'category', 'hull_number', 'equipment_name', 'equipment_owner', 'fuel_type', 'kilometer', 'hourmeter', 'amount_submitted', 'amount_issued', 'location', 'created_by'];

            // Menghasilkan salinan data yang hanya berisi kolom yang dibutuhkan
            const filteredData = historyRequest.map(item => {
                const filteredItem = {};
                requiredColumns.forEach(column => {
                    filteredItem[column] = item[column] !== undefined && item[column] !== null ? item[column].toString() : ''; // Periksa apakah nilai tidak terdefinisi atau null sebelum mencoba mengonversi menjadi string
                });
                return filteredItem;
            });

            let wb = XLSX.utils.book_new();
            let ws = XLSX.utils.json_to_sheet(filteredData);

            // Mendefinisikan kolom-kolom dengan lebar sesuai dengan panjang teks maksimum
            const columnWidths = {};
            requiredColumns.forEach(column => {
                columnWidths[column] = Math.max(...filteredData.map(item => item[column].length)) + 2; // Jangan panggil toString() di sini, karena semua nilai telah dikonversi menjadi string di atas
            });

            const wscols = requiredColumns.map(column => ({ wch: columnWidths[column] }));

            // Mengatur lebar kolom
            ws['!cols'] = wscols;

            // Menambahkan sheet ke workbook dengan nama yang sesuai
            XLSX.utils.book_append_sheet(wb, ws, moment(startDate).format('YYYY-MM'));

            // Menulis file Excel dengan nama yang sesuai
            XLSX.writeFile(wb, "Fuel_Request_Export.xlsx");
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
                <CCardHeader>Fuel Requests</CCardHeader>
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

export default ListFuelRequest
