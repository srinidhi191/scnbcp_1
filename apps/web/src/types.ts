export type Notice = {
  _id: string;
  title?: string;
  body?: string;
  category?: string;
  visibility?: string;
  status?: string;
  createdAt?: string | number | Date;
  publishAt?: string | number | Date;
  createdBy?: string | { _id?: string };
};

export type User = {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  departmentId?: string;
  programId?: string;
  batchId?: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};
