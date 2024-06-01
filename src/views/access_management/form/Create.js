import { Alert, Button, Form, Input, Radio, Switch, Transfer } from "antd"
import { CCard, CCardBody, CCardHeader } from "@coreui/react"
import { useNavigate, useParams } from "react-router-dom";
import { RollbackOutlined } from '@ant-design/icons';
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Notiflix, { Block } from "notiflix";

import HeaderFarms from "src/utils/header_farms";
import API from "src/services";

const CreateForm = () => {

    const [optionsApprover, setOptionsApprover] = useState([]);

    const [selectedKeysPic, setSelectedKeysPic] = useState([]);
    const [targetKeysPic, setTargetKeysPic] = useState([]);

    const [selectedKeys, setSelectedKeys] = useState([]);
    const [targetKeys, setTargetKeys] = useState([]);

    const session = useSelector((state) => state.session)
    const [form] = Form.useForm();

    let navigate = useNavigate()
    let { id } = useParams();

    const onFinish = async (
        values
    ) => {
        if (id)
            await editForm(values)
        else
            await saveForm(values);
    };

    async function saveForm(values) {
        try {
            await API.CreateForm(
                HeaderFarms(session.accessToken),
                values
            );

            Notiflix.Notify.success('Create Success');
            navigate('/forms');

        } catch (err) {
            console.log("saveForm", err);
            Notiflix.Report.info((err.toString()));
        }
    }

    async function editForm(values) {
        try {
            await API.UpdateForm(
                HeaderFarms(session.accessToken),
                values,
                id
            );

            Notiflix.Notify.success('Update Success');
            navigate('/forms');

        } catch (err) {
            console.log("editForm", err);
            Notiflix.Report.info((err.toString()));
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

    const renderOptionsApprover = async () => {

        Block.arrows('.loading-field', "Mohon tunggu..")

        let filter = [];

        let employeesUsers = await getEmployeesFromUsersDB();

        employeesUsers.data.forEach(employee => {
            filter.push({
                title: employee.fullname + ` (${employee.nik})`,
                key: employee._id,
                description: employee.company.code
            });
        });

        setOptionsApprover(filter)

        Block.remove('.loading-field');
    }

    const onSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {

        console.log('sourceSelectedKeys:', sourceSelectedKeys);
        console.log('targetSelectedKeys:', targetSelectedKeys);
        setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
    };

    const onSelectChangePic = (sourceSelectedKeys, targetSelectedKeys) => {

        console.log('sourceSelectedKeys:', sourceSelectedKeys);
        console.log('targetSelectedKeys:', targetSelectedKeys);
        setSelectedKeysPic([...sourceSelectedKeys, ...targetSelectedKeys]);
    };

    const onChange = (nextTargetKeys, direction, moveKeys) => {
        if (direction === 'right') {

            const newItem = moveKeys[moveKeys.length - 1];

            const otherItems = nextTargetKeys.filter(item => !moveKeys.includes(item));
            const updatedTargetKeys = [...otherItems, newItem];


            setTargetKeys(updatedTargetKeys);
        } else {

            setTargetKeys(nextTargetKeys);
        }

    }

    const onChangePic = (nextTargetKeys, direction, moveKeys) => {
        if (direction === 'right') {
            // Mengambil item yang baru ditambahkan (item paling bawah)
            const newItem = moveKeys[moveKeys.length - 1];
            // Memisahkan item yang baru dari item-item yang sudah ada
            const otherItems = nextTargetKeys.filter(item => !moveKeys.includes(item));
            // Mengatur ulang nextTargetKeys dengan item yang baru berada di paling bawah
            const updatedTargetKeys = [...otherItems, newItem];
            // Mengatur state targetKeys dengan nextTargetKeys yang sudah diatur ulang
            setTargetKeysPic(updatedTargetKeys);
        } else {
            // Jika item dipindahkan ke kiri (dihilangkan dari targetKeys)
            // Tidak ada perubahan urutan yang diperlukan karena item yang dipilih pertama tetap di bagian atas
            setTargetKeysPic(nextTargetKeys);
        }

    }

    const getFormDetail = async () => {
        try {

            const res = await API.DetailForm(
                HeaderFarms(session.accessToken),
                id
            );

            form.setFieldsValue({
                code: res.data.code,
                name: res.data.name,
            });

        } catch (error) {
            console.error("Error in getFormDetail :", error);
            throw error;
        }
    }

    useEffect(() => {

        if (!session) {
            navigate('/login')
        }

        if (id)
            getFormDetail(id)

        // renderOptionsApprover()
      
    }, [])

    return (
        <>
            <div className="row mb-3">
                <div className="col-md-1">
                    <Button type="primary" icon={<RollbackOutlined />} onClick={() => navigate('/forms')}>Back</Button>
                </div>
            </div>
            <CCard>
                <CCardHeader>Create Form</CCardHeader>
                <CCardBody>
                    <Form
                        name="basic"
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 12 }}
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        autoComplete="off"
                        form={form}
                        className='loading-field'
                    >
                        <Form.Item
                            label="Form Name"
                            name="name"
                            rules={[{ required: true }]}
                            className='loading'
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label="Code"
                            name="code"
                            rules={[{ required: true }]}
                        >
                            <Input disabled={id ? true : false} />
                        </Form.Item>
                        {/* <Form.Item rules={[{ required: true }]} label="Unit" name="company">
                            <Radio.Group>
                                <Radio.Button value="BRM">BRM</Radio.Button>
                                <Radio.Button value="CPM">CPM</Radio.Button>
                                <Radio.Button value="GM">GM</Radio.Button>
                                <Radio.Button value="SHS">SHS</Radio.Button>
                                <Radio.Button value="DPM">DPM</Radio.Button>
                                <Radio.Button value="LMR">LMR</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item name="direct_spv" label="Direct Superior" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                        <Form.Item
                            label="Approver Form"
                            name="approved_by"
                            rules={[{ required: true }]}
                            extra="(*) Mohon diperhatikan urutan nya, karna akan berpengaruh kepada urutan approval"
                        >
                            <Transfer
                                dataSource={optionsApprover}
                                selectedKeys={selectedKeys}
                                onSelectChange={onSelectChange}
                                filterOption={(inputValue, option) =>
                                    option.title.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                }
                                render={item => item.title}
                                targetKeys={targetKeys}
                                onChange={onChange}
                                showSearch

                                listStyle={{
                                    width: 250,
                                    height: 300,
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            label="PIC Form"
                            name="pic"
                            rules={[{ required: true }]}
                        >
                            <Transfer
                                onSelectChange={onSelectChangePic}
                                dataSource={optionsApprover}
                                selectedKeys={selectedKeysPic}
                                onChange={onChangePic}
                                targetKeys={targetKeysPic}
                                filterOption={(inputValue, option) =>
                                    option.title.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                }
                                render={item => item.title}
                                showSearch
                                listStyle={{
                                    width: 250,
                                    height: 300,
                                }}
                            />
                        </Form.Item> */}
                        <Form.Item className="mt-3" wrapperCol={{ offset: 8, span: 16 }}>
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

export default CreateForm
