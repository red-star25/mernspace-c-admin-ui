import { useQuery } from "@tanstack/react-query";
import { Card, Col, Form, Input, Row, Select, Space } from "antd";
import { getTenants } from "../../../http/api";
import type { Tenant } from "../../../types";

const UserForm = () => {
  const { data: tenants } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => {
      return getTenants().then((res) => res.data.data);
    },
  });
  return (
    <Row>
      <Col span={24}>
        <Space direction="vertical" size={"large"}>
          <Card title={"Basic Info"}>
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item
                  label={"First name"}
                  name={"firstName"}
                  rules={[
                    {
                      required: true,
                      message: "First name is required",
                    },
                  ]}
                >
                  <Input size="large"></Input>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={"Last name"}
                  name={"lastName"}
                  rules={[
                    {
                      required: true,
                      message: "Last name is required",
                    },
                  ]}
                >
                  <Input size="large"></Input>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={"Email"}
                  name={"email"}
                  rules={[
                    {
                      required: true,
                      message: "Email name is required",
                    },
                    {
                      type: "email",
                      message: "Email is not valid",
                    },
                  ]}
                >
                  <Input size="large"></Input>
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Card title={"Security Info"}>
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item
                  label={"Password"}
                  name={"password"}
                  rules={[
                    {
                      required: true,
                      message: "Password name is required",
                    },
                  ]}
                >
                  <Input size="large" type={"password"}></Input>
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Card title={"Roles"}>
            <Row gutter={20}>
              <Col span={12}>
                <Form.Item
                  label="Role"
                  name={"role"}
                  rules={[
                    {
                      required: true,
                      message: "Role name is required",
                    },
                  ]}
                >
                  <Select
                    size="large"
                    allowClear
                    style={{ width: "100%" }}
                    options={[
                      { label: "Admin", value: "admin" },
                      { label: "Manager", value: "manager" },
                      { label: "Customer", value: "customer" },
                    ]}
                    placeholder="Select role"
                    onChange={(selectedItem) => console.log(selectedItem)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Restaurant"
                  name={"tenantId"}
                  rules={[
                    {
                      required: true,
                      message: "Restaurant name is required",
                    },
                  ]}
                >
                  <Select
                    size="large"
                    allowClear
                    style={{ width: "100%" }}
                    options={
                      tenants?.map((tenant: Tenant) => ({
                        label: tenant.address,
                        value: tenant.id,
                      })) ?? []
                    }
                    placeholder="Select restaurant"
                    onChange={(selectedItem) => console.log(selectedItem)}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Space>
      </Col>
    </Row>
  );
};

export default UserForm;
