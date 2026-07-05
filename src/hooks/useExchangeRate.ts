import { useState, useEffect, useRef } from "react";
import type { ConversionState } from "../types";
import { fetchExchangeRate } from "../utils/api";

export function useExchangeRate(
  from: string,
  to: string
): ConversionState & { isRefreshing: boolean; refresh: () => void } {
  const [state, setState] = useState<ConversionState>({
    rate: null,
    status: "loading",
    error: null,
    updatedAt: null,
  });
  const [trigger, setTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const loadedPairRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const pair = `${from}-${to}`;
    const isSamePair = loadedPairRef.current === pair;

    if (isSamePair) {
      setIsRefreshing(true);
    } else {
      setState({ rate: null, status: "loading", error: null, updatedAt: null });
    }

    fetchExchangeRate(from, to)
      .then((rate) => {
        if (isMounted) {
          loadedPairRef.current = pair;
          setState({
            rate,
            status: "success",
            error: null,
            updatedAt: new Date().toLocaleTimeString("fi-FI"),
          });
          setIsRefreshing(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          loadedPairRef.current = null;
          setState({
            rate: null,
            status: "error",
            error: err instanceof Error ? err.message : String(err),
            updatedAt: null,
          });
          setIsRefreshing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [from, to, trigger]);

  return { ...state, isRefreshing, refresh: () => setTrigger((n) => n + 1) };
}