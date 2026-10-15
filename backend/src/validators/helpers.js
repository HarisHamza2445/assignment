const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');

const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

const cleanString = (value) => (isBlank(value) ? '' : String(value).trim());

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value) && String(value).length === 24;

function throwIfErrors(errors) {
  const fields = Object.keys(errors);
  if (fields.length) {
    // first message is used as the summary, the full map lets the form highlight fields
    throw ApiError.badRequest(errors[fields[0]], errors);
  }
}

module.exports = {
  isBlank,
  cleanString,
  isValidObjectId,
  throwIfErrors,
};
