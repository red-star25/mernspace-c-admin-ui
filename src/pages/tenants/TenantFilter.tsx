import { Card, Col, Input, Row } from "antd";

type TenantFilterProp = {
  onFilterChange: (filterName: string, filterValue: string) => void;
  children: React.ReactNode;
};

const TenantFilter = ({ onFilterChange, children }: TenantFilterProp) => {
  return (
    <>
      <Card>
        <Row justify="space-between">
          <Col span={16}>
            <Row gutter={20}>
              <Col span={12}>
                <Input.Search
                  allowClear
                  onChange={(e) =>
                    onFilterChange("searchFilter", e.target.value)
                  }
                  placeholder="Search"
                ></Input.Search>
              </Col>
            </Row>
          </Col>
          <Col span={8} style={{ display: "flex", justifyContent: "end" }}>
            {children}
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default TenantFilter;
