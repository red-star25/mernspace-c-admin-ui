import {
  Breadcrumb,
  Button,
  Drawer,
  Flex,
  Form,
  Space,
  Spin,
  Table,
  theme,
  Typography,
} from "antd";
import {
  LoadingOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Link, Navigate } from "react-router-dom";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createUser, getUsers, updateUser } from "../../http/api";
import { useAuthStore } from "../../store";
import UsersFilter from "./UsersFilter";
import React, { useEffect, useState } from "react";
import UserForm from "./forms/UserForm";
import type { CreateUserData, FieldData, User } from "../../types";
import { PER_PAGE } from "../../constants";
import { debounce } from "lodash";

const Users = () => {
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [currentEditingUser, setCurrentEditingUser] = useState<User | null>(
    null,
  );

  const queryClient = useQueryClient();
  const {
    token: { colorBgLayout },
  } = theme.useToken();

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (currentEditingUser) {
      setDrawerOpen(true);
      form.setFieldsValue({
        ...currentEditingUser,
        tenantId: currentEditingUser.tenant?.id,
      });
    }
  }, [currentEditingUser, form]);

  const [queryParams, setQueryParams] = React.useState({
    perPage: PER_PAGE,
    currentPage: 1,
  });

  const {
    data: users,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["users", queryParams],
    queryFn: () => {
      const filteredQueryParams = Object.fromEntries(
        Object.entries(queryParams).filter((item) => !!item[1]),
      );
      const queryString = new URLSearchParams(
        filteredQueryParams as unknown as Record<string, string>,
      ).toString();
      return getUsers(queryString).then((res) => res.data);
    },
    placeholderData: keepPreviousData,
  });

  const { mutate: userMutate } = useMutation({
    mutationKey: ["user"],
    mutationFn: async (data: CreateUserData) =>
      await createUser(data).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      form.resetFields();
      setDrawerOpen(false);
    },
  });

  const { mutate: updateUserMutate } = useMutation({
    mutationKey: ["update-user"],
    mutationFn: async (data: CreateUserData) =>
      await updateUser(data, currentEditingUser!.id).then(
        (res) => res.data.data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      return;
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
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      render: (_text: string, record) => {
        return (
          <div>
            {record.firstName} {record.lastName}
          </div>
        );
      },
    },

    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Restaurant",
      dataIndex: "tenant",
      key: "tenant",
      render: (_text: string, record: User) => {
        return <div>{record.tenant?.name}</div>;
      },
    },
  ];

  const onHandleSubmit = async () => {
    await form.validateFields();
    const isEditMode = !!currentEditingUser;
    if (isEditMode) {
      await updateUserMutate(form.getFieldsValue());
    } else {
      await userMutate(form.getFieldsValue());
    }
    form.resetFields();
    setCurrentEditingUser(null);
    setDrawerOpen(false);
  };

  const debouncedQUpdate = React.useMemo(() => {
    return debounce((value: string) => {
      setQueryParams((prev) => ({
        ...prev,
        q: value,
        currentPage: 1,
      }));
    }, 500);
  }, []);

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

  return (
    <>
      <Space orientation="vertical" style={{ width: "100%" }} size="large">
        <Flex justify="space-between">
          <Breadcrumb
            separator={<RightOutlined />}
            items={[
              {
                title: <Link to="/">Dashboard</Link>,
              },
              {
                title: "Users",
              },
            ]}
          ></Breadcrumb>
          {isFetching && (
            <Spin
              indicator={<LoadingOutlined spin style={{ fontSize: 24 }} />}
            ></Spin>
          )}
          {isError && (
            <Typography.Text type="danger">{error.message}</Typography.Text>
          )}
        </Flex>
        <Form
          form={filterForm}
          onFieldsChange={(changedFields) => onFilterChange(changedFields)}
        >
          <UsersFilter
            children={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setDrawerOpen(true)}
              >
                Add User
              </Button>
            }
          />
        </Form>
        <Table
          pagination={{
            total: users?.total,
            pageSize: queryParams.perPage,
            current: queryParams.currentPage,
            showTotal: (total: number, range: number[]) => {
              return `Showing ${range[0]}-${range[1]} of ${total} items`;
            },
            onChange: (page) => {
              setQueryParams((prev) => {
                return {
                  ...prev,
                  currentPage: page,
                };
              });
            },
          }}
          dataSource={users?.data}
          columns={[
            ...columns,
            {
              title: "Actions",
              render: (_text: string, record: User) => {
                return (
                  <Space>
                    <Button
                      type="link"
                      onClick={() => {
                        setCurrentEditingUser(record);
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
        ></Table>

        <Drawer
          title={currentEditingUser ? "Edit user" : "Add user"}
          width={720}
          open={drawerOpen}
          styles={{
            body: {
              background: colorBgLayout,
            },
          }}
          destroyOnHidden
          extra={
            <Space>
              <Button
                onClick={() => {
                  form.resetFields();
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
          onClose={() => {
            form.resetFields();
            setCurrentEditingUser(null);
            setDrawerOpen(false);
          }}
        >
          <Form layout="vertical" form={form}>
            <UserForm isEditMode={!!currentEditingUser} />
          </Form>
        </Drawer>
      </Space>
    </>
  );
};

export default Users;
