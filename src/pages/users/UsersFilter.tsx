import { Card, Col, Form, Input, Row, Select } from "antd";

type UsersFilterProps = {
  children?: React.ReactNode;
};

const UsersFilter = ({ children }: UsersFilterProps) => {
  return (
    <Card>
      <Row justify="space-between">
        <Col span={16}>
          <Row gutter={20}>
            <Col span={8}>
              <Form.Item name="q">
                <Input.Search placeholder="Search" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="role">
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
              </Form.Item>
            </Col>
            {/* <Col span={8}>
              <Select
                allowClear
                style={{ width: "100%" }}
                options={[
                  { label: "Banned", value: "Banned" },
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
                placeholder="Status"
                onChange={(selectedItem) =>
                  onFilterChange("statusFilter", selectedItem)
                }
              />
            </Col> */}
          </Row>
        </Col>
        <Col span={8} style={{ display: "flex", justifyContent: "flex-end" }}>
          {children}
        </Col>
      </Row>
    </Card>
  );
};

export default UsersFilter;
