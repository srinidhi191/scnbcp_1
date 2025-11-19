// Small helper types used across the web app to avoid using `any` in catches and import.meta casts
export type AxiosErrorLike = {
  response?: { data?: unknown; status?: number };
  message?: string;
};

export type ImportMetaEnvLike = Record<string, string | undefined>;
