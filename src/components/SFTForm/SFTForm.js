import { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Checkbox,
  message,
  Select,
  Spin,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

import { CONSTANTS } from "../../utils/constants";
import {
  checkIfActivityHasStarted,
  getFromLocal,
  removeFromLocal,
  saveToLocal,
  sendEndTelegramMessage,
  sendStartTelegramMessage,
} from "../../utils/telegramSender";
import {
  getRowNumber,
  getSFTChecklist,
  updateSFT,
} from "../../utils/googleSheetAPI";

import "./SFTForm.css";

const SFTForm = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [isActivityStarted, setIsActivityStarted] = useState(
    checkIfActivityHasStarted()
  );
  const [isMessageSending, setIsMessageSending] = useState(false);
  const [isModalShown, setIsModalShown] = useState(false);
  const [isLoadingChecklist, setIsLoadingChecklist] = useState(false);
  const [SFTChecklist, setSFTChecklist] = useState([]);
  const [checkedListPage1, setCheckedListPage1] = useState([]);
  const [checkedListPage2, setCheckedListPage2] = useState([]);
  const [modalPage, setModalPage] = useState(1);
  const [formValues, setFormValues] = useState({});
  const [subUnitLabel, setSubUnitLabel] = useState("Platoon/Section:");

  const initialValues = {
    rankName: getFromLocal(CONSTANTS.FORM_ITEM_KEYS.RANK_NAME)
      ?.split(",")
      .map((name) => name.trim()) || [""],
    platoonSection:
      getFromLocal(CONSTANTS.FORM_ITEM_KEYS.PLATOON_SECTION) || "",
    location: getFromLocal(CONSTANTS.FORM_ITEM_KEYS.LOCATION) || "",
    activity: getFromLocal(CONSTANTS.FORM_ITEM_KEYS.ACTIVITY) || "",
  };

  useEffect(() => {
    const fetchChecklist = async () => {
      setIsLoadingChecklist(true);
      try {
        const data = await getSFTChecklist(CONSTANTS.SHEETS);
        setSFTChecklist(data);
      } catch (error) {
        messageApi.error("Failed to load checklist.");
      } finally {
        setIsLoadingChecklist(false);
      }
    };

    fetchChecklist();
  }, []);

  /** Form handlers */
  const onFinish = async (values) => {
    console.log(values);
    setFormValues(values);
    setModalPage(1);
    setIsModalShown(true);
    // setIsLoadingChecklist(true);

    // try {
    //   const data = await getSFTChecklist(CONSTANTS.SHEETS);
    //   setSFTChecklist(data);
    // } catch (error) {
    //   messageApi.error("Failed to load checklist.");
    // } finally {
    //   setIsLoadingChecklist(false);
    // }
  };

  const startActivity = async () => {
    // require every checklist item to be checked (by value), not just matching lengths
    const allCheckedStart = SFTChecklist.length > 0 && SFTChecklist.every((item) =>
      checkedListPage1.includes(item) || checkedListPage2.includes(item)
    );
    if (!allCheckedStart) {
      messageApi.error("Please complete the checklist before starting the activity.");
      return;
    }

    const formattedTime = new Date().toLocaleString();
    const rankNames = formValues.rankName
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean);
    saveToLocal(CONSTANTS.FORM_ITEM_KEYS.RANK_NAME, rankNames.join(", "));
    // saveToLocal(CONSTANTS.FORM_ITEM_KEYS.RANK_NAME, values.rankName);
    saveToLocal(
      CONSTANTS.FORM_ITEM_KEYS.PLATOON_SECTION,
      formValues.platoonSection
    );
    saveToLocal(CONSTANTS.FORM_ITEM_KEYS.SUB_UNIT, formValues.subUnit);
    saveToLocal(CONSTANTS.FORM_ITEM_KEYS.LOCATION, formValues.location);
    saveToLocal(CONSTANTS.FORM_ITEM_KEYS.ACTIVITY, formValues.activity);
    saveToLocal(CONSTANTS.FORM_ITEM_KEYS.START_TIME, formattedTime);

    setIsMessageSending(true);
    const row = (await getRowNumber(formValues.subUnit)) + 1;
    saveToLocal(CONSTANTS.FORM_ITEM_KEYS.ROW, row);
    await updateSFT(row);
    await sendStartTelegramMessage();
    setIsActivityStarted(true);
    setIsMessageSending(false);
    setIsModalShown(false);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const onFinishActivity = async () => {
    const formattedTime = new Date().toLocaleString();

    saveToLocal(CONSTANTS.FORM_ITEM_KEYS.END_TIME, formattedTime);
    setIsMessageSending(true);
    const row = getFromLocal(CONSTANTS.FORM_ITEM_KEYS.ROW);
    await updateSFT(row);
    await sendEndTelegramMessage();
    setIsMessageSending(false);

    // Clear local storage
    [
      CONSTANTS.FORM_ITEM_KEYS.RANK_NAME,
      CONSTANTS.FORM_ITEM_KEYS.PLATOON_SECTION,
      CONSTANTS.FORM_ITEM_KEYS.LOCATION,
      CONSTANTS.FORM_ITEM_KEYS.ACTIVITY,
      CONSTANTS.FORM_ITEM_KEYS.START_TIME,
      CONSTANTS.FORM_ITEM_KEYS.END_TIME,
      CONSTANTS.FORM_ITEM_KEYS.ROW,
      CONSTANTS.FORM_ITEM_KEYS.SUB_UNIT,
    ].forEach(removeFromLocal);

    form.setFieldsValue({
      rankName: [""],
      platoonSection: "",
      location: "",
      activity: "",
      subUnit: "",
    });
    setCheckedListPage1([]);
    setCheckedListPage2([]);
    setIsActivityStarted(false);
  };

  const onChecklistChange = (list, page = 1) => {
    if (page === 1) setCheckedListPage1(list);
    else setCheckedListPage2(list);
  };

  // (select-all removed) no per-page select-all handler

  const onSubUnitChange = (e) => {
    saveToLocal(CONSTANTS.FORM_ITEM_KEYS.SUB_UNIT, e);
    if (e === CONSTANTS.COYS.HQ) {
      setSubUnitLabel("Branch/Department:");
    } else {
      setSubUnitLabel("Platoon/Section:");
    }
  };

  // derive page items: first 4 on page 1, rest on page 2
  const page1Items = SFTChecklist.slice(0, Math.min(4, SFTChecklist.length));
  const page2Items = SFTChecklist.slice(Math.min(4, SFTChecklist.length));
  // require every checklist item to be present in either page's checked list
  const allChecked = SFTChecklist.length > 0 && SFTChecklist.every((item) =>
    checkedListPage1.includes(item) || checkedListPage2.includes(item)
  );

  return (
    <Spin spinning={isLoadingChecklist}>
      {contextHolder}
      <Form
        form={form}
        name="basic"
        initialValues={initialValues}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.List
          name="rankName"
          rules={[
            {
              required: true,
              validator: async (_, rankName) => {
                if (!rankName || rankName.length < 2) {
                  return Promise.reject(
                    new Error("SFT must be done in buddy level")
                  );
                }
                if (rankName.some((v) => !v || !v.trim())) {
                  return Promise.reject(
                    new Error("All rank/name fields must be filled")
                  );
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            //Made rank/name required
             <Form.Item label="Rank/Name" required style={{ marginBottom: 8 }}> 
              {fields.map((field) => {
                const { key, ...fieldProps } = field; // extract key from spread
                return (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >

                     <Form.Item {...fieldProps} noStyle>
                      <Input
                        placeholder="Enter rank/name"
                        disabled={isActivityStarted}
                        style={{ flex: 1, textTransform: "uppercase" }}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          const current = form.getFieldValue("rankName") || [];
                          const idx = field.name;
                          const next = [...current];
                          next[idx] = val;
                          form.setFieldsValue({ rankName: next });
                        }}
                      />
                    </Form.Item>

                    {fields.length > 1 && !isActivityStarted && (
                      <MinusCircleOutlined
                        onClick={() => remove(field.name)}
                        style={{ marginLeft: 8, fontSize: 20 }}
                      />
                    )}
                  </div>
                );
              })}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add("")} // Add empty string
                  style={{ width: "100%" }}
                  icon={<PlusOutlined />}
                  disabled={isActivityStarted}
                >
                  Add Participant
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </Form.Item>
          )}
        </Form.List>

        <Form.Item
          label="Sub-Unit"
          name="subUnit"
          rules={[
            {
              required: true,
              message: "Please select the school you are asigned to.",
            },
          ]}
        >
          <Select
            disabled={isActivityStarted}
            onChange={onSubUnitChange}
            placeholder="SELECT SUB-UNIT"
            options={[
              { value: CONSTANTS.COYS.HQ, label: CONSTANTS.COYS.HQ },
              { value: CONSTANTS.COYS.ALPHA, label: CONSTANTS.COYS.ALPHA },
              { value: CONSTANTS.COYS.BRAVO, label: CONSTANTS.COYS.BRAVO },
              { value: CONSTANTS.COYS.CHARLIE, label: CONSTANTS.COYS.CHARLIE },
              { value: CONSTANTS.COYS.DELTA, label: CONSTANTS.COYS.DELTA },
              { value: CONSTANTS.COYS.ME, label: CONSTANTS.COYS.ME },
            ]}
          />
        </Form.Item>

        <Form.Item
          label={subUnitLabel}
          name="platoonSection"
          style={{ width: "80vw" }}
          rules={[
            {
              required: true,
              message: "Please input your platoon and section!",
            },
          ]}
              >
          <Input
            disabled={isActivityStarted}
            placeholder="e.g. P2S3, HQ"
            style={{ flex: 1, textTransform: "uppercase" }}
            onChange={(e) =>
            form.setFieldsValue({ platoonSection: e.target.value.toUpperCase() })
                // Force CAPS on all input boxes for consistency
            }
          />
        </Form.Item>

        <Form.Item
          label="Location"
          name="location"
          rules={[{ required: true, message: "Please input location!" }]}
        >
          <Input
            disabled={isActivityStarted}
            placeholder="e.g. MPH, GYM, 30SCE RUNNING ROUTE"
            style={{ textTransform: "uppercase" }}
            onChange={(e) => form.setFieldsValue({ location: e.target.value.toUpperCase() })}
          />
        </Form.Item>

        <Form.Item
          label="Activity"
          name="activity"
          rules={[{ required: true, message: "Please input activity!" }]}
        >
          <Input
            disabled={isActivityStarted}
            placeholder="e.g. BADMINTON, GYM, RUNNING"
            style={{ textTransform: "uppercase" }}
            onChange={(e) => form.setFieldsValue({ activity: e.target.value.toUpperCase() })}
          />
        </Form.Item>

        {!isActivityStarted && (
          <Form.Item>
            <Button block type="primary" htmlType="submit">
              Start Activity
            </Button>
          </Form.Item>
        )}

        {isActivityStarted && (
          <Form.Item>
            <Button
              block
              type="primary"
              danger
              onClick={onFinishActivity}
              loading={isMessageSending}
            >
              Stop Activity
            </Button>
          </Form.Item>
        )}
      </Form>

      <Modal
        title={modalPage === 1 ? "Get Active Questionnaire" : "Pre-Activity Checklist"}
        open={isModalShown}
        onCancel={() => setIsModalShown(false)}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div>
              {modalPage === 2 && <Button onClick={() => setModalPage(1)}>Back</Button>}
            </div>
            <div>
              {modalPage === 1 && (
                <Button onClick={() => setModalPage(2)} style={{ marginRight: 8 }}>
                  Next
                </Button>
              )}
              <Button type="primary" onClick={startActivity} loading={isMessageSending} disabled={!allChecked}>
                Start Activity
              </Button>
            </div>
          </div>
        }
        loading={isLoadingChecklist}
      >
        <h5>By submitting this form, I declare that:</h5>
        {modalPage === 1 ? (
          <>
            <Checkbox.Group value={checkedListPage1} onChange={(list) => onChecklistChange(list, 1)}>
              {page1Items.map((item) => (
                <Checkbox key={item} value={item} className="checkbox-label">
                  {item}
                </Checkbox>
              ))}
            </Checkbox.Group>

            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }} />
          </>
        ) : (
          <>
            <Checkbox.Group value={checkedListPage2} onChange={(list) => onChecklistChange(list, 2)}>
              {page2Items.map((item) => (
                <Checkbox key={item} value={item} className="checkbox-label">
                  {item}
                </Checkbox>
              ))}
            </Checkbox.Group>

            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }} />
          </>
        )}
      </Modal>
    </Spin>
  );
};

export default SFTForm;
