import { useState, useCallback } from 'react';
import useFetch from './useFetch';

/**
 * useResults — Fetch exam results.
 *
 * Routes used:
 *  GET /api/results/my-results       → getMyResults      (auth — student's own results)
 *  GET /api/results/:id              → getResultById     (auth required)
 *  GET /api/results/exam/:examId     → getResultsByExam  (admin only)
 */
const useResults = () => {
  const { request, loading, error } = useFetch();
  const [myResults, setMyResults]   = useState([]);
  const [result, setResult]         = useState(null);
  const [examResults, setExamResults] = useState([]);

  // GET /api/results/my-results
  const getMyResults = useCallback(async () => {
    const data = await request('/results/my-results');
    setMyResults(data);
    return data;
  }, [request]);

  // GET /api/results/:id
  const getResultById = useCallback(async (id) => {
    const data = await request(`/results/${id}`);
    setResult(data);
    return data;
  }, [request]);

  // GET /api/results/exam/:examId  (admin only)
  const getResultsByExam = useCallback(async (examId) => {
    const data = await request(`/results/exam/${examId}`);
    setExamResults(data);
    return data;
  }, [request]);

  return {
    myResults,
    result,
    examResults,
    loading,
    error,
    getMyResults,
    getResultById,
    getResultsByExam,
  };
};

export default useResults;
