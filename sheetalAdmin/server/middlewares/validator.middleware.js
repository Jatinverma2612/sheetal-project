import ErrorResponse from "../utils/ErrorResponse.js";

// register validation
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return next(
      ErrorResponse("All fields (name, email, password) are required", 400),
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(ErrorResponse("Invalid email format", 400));
  }

  if (password.length < 8) {
    return next(
      ErrorResponse("Password must be at least 8 characters long", 400),
    );
  }

  next();
};

// login validation
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return next(ErrorResponse("Email and password are required", 400));
  }

  next();
};
