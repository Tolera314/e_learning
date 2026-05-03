"use client";

import { useEffect, useState } from "react";

export default function GlobalErrorListener() {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleApiError = (event: Event) => {
      const customEvent = event as CustomEvent;
      const status = customEvent.detail?.status;
      
      // We explicitly throw an error into the React render cycle for global Error Boundaries to catch.
      // We exclude 401 (handled by refresh flow), 400/422 (validation), 403 (unauthorized block), and 404 (not found).
      if (![400, 401, 403, 404, 422].includes(status as number)) {
        setError(new Error(customEvent.detail?.message || "An unexpected network error occurred"));
      }
    };

    window.addEventListener("api-error", handleApiError);
    return () => {
      window.removeEventListener("api-error", handleApiError);
    };
  }, []);

  if (error) {
    throw error; // Bubbles up to error.tsx
  }

  return null;
}
