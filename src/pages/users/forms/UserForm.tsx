import { Card, Col, Form, Input, Row } from "antd";

const UserForm = () => {
  return (
    <Row>
      <Col span={24}>
        <Card title={"Basic Info"}>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label={"First name"} name={"firstname"}>
                <Input></Input>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={"Last name"} name={"lastname"}>
                <Input></Input>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default UserForm;
