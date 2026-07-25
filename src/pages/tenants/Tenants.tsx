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
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createTenant, getTenants } from "../../http/api";
import { useAuthStore } from "../../store";
import { useState } from "react";
import TenantForm from "./forms/TenantForm";
import type { FieldData, TenantData } from "../../types";
import { PER_PAGE } from "../../constants";
import { debounce } from "lodash";
import React from "react";

const Tenants = () => {
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [queryParams, setQueryParams] = useState({
    perPage: PER_PAGE,
    currentPage: 1,
  });
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
    queryKey: ["tenants", queryParams],
    queryFn: () => {
      const filteredQueryParams = Object.fromEntries(
        Object.entries(queryParams).filter((item) => !!item[1]),
      );
      const queryString = new URLSearchParams(
        filteredQueryParams as unknown as Record<string, string>,
      ).toString();
      return getTenants(queryString).then((res) => res.data);
    },
    placeholderData: keepPreviousData,
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

  const debouncedQUpdate = React.useMemo(() => {
    return debounce((value: string) => {
      setQueryParams((prev) => ({
        ...prev,
        q: value,
      }));
    }, 1000);
  }, []);

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

  const onFilterChange = (changedFields: FieldData[]) => {
    const changedFiterFields = changedFields
      .map((field) => {
        return {
          name: field.name[0],
          value: field.value,
        };
      })
      .reduce((acc, item) => ({ ...acc, [item.name]: item.value }), {});
    if ("q" in changedFiterFields) {
      debouncedQUpdate(changedFiterFields.q as string);
    } else {
      setQueryParams((prev) => ({
        ...prev,
        ...changedFiterFields,
      }));
    }
  };

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
        <Form
          form={filterForm}
          onFieldsChange={(changedFields) => onFilterChange(changedFields)}
        >
          <TenantFilter
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
        </Form>
        <Table
          dataSource={tenants?.data}
          columns={columns}
          rowKey={"id"}
          pagination={{
            total: tenants?.total,
            pageSize: queryParams.perPage,
            current: queryParams.currentPage,
            onChange: (page) => {
              setQueryParams((prev) => ({
                ...prev,
                currentPage: page,
              }));
            },
          }}
        ></Table>
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
      </Space>
    </>
  );
};

export default Tenants;
