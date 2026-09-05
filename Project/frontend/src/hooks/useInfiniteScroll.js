import { useState, useEffect, useCallback, useRef } from 'react';

export const useInfiniteScroll = (fetchFunction, options = {}) => {
  const {
    initialPage = 1,
    initialData = [],
    limit = 12,
    enabled = true,
  } = options;

  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  
  const observerRef = useRef();
  const lastElementRef = useCallback((node) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && enabled) {
        setPage((prevPage) => prevPage + 1);
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, enabled]);

  const fetchData = async () => {
    if (loading || !hasMore || !enabled) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetchFunction(page, limit);
      
      const newData = response.data?.docs || response.data || [];
      const totalPages = response.data?.totalPages || 1;
      
      setData((prevData) => [...prevData, ...newData]);
      setHasMore(page < totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [page, enabled]);

  const reset = () => {
    setData(initialData);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
  };

  return { data, loading, hasMore, error, lastElementRef, reset };
};

export default useInfiniteScroll;
