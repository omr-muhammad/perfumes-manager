export const response = {
  ok: <T>(message: string, data?: T) => ({
    success: true,
    message,
    ...(data !== undefined && { data }),
  }),
  fail: <T>(message: string, error?: T) => ({
    success: false,
    message,
    ...(error !== undefined && { error }),
  }),
};
