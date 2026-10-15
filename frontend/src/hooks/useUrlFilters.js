import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

// Keeps list filters in the query string so refresh / shared links show the same view.
function useUrlFilters(keys) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const values = {};
    keys.forEach((key) => {
      values[key] = searchParams.get(key) || '';
    });
    return values;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);

  const updateFilters = useCallback(
    (changes) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(changes).forEach(([key, value]) => {
          if (value === '' || value === null || value === undefined) next.delete(key);
          else next.set(key, value);
        });
        // any filter change should go back to the first page
        next.delete('page');
        return next;
      });
    },
    [setSearchParams]
  );

  const setPage = useCallback(
    (newPage) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newPage <= 1) next.delete('page');
        else next.set('page', String(newPage));
        return next;
      });
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => setSearchParams({}), [setSearchParams]);

  // only non-empty values, ready to be sent as API params
  const apiParams = useMemo(() => {
    const params = { page };
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    return params;
  }, [filters, page]);

  return { filters, page, apiParams, updateFilters, setPage, clearFilters };
}

export default useUrlFilters;
