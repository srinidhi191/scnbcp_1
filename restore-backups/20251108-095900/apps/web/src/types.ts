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

export type Notice = {
  _id: string;
  title: string;
  body: string;
  category: string;
  priority: "low" | "normal" | "high";
  status: "draft" | "scheduled" | "published" | "archived";
  visibility: "public" | "targeted";
  createdAt?: string;
  publishAt?: string;
};
