import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Select,
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Divider,
  Space,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import { CONSTANTS } from "../../utils/constants";
import { passwordFormActions } from "../../store/password-form-slice";
import { generatePassword } from "../../utils/passwordGenerator";

import "./PasswordForm.css";

const passwordFormatOptions = [
  {
    label: "Add Special Character",
    value: CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.ADD_SPECIAL_CHARACTER,
  },
  // {
  //   label: "Add Numbers",
  //   value: CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.ADD_NUMBERS,
  // },
  {
    label: "Only Letters",
    value: CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.ONLY_LETTERS,
  },
  {
    label: "Captial Letters",
    value: CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.CAPTIAL_LETTERS,
  },
];

/** Initial form values. */
const initialPasswordFormatValues = [
  CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.ADD_SPECIAL_CHARACTER,
  // CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.ADD_NUMBERS,
  CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.ONLY_LETTERS,
  CONSTANTS.PASSWORD_FORM.PASSWORD_FORMATS.CAPTIAL_LETTERS,
];

const initialIterationValue =
  CONSTANTS.PASSWORD_FORM.INITIAL_VALUES.INITIAL_ITERATION_VALUE;

let index = 5;
const PasswordForm = () => {
  const dispatch = useDispatch();
  const { Option } = Select;
  const [items, setItems] = useState([]);

  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };

  const [name, setName] = useState("");
  const inputRef = useRef(null);
  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const deleteOption = (value) => {
    setItems(
      items.filter((item) => {
        return item.value !== value;
      })
    );
    console.log("deleted", value);
  };

  const addItem = (e) => {
    e.preventDefault();
    setItems([...items, { id: index++, value: name, label: name }]);
    setName("");
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  /** Form handlers. */
  const onFinish = (values) => {
    // console.log("Success:", values);
    generatePassword(values);
    dispatch(passwordFormActions.openOutputModal());
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const onChange = (checkedValues) => {
    console.log("checked = ", checkedValues);
  };

  return (
    <Form
      name="basic"
      initialValues={{
        passwordFormat: initialPasswordFormatValues,
        iteration: initialIterationValue,
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item
        label="Domain Name"
        name="domainName"
        rules={[
          {
            required: true,
            message: "Please input the domain name!",
          },
        ]}
      >
        {/* <Input /> */}
        <Select
          showSearch
          optionLabelProp="label"
          onChange={handleChange}
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          dropdownRender={(menu) => (
            <>
              {menu}
              <Divider
                style={{
                  margin: "8px 0",
                }}
              />
              <Space
                style={{
                  padding: "0 8px 4px",
                }}
              >
                <Input
                  placeholder="New domain name"
                  ref={inputRef}
                  value={name}
                  onChange={onNameChange}
                  onKeyDown={(e) => e.stopPropagation()}
                />
                <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
                  Add Domain
                </Button>
              </Space>
            </>
          )}
        >
          {items.map((task) => {
            return (
              <Option key={task.id} value={task.value} label={task.label}>
                <span>{task.label}</span>
                <span style={{ float: "right" }}>
                  <DeleteOutlined
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteOption(task.value);
                    }}
                  />
                </span>
              </Option>
            );
          })}
        </Select>
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[
          {
            required: true,
            message: "Please input your password!",
          },
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="iteration"
        label="Iteration"
        rules={[
          {
            required: true,
            type: "number",
            min: 1,
            max: 99,
          },
        ]}
      >
        <InputNumber />
      </Form.Item>

      <Form.Item name="passwordFormat">
        <Checkbox.Group options={passwordFormatOptions} onChange={onChange} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Generate Password
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PasswordForm;
