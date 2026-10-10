function ErrorResponse(message, statusCode) {
  if (!(this instanceof ErrorResponse)) {
    return new ErrorResponse(message, statusCode);
  }
  const error = new Error(message);
  Object.setPrototypeOf(error, ErrorResponse.prototype);
  error.statusCode = statusCode;
  error.success = false;
  return error;
}

ErrorResponse.prototype = Object.create(Error.prototype);
ErrorResponse.prototype.constructor = ErrorResponse;

export default ErrorResponse;
