const successResponse = (
  res,
  statusCode,
  data = undefined,
  message = "Success",
  extras = {},
) => {
  const response = { success: true, message };
  if (data !== undefined) response.data = data;
  Object.assign(response, extras);
  return res.status(statusCode).json(response);
};

export default successResponse;
