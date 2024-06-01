import React, { useEffect, useState } from 'react';
import { CCard, CCardHeader, CCardBody, CSpinner } from '@coreui/react';
import HeaderFarms from 'src/utils/header_farms';
import API from 'src/services';
import { Button, Form, Select, Tooltip, Switch } from 'antd';
import { _ } from 'gridjs-react';
import "gridjs/dist/theme/mermaid.css";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FileSearchOutlined } from '@ant-design/icons';
import { DeleteOutlined } from '@ant-design/icons';
import { DeleteHias } from 'src/services';
import { DataGrid } from '@mui/x-data-grid';
import { Report } from 'notiflix';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import moment from 'moment';

let XLSX = require("xlsx");

const { Option } = Select;

const ListHias = () => {
  const [HiasList, setHiasList] = useState([]);
  const [filterCurrent, SetFilterCurrent] = useState('All');
  const [isEncrypted, setIsEncrypted] = useState(true); // State for encryption switch

  const session = useSelector((state) => state.session);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  let navigate = useNavigate();

  const filterListHandler = (e) => {
    SetFilterCurrent(e);
  };

  const onExportExcel = () => {
    setLoading(true);
    try {
      const exportData = HiasList.map(item => {
        const { _id, createdAt, updatedAt, __v, id, report_date, updated_by, created_by, ...rest } = item;
        return { report_date: moment(report_date).format('YYYY-MM-DD HH:mm'), ...rest };
      });

      const columnLengths = {};
      exportData.forEach(item => {
        for (let key in item) {
          if (item[key] !== undefined && item[key] !== null) {
            const cellText = item[key].toString();
            if (!columnLengths[key] || cellText.length > columnLengths[key]) {
              columnLengths[key] = cellText.length;
            }
          }
        }
      });

      let wb = XLSX.utils.book_new();
      let ws = XLSX.utils.json_to_sheet(exportData);
      const wscols = Object.keys(columnLengths).map(key => ({ wch: columnLengths[key] }));
      ws['!cols'] = wscols;
      ws['!margins'] = { left: 1.0, right: 1.0, top: 1.0, bottom: 1.0 };
      ws['!autofilter'] = { ref: `A1:${String.fromCharCode(65 + Object.keys(columnLengths).length - 1)}${exportData.length + 1}` };

      XLSX.utils.book_append_sheet(wb, ws, moment().format('YYYY-MM-DD'));
      XLSX.writeFile(wb, "HIAS Export - " + moment().format('YYYY-MM-DD') + ".xlsx");
    } catch (error) {
      alert("Error during export: " + error.toString());
    } finally {
      setLoading(false);
    }
  };

  const getListHS = async () => {
    try {
      const res = await API.ListHias(HeaderFarms(session.accessToken));

      let data;
      if (filterCurrent === 'All') {
        data = res.data;
      } else {
        data = res.data.filter(a => a.information_category === filterCurrent);
      }

      data.forEach(hias => {
        hias.id_record_encrypted = CryptoJS.AES.encrypt(hias.record_id, 'secret key 123').toString();
        hias.id_record_decrypted = hias.record_id;
        hias.employee_id_encrypted = CryptoJS.AES.encrypt(hias.employee_id, 'secret key 123').toString();
        hias.employee_id_decrypted = hias.employee_id;
        hias.reporter_name_encrypted = CryptoJS.AES.encrypt(hias.reporter_name, 'secret key 123').toString();
        hias.reporter_name_decrypted = hias.reporter_name;
        hias.current_company_encrypted = CryptoJS.AES.encrypt(hias.current_company, 'secret key 123').toString();
        hias.current_company_decrypted = hias.current_company;
        hias.information_category_encrypted = CryptoJS.AES.encrypt(hias.information_category, 'secret key 123').toString();
        hias.information_category_decrypted = hias.information_category;
      });

      setHiasList(data);

    } catch (err) {
      console.log(err);
      if (err.response.status === 401) {
        dispatch({ type: 'set', session: null });
        navigate('/login');
      } else if (err.response.status === 403) {
        navigate('/');
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
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await DeleteHias(id);
      setHiasList((prevList) => prevList.filter((item) => item.id !== id));
      setLoading(false);
      Report.success('Data deleted successfully', '', 'OK');
    } catch (error) {
      setLoading(false);
      Report.failure('Failed to delete data', error.message, 'OK');
    }
  };
  

  const columns = [
    {
      field: 'id_record',
      headerName: "ID Record",
      width: 220,
      renderCell: (data) => {
        return isEncrypted ? data.row.id_record_encrypted : data.row.id_record_decrypted;
      }
    },
    {
      field: 'employee_id',
      headerName: "Employee Id",
      width: 130,
      renderCell: (data) => {
        return isEncrypted ? data.row.employee_id_encrypted : data.row.employee_id_decrypted;
      }
    },
    {
      field: 'information_category',
      headerName: "Category",
      width: 120,
      renderCell: (data) => {
        return isEncrypted ? data.row.information_category_encrypted : data.row.information_category_decrypted;
      }
    },
    {
      field: 'reporter_name',
      headerName: 'Reporter',
      width: 190,
      renderCell: (data) => {
        return isEncrypted ? data.row.reporter_name_encrypted : data.row.reporter_name_decrypted;
      }
    },
    {
      field: 'current_company',
      headerName: 'Company',
      width: 90,
      renderCell: (data) => {
        return isEncrypted ? data.row.current_company_encrypted : data.row.current_company_decrypted;
      }
    },
    {
      field: 'report_date',
      headerName: 'Report Date',
      width: 120,
      renderCell: (data) => {
        return <Tooltip placement="top" title={data.value}>{moment(data.value).format('YYYY-MM-DD HH:mm')}</Tooltip>;
      }
    },
    {
      field: 'id',
      headerName: 'Action',
      width: 200,
      renderCell: (data) => {
        return (
          <>
          <Button size='small' type='primary' icon={<FileSearchOutlined />} onClick={() => { navigate('/hias/' + data.row._id); }}>View</Button>
          <Button type="danger" icon={<DeleteOutlined />} onClick={() => handleDelete(data.id)} loading={loading} // Set loading prop untuk menampilkan loading state saat proses penghapusan berlangsung
      >
      </Button>
        </>
        );
      }
    },
  ];

  useEffect(() => {
    if (!session) {
      navigate('/login');
    } else {
      getListHS();
    }
  }, [filterCurrent]);

  return (
    <>
      <CCard>
        <CCardHeader> List Hias Information </CCardHeader>
        <CCardBody style={{ marginBottom: -10, display: "flex", alignItems: "center" }}>
          {loading && <Form.Item className='m-4'><CSpinner color="primary" /></Form.Item>}
          <Form.Item>
            <Select
              defaultValue={filterCurrent}
              style={{ width: 130 }}
              onChange={filterListHandler}
            >
              <Option value="All">All</Option>
              <Option value="Saran">Saran</Option>
              <Option value="Ketidaksesuaian">Ketidaksesuaian</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button style={{ marginLeft: 10 }} onClick={() => onExportExcel()}>Export Excel</Button>
          </Form.Item>
          <Form.Item style={{ marginLeft: 20 }} label="Encrypted">
            <Switch checked={isEncrypted} onChange={() => setIsEncrypted(!isEncrypted)} />
          </Form.Item>
        </CCardBody>
        <CCardBody style={{ height: '400px' }}>
          <DataGrid
            rows={HiasList}
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
  );
};

export default ListHias;
