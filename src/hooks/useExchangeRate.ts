import { useState, useEffect } from "react";
import type { ConversionState } from "../types";
import { fetchExchangeRate } from "../utils/api";

export function useExchangeRate(
  from: string,
  to: string
): ConversionState & { refresh: () => void } {
  const [state, setState] = useState<ConversionState>({
    rate: null,
    status: "loading",
    error: null,
    updatedAt: null,
  });
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    fetchExchangeRate(from, to)
      .then((rate) => {
        if (isMounted) {
          setState({
            rate,
            status: "success",
            error: null,
            updatedAt: new Date().toLocaleTimeString("fi-FI"),
          });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setState({
            rate: null,
            status: "error",
            error: err instanceof Error ? err.message : String(err),
            updatedAt: null,
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [from, to, trigger]);

  return { ...state, refresh: () => setTrigger((n) => n + 1) };
}