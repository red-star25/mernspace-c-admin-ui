import {
  Breadcrumb,
  Button,
  Drawer,
  Form,
  Skeleton,
  Space,
  Table,
  theme,
} from "antd";
import { Link, Navigate } from "react-router-dom";
import { PlusOutlined, RightOutlined } from "@ant-design/icons";
import TenantFilter from "./TenantFilter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTenant, getTenants } from "../../http/api";
import { useAuthStore } from "../../store";
import { useState } from "react";
import TenantForm from "./forms/TenantForm";
import type { TenantData } from "../../types";

const Tenants = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const {
    token: { colorBgLayout },
  } = theme.useToken();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    data: tenants,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => {
      return getTenants().then((res) => res.data.data);
    },
  });
  const { mutate: tenantMutate } = useMutation({
    mutationKey: ["tenant"],
    mutationFn: async (data: TenantData) =>
      await createTenant(data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tenants"],
      });
      form.resetFields();
      setDrawerOpen(false);
    },
  });

  const { user } = useAuthStore();
  if (user && user.role !== "admin") {
    return <Navigate to="/" replace={true} />;
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
  ];

  const onHandleSubmit = async () => {
    const values = await form.validateFields();
    tenantMutate(values);
    form.resetFields();
    setDrawerOpen(false);
  };

  return (
    <>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Breadcrumb
          separator={<RightOutlined />}
          items={[
            {
              title: <Link to="/">Dashboard</Link>,
            },
            {
              title: "Tenants",
            },
          ]}
        />
        {isLoading && <Skeleton active />}
        {isError && <div>{error.message}</div>}
        {tenants && (
          <>
            <TenantFilter
              onFilterChange={(filterName, filterValue) => {
                console.log(filterName, filterValue);
              }}
              children={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setDrawerOpen(true)}
                >
                  Add Restaurant
                </Button>
              }
            />
            <Table dataSource={tenants} columns={columns} rowKey={"id"}></Table>
            <Drawer
              title="Create tenant"
              width={720}
              open={drawerOpen}
              styles={{
                body: {
                  background: colorBgLayout,
                },
              }}
              destroyOnHidden
              onClose={() => setDrawerOpen(false)}
              extra={
                <Space>
                  <Button
                    onClick={() => {
                      setDrawerOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="primary" onClick={onHandleSubmit}>
                    Submit
                  </Button>
                </Space>
              }
            >
              <Form layout="vertical" form={form}>
                <TenantForm />
              </Form>
            </Drawer>
          </>
        )}
      </Space>
    </>
  );
};

export default Tenants;
