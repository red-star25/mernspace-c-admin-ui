import { Breadcrumb, Button, Drawer, Skeleton, Space, Table } from "antd";
import { Link, Navigate } from "react-router-dom";
import { PlusOutlined, RightOutlined } from "@ant-design/icons";
import TenantFilter from "./TenantFilter";
import { useQuery } from "@tanstack/react-query";
import { getTenants } from "../../http/api";
import { useAuthStore } from "../../store";
import { useState } from "react";

const Tenants = () => {
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

  const { user } = useAuthStore();
  if (user.role !== "admin") {
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
              destroyOnHidden
              onClose={() => setDrawerOpen(false)}
              extra={
                <Space>
                  <Button>Cancel</Button>
                  <Button type="primary">Submit</Button>
                </Space>
              }
            ></Drawer>
          </>
        )}
      </Space>
    </>
  );
};

export default Tenants;
