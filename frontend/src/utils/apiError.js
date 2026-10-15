export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (error.response) {
    return error.response.data?.message || fallback;
  }
  if (error.request) {
    return 'Could not reach the server. Check your connection and try again.';
  }
  return error.message || fallback;
}

export function getFieldErrors(error) {
  return error?.response?.data?.errors || {};
}

// When responseType is blob, the error body is a Blob too
export async function getBlobErrorMessage(error) {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      return parsed.message || 'Export failed';
    } catch {
      return 'Export failed';
    }
  }
  return getErrorMessage(error, 'Export failed');
}
