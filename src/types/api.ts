export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  offset: number;
  limit: number;
};

export type ApiErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details: unknown;
  };
};

export type ListQuery = {
  offset?: number;
  limit?: number;
};
