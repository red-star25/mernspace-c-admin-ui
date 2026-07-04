import { Breadcrumb, Skeleton, Space, Table } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../../http/api";
const Users = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => {
      return getUsers().then((res) => res.data.data);
    },
  });

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

  return (
    <>
      <Space orientation="vertical" style={{ width: "100%" }} size="large">
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
        {isLoading && <Skeleton active />}
        <Table dataSource={users} columns={columns}></Table>
      </Space>
    </>
  );
};

export default Users;
