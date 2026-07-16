import { Card, Form, Input } from "antd";

const TenantForm = () => {
  return (
    <Card title={"Basic info"}>
      <Form.Item
        label={"Name"}
        name={"name"}
        rules={[
          {
            required: true,
            message: "Tenant name is required",
          },
        ]}
      >
        <Input size="large"></Input>
      </Form.Item>
      <Form.Item
        label={"Address"}
        name={"address"}
        rules={[
          {
            required: true,
            message: "Address is required",
          },
        ]}
      >
        <Input size="large"></Input>
      </Form.Item>
    </Card>
  );
};

export default TenantForm;
