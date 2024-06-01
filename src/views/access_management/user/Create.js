import { CCard, CCardBody, CCardHeader } from "@coreui/react"
import { Alert, AutoComplete, Button, Form, Input, Radio, Select } from "antd"
import { RollbackOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Notiflix, { Block } from "notiflix";

import HeaderFarms from "src/utils/header_farms";
import API from "src/services";

const CreateUser = () => {

    const session = useSelector((state) => state.session)

    const [form] = Form.useForm();
    const [optionsEmployee, setOptionsEmployee] = useState([]);
    const [optionsDirectSpv, setOptionsDirectSpv] = useState([]);

    let navigate = useNavigate()
    let { id } = useParams();

    const onFinish = (
        values
    ) => {
        if (!id)
            saveEmployee(
                values
            )
        else
            updateEmployee(
                values
            )
    };

    const saveEmployee = async (values) => {
        try {

            await API.CreateUser(
                HeaderFarms(session.accessToken),
                values
            );

            Notiflix.Notify.success('Create Success');
            navigate('/users');

        } catch (err) {
            console.log(err)
            if (err.response.status === 400) {
                err.response.error.forEach(item => {
                    Notiflix.Report.info(item.name);
                });
            } else {
                err.response.error.forEach(item => {
                    Notiflix.Report.info(item.name);
                });
            }
        }
    };


    const updateEmployee = async (values) => {
        try {

            await API.UpdateUser(
                HeaderFarms(session.accessToken),
                values,
                id
            );

            Notiflix.Notify.success('Create Success');
            navigate('/users');

        } catch (err) {
            Notiflix.Report.info(err.toString());
        }
    }

    const getEmployeeDetailFromUsers = async () => {
        try {

            await renderOptionsDirectSpv()

            const res = await API.DetailUser(
                HeaderFarms(session.accessToken),
                id
            );

            form.setFieldsValue({
                fullname: res.data.fullname,
                position: res.data.position,
                phone_number: res.data.phone_number,
                email: res.data.email,
                company: res.data.company.code,
                nik: res.data.nik,
                direct_spv: res.data.direct_spv[0].nik,
                roles: res.data.roles[0]
            });


        } catch (error) {
            console.error("Error in getEmployeeDetailFromUsers:", error);
            throw error;
        }
    }

    const getEmployeesFromUsersDB = async () => {
        try {
            const res = await API.ListUsers(
                HeaderFarms(session.accessToken)
            );

            return res;
        } catch (error) {
            console.error("Error in getEmployeesFromUsersDB:", error);
            throw error;
        }
    };

    const getBranchByValue = (value) => {
        let branches = {
            "GM": 48276,
            "CPM": 48274,
            "SHS": 48275,
            "LMR": 48277,
            "DPM": 55811,
            "BRM": 0,
        };

        // Balik nilai dan kunci
        let reversedBranches = Object.entries(branches).reduce((acc, [key, val]) => {
            acc[val] = key;
            return acc;
        }, {});

        return reversedBranches[value];
    };

    const renderOptionsEmployee = async (
        employees
    ) => {
        let filterEmployeeSync = await SyncEmployee(employees)
        let filterGetEmployees = await getEmployees(employees)

        setOptionsEmployee(filterEmployeeSync)
        setOptionsDirectSpv(filterGetEmployees)
    }

    const renderOptionsDirectSpv = async () => {

        Block.arrows('.loading-field', "Mohon tunggu..")

        let filter = [];

        let employeesUsers = await getEmployeesFromUsersDB();

        employeesUsers.data.forEach(employee => {
            filter.push({
                value: employee.fullname,
                label: employee.fullname,
                key: employee.nik,
                detail: employee
            });
        });

        setOptionsDirectSpv(filter)

        Block.remove('.loading-field');
    }

    async function SyncEmployee(employees) {
        let filter = [];

        let employeesUsers = await getEmployeesFromUsersDB();

        employees.forEach(employee => {

            let employeeUser = employeesUsers.data.find(
                employeeUser => String(employeeUser.nik)
                    .trim().toLocaleLowerCase()
                    === String(employee.personal.barcode)
                        .trim().toLocaleLowerCase()
            );

            if (!employeeUser)
                filter.push({
                    value: employee.personal.first_name + " " + employee.personal.last_name,
                    label: employee.personal.first_name + " " + employee.personal.last_name,
                    key: employee.personal.barcode,
                    detail: employee
                });
        });

        return filter;
    }

    async function getEmployees(employees) {
        let filter = [];

        employees.forEach(employee => {
            filter.push({
                value: employee.personal.first_name + " " + employee.personal.last_name,
                label: employee.personal.first_name + " " + employee.personal.last_name,
                key: employee.personal.barcode,
                detail: employee
            });
        });

        return filter;
    }

    const getApprovaline = async (selectedEmployee) => {
        try {

            const supervisorDetail = optionsDirectSpv.find(
                employee =>
                    employee.detail.user_id
                    === selectedEmployee.detail
                        .employment.approval_line
            );

            return supervisorDetail;

        } catch (error) {
            console.error("Error in getApprovaline:", error);
        }
    }

    const getEmployeeTalentaByBranch = async () => {
        try {
            Block.arrows('.loading', "Mengambil data dari Talenta..");

            const { data: employees } =
                await API.getEmployeeTalentaByBranch(
                    HeaderFarms(null),
                    '48276,48274,48275,48277,55811,0'
                );

            renderOptionsEmployee(employees)

            Block.remove('.loading');
        } catch (error) {
            message.error(`Error get employees by Talenta`);
            console.error("Error in getEmployeeTalentaByBranch:", error);
        }
    }

    const onSelectName = async (
        value
    ) => {

        const selectedOption = optionsEmployee.find(
            option =>
                option.value === value
        );

        const detailData = selectedOption.detail;
        const supervisorDetail = await getApprovaline(selectedOption)

        form.setFieldsValue({
            position: detailData.employment.job_position,
            department: detailData.employment.organization_name,
            phone_number: detailData.personal.mobile_phone.startsWith('0') ? '62' +
                detailData.personal.mobile_phone.slice(1) : detailData.personal.mobile_phone,
            company: getBranchByValue(detailData.employment.branch_id),
            nik: detailData.personal.barcode,
            employee_status: detailData.employment.employment_status,
            direct_spv: supervisorDetail?.detail.personal.barcode,
            roles: "62b97ff0a39330b31b03edf0" // User
        });


    };

    useEffect(() => {

        if (!id)
            getEmployeeTalentaByBranch()
        else
            getEmployeeDetailFromUsers(id)

        if (!session) {
            navigate('/login')
        }
    }, [])

    return (
        <>
            <div className="row mb-3">
                <div className="col-md-1">
                    <Button type="primary" icon={<RollbackOutlined />} onClick={() => navigate('/users')}>Back</Button>
                </div>
            </div>
            <CCard>
                <CCardHeader>Create User</CCardHeader>
                <CCardBody>
                    <Form
                        name="basic"
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 9 }}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        autoComplete="off"
                        form={form}
                        className='loading-field'
                    >
                        <Form.Item
                            label="Fullname"
                            name="fullname"
                            rules={[{ required: true }]}
                            className='loading'
                        >
                            <AutoComplete
                                showSearch
                                size="middle"
                                placeholder="Pilih nama"
                                onSelect={onSelectName}
                                filterOption={(inputValue, option) =>
                                    option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                }
                            >
                                {optionsEmployee.map(option => (
                                    <AutoComplete.Option key={option.value} value={option.value}>
                                        {option.label}
                                    </AutoComplete.Option>
                                ))}
                            </AutoComplete>
                        </Form.Item>
                        <Form.Item
                            label="Employee ID"
                            name="nik"
                            rules={[{ required: true }]}
                        >
                            {/* <Alert className="mb-3" message="Hanya bisa di input dari Talenta" type="info" icon /> */}
                            <Input readOnly disabled />
                        </Form.Item>
                        <Form.Item name="email" label="Email Company">
                            <Input type={'email'} />
                        </Form.Item>
                        <Form.Item
                            label="Whatsapp Number"
                            name="phone_number"
                            rules={[{ required: false }]}
                            normalize={(value) => {
                                // Normalisasi nilai input
                                if (value.startsWith('0')) {
                                    return value.replace(/^0/, '62');
                                }
                                return value;
                            }}
                        >
                            <Input placeholder="Example : 628119492324" />
                        </Form.Item>
                        <Form.Item
                            label="Position"
                            name="position"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Direct Supervisor"
                            name="direct_spv"
                        >
                            <Select
                                showSearch
                                placeholder="Search for direct supervisor"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {optionsDirectSpv.map(option => (
                                    <Select.Option key={option.key} value={option.key}>
                                        {option.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item required label="Unit" name="company">
                            <Radio.Group>
                                <Radio.Button value="BRM">BRM</Radio.Button>
                                <Radio.Button value="CPM">CPM</Radio.Button>
                                <Radio.Button value="GM">GM</Radio.Button>
                                <Radio.Button value="SHS">SHS</Radio.Button>
                                <Radio.Button value="DPM">DPM</Radio.Button>
                                <Radio.Button value="LMR">LMR</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item rules={[{ required: true }]} name="roles" label="Roles">
                            <Radio.Group>
                                <Radio.Button value="62f84b82493ea74c934295a0">Admin</Radio.Button>
                                <Radio.Button value="62b97ff0a39330b31b03edf0">User</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </CCardBody>
            </CCard>
        </>
    )

}

export default CreateUser
