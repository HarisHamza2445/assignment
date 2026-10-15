const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

const DUPLICATE_FIELD_LABELS = {
  employeeId: 'Employee ID',
  email: 'Email',
};

function normalizeError(err) {
  if (err instanceof ApiError) return err;

  // duplicate key from a unique index
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || err.keyPattern || {})[0];
    const label = DUPLICATE_FIELD_LABELS[field] || field;
    return new ApiError(409, `${label} already exists`, field ? { [field]: `${label} already exists` } : undefined);
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = {};
    Object.values(err.errors).forEach((e) => {
      errors[e.path] = e.message;
    });
    return new ApiError(400, Object.values(errors)[0] || 'Invalid data', errors);
  }

  if (err instanceof mongoose.Error.CastError) {
    return new ApiError(400, `Invalid value for ${err.path}`);
  }

  if (err.type === 'entity.parse.failed') {
    return new ApiError(400, 'Request body is not valid JSON');
  }

  return null;
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const apiError = normalizeError(err);

  if (!apiError) {
    console.error(err);
    return res.status(500).json({ message: 'Something went wrong on the server' });
  }

  const body = { message: apiError.message };
  if (apiError.errors) body.errors = apiError.errors;
  return res.status(apiError.statusCode).json(body);
}

module.exports = errorHandler;
