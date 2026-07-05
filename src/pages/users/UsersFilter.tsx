import { Button, Card, Col, Input, Row, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const UsersFilter = () => {
  return (
    <Card>
      <Row justify="space-between">
        <Col span={16}>
          <Row gutter={20}>
            <Col span={8}>
              <Input.Search placeholder="Search" />
            </Col>
            <Col span={8}>
              <Select
                allowClear
                style={{ width: "100%" }}
                options={[
                  { label: "Admin", value: "admin" },
                  { label: "Manager", value: "manager" },
                  { label: "Customer", value: "customer" },
                ]}
                placeholder="Role"
              />
            </Col>
            <Col span={8}>
              <Select
                allowClear
                style={{ width: "100%" }}
                options={[
                  { label: "Banned", value: "Banned" },
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
                placeholder="Status"
              />
            </Col>
          </Row>
        </Col>
        <Col span={8} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button type="primary" icon={<PlusOutlined />}>
            Add User
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default UsersFilter;
