const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../constants');

function getPagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const requestedLimit = parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE;
  const limit = Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE);

  return { page, limit, skip: (page - 1) * limit };
}

function buildPaginationMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1),
  };
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// "High,Critical" -> ['High', 'Critical']
function toList(value) {
  if (value === undefined || value === null || value === '') return [];
  const raw = Array.isArray(value) ? value : String(value).split(',');
  return raw.map((item) => item.trim()).filter(Boolean);
}

module.exports = {
  getPagination,
  buildPaginationMeta,
  escapeRegex,
  toList,
};
