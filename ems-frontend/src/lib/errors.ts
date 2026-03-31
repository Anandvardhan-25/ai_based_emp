import type { AxiosError } from "axios";

export type ApiError = {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: Array<{ field: string; message: string }>;
};

export function getErrorMessage(err: unknown) {
  const ax = err as AxiosError<ApiError>;
  if (ax?.response?.data?.message) return ax.response.data.message;
  if (ax?.message) return ax.message;
  return "Something went wrong";
}

