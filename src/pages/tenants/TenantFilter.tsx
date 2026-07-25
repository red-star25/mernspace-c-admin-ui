import { Card, Col, Form, Input, Row } from "antd";

type TenantFilterProp = {
  children: React.ReactNode;
};

const TenantFilter = ({ children }: TenantFilterProp) => {
  return (
    <>
      <Card>
        <Row justify="space-between">
          <Col span={16}>
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item name="q">
                  <Input.Search allowClear placeholder="Search"></Input.Search>
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={8} style={{ display: "flex", justifyContent: "end" }}>
            {children}
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default TenantFilter;
