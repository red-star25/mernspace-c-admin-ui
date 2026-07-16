import {
  Breadcrumb,
  Button,
  Drawer,
  Flex,
  Form,
  Skeleton,
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
import { createUser, getUsers } from "../../http/api";
import { useAuthStore } from "../../store";
import UsersFilter from "./UsersFilter";
import React, { useState } from "react";
import UserForm from "./forms/UserForm";
import type { CreateUserData } from "../../types";
import { PER_PAGE } from "../../constants";

const Users = () => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();
  const {
    token: { colorBgLayout },
  } = theme.useToken();

  const [drawerOpen, setDrawerOpen] = useState(false);

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
      const queryString = new URLSearchParams(
        queryParams as unknown as Record<string, string>,
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
  ];

  const onHandleSubmit = async () => {
    const values = await form.validateFields();
    userMutate(values);
    form.resetFields();
    setDrawerOpen(false);
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
          onFilterChange={(filterName, filterValue) =>
            console.log(filterName, filterValue)
          }
        />
        <Table
          pagination={{
            total: users?.total,
            pageSize: queryParams.perPage,
            current: queryParams.currentPage,
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
          columns={columns}
          rowKey={"id"}
        ></Table>

        <Drawer
          title="Create user"
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
            setDrawerOpen(false);
          }}
        >
          <Form layout="vertical" form={form}>
            <UserForm />
          </Form>
        </Drawer>
      </Space>
    </>
  );
};

export default Users;
