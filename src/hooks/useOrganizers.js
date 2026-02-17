import { useState, useEffect, useRef } from "react";
import { fetchAllOrganizers } from "@/services/organizerService";

export function useOrganizers() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAllOrganizers();
        if (mountedRef.current) {
          setOrganizers(data.organizers || []);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err.message || "Failed to fetch organizers");
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { organizers, loading, error };
}
