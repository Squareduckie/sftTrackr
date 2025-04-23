import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select, Button, Form, Input } from "antd";

import { sftFormActions } from "../../store/sft-form-slice";
import { generatePassword } from "../../utils/telegramSender";

import "./SFTForm.css";

let index = 5;
const SFTForm = () => {
  const isActivityStarted = useSelector(
    (state) => state.sftForm.isActivityStarted
  );

  const dispatch = useDispatch();
  const { Option } = Select;
  const [items, setItems] = useState([]);

  const inputRef = useRef(null);

  /** Form handlers. */
  const onFinish = (values) => {
    // console.log("Success:", values);
    // generatePassword(values);
    dispatch(sftFormActions.startActivity());
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form
      name="basic"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item
        label="Rank/ Name"
        name="rankName"
        rules={[
          {
            required: true,
            message: "Please input the rank and name!",
          },
        ]}
      >
        <Input disabled={isActivityStarted} />
      </Form.Item>

      <Form.Item
        label="Platoon/ Section"
        name="platoonSection"
        rules={[
          {
            required: true,
            message: "Please input your platoon and section!",
          },
        ]}
      >
        <Input disabled={isActivityStarted} />
      </Form.Item>

      <Form.Item
        label="Location"
        name="location"
        rules={[
          {
            required: true,
            message: "Please input location!",
          },
        ]}
      >
        <Input disabled={isActivityStarted} />
      </Form.Item>

      <Form.Item
        label="Activity"
        name="activity"
        rules={[
          {
            required: true,
            message: "Please input activity!",
          },
        ]}
      >
        <Input disabled={isActivityStarted} />
      </Form.Item>

      {!isActivityStarted && (
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Start Activity
          </Button>
        </Form.Item>
      )}
      {isActivityStarted && (
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Stop Activity
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

export default SFTForm;
