const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})/;

// All "date only" fields (start, due, joining, leave) are stored as UTC midnight
// so comparing them never depends on the server timezone.
function parseDateOnly(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : toDateOnly(value);
  }
  if (typeof value !== 'string') return null;

  const match = value.trim().match(DATE_ONLY_REGEX);
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  // rejects things like 2024-02-31
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return date;
}

function toDateOnly(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getToday() {
  const timeZone = process.env.APP_TIMEZONE || 'UTC';
  // en-CA gives YYYY-MM-DD
  const todayString = new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date());
  return parseDateOnly(todayString);
}

function formatDateOnly(date) {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
}

function isWithinRange(date, start, end) {
  if (!date || !start || !end) return false;
  const time = new Date(date).getTime();
  return time >= new Date(start).getTime() && time <= new Date(end).getTime();
}

module.exports = {
  parseDateOnly,
  getToday,
  formatDateOnly,
  isWithinRange,
};
