export type Credentials = {
  email: string;
  password: string;
};

export type User = {
  id: number;
  email: string;
  createdAt: string;
  firstName: string;
  lastName: string;
};

export type Tenant = {
  id: number;
  address: string;
  name: string;
};

export type CreateUserData = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  tenantId: number;
};

export type TenantData = {
  name: string;
  address: string;
};

export type FieldData = {
  name: string;
  value?: string;
};
