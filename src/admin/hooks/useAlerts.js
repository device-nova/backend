import { useState, useCallback } from 'react';

export function useAlerts() {
  const [acknowledged, setAcknowledged] = useState(new Set());
  const [resolved, setResolved] = useState(new Set());

  const acknowledge = useCallback((id) => {
    setAcknowledged((prev) => new Set(prev).add(id));
  }, []);

  const resolve = useCallback((id) => {
    setResolved((prev) => new Set(prev).add(id));
  }, []);

  return {
    acknowledged,
    resolved,
    acknowledge,
    resolve,
  };
}
