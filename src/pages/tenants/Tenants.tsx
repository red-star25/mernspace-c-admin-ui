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
import { createTenant, getTenants, updateTenant } from "../../http/api";
import { useAuthStore } from "../../store";
import { useEffect, useState } from "react";
import TenantForm from "./forms/TenantForm";
import type { FieldData, Tenant, TenantData } from "../../types";
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
  const [currentSelectedTenant, setCurrentSelectedTenant] =
    useState<Tenant | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (currentSelectedTenant) {
      setDrawerOpen(true);
      form.setFieldsValue({
        name: currentSelectedTenant.name,
        address: currentSelectedTenant.address,
      });
    }
  }, [currentSelectedTenant, form]);

  const queryClient = useQueryClient();
  const {
    token: { colorBgLayout },
  } = theme.useToken();

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

  const { mutate: updateTenantMutate } = useMutation({
    mutationKey: ["tenant-update"],
    mutationFn: async (data: TenantData) =>
      await updateTenant(data, currentSelectedTenant!.id).then(
        (res) => res.data.data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tenants"],
      });
      return;
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

  const debouncedQUpdate = React.useMemo(() => {
    return debounce((value: string) => {
      setQueryParams((prev) => ({
        ...prev,
        q: value,
        currentPage: 1,
      }));
    }, 500);
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
        currentPage: 1,
      }));
    }
  };

  const onHandleSubmit = async () => {
    const values = await form.validateFields();
    const isEditingMode = !!currentSelectedTenant;
    if (isEditingMode) {
      updateTenantMutate(form.getFieldsValue());
    } else {
      tenantMutate(values);
    }
    form.resetFields();
    setCurrentSelectedTenant(null);
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
          columns={[
            ...columns,
            {
              title: "Action",
              render: (_text: string, record: TenantData) => {
                return (
                  <Space>
                    <Button
                      type="link"
                      onClick={() => {
                        setCurrentSelectedTenant(record);
                      }}
                    >
                      Edit
                    </Button>
                  </Space>
                );
              },
            },
          ]}
          rowKey={"id"}
          pagination={{
            total: tenants?.total,
            pageSize: queryParams.perPage,
            current: queryParams.currentPage,
            showTotal: (total: number, range: number[]) => {
              return `Showing ${range[0]}-${range[1]} of ${total} items`;
            },
            onChange: (page) => {
              setQueryParams((prev) => ({
                ...prev,
                currentPage: page,
              }));
            },
          }}
        ></Table>
        <Drawer
          title={!currentSelectedTenant ? "Create tenant" : "Update tenant"}
          width={720}
          open={drawerOpen}
          styles={{
            body: {
              background: colorBgLayout,
            },
          }}
          destroyOnHidden
          onClose={() => {
            form.resetFields();
            setCurrentSelectedTenant(null);
            setDrawerOpen(false);
          }}
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
