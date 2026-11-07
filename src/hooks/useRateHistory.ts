import { useState, useEffect } from "react";
import type { RateHistoryPoint } from "../types";
import { fetchExchangeRateHistory } from "../utils/api";

interface HistoryState {
  points: RateHistoryPoint[];
  status: "loading" | "success" | "error";
}

export function useRateHistory(from: string, to: string): HistoryState {
  const pair = `${from}-${to}`;
  const [loadedPair, setLoadedPair] = useState(pair);
  const [state, setState] = useState<HistoryState>({ points: [], status: "loading" });

  if (loadedPair !== pair) {
    setLoadedPair(pair);
    setState({ points: [], status: "loading" });
  }

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    fetchExchangeRateHistory(from, to, { signal: controller.signal })
      .then((points) => {
        if (isMounted) setState({ points, status: "success" });
      })
      .catch(() => {
        if (isMounted) setState({ points: [], status: "error" });
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [from, to]);

  return state;
}
