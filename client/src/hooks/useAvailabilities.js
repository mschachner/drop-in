import { useState, useCallback, useEffect } from 'react';
import {
  getAvailabilities,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  joinAvailability,
  unjoinAvailability,
} from '../api/availability';

const useAvailabilities = (userName, calendarId) => {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(Boolean(calendarId));
  const [error, setError] = useState(null);

  const fetchAvailabilities = useCallback(async () => {
    try {
      setLoading(true);
      if (!calendarId) {
        setAvailabilities([]);
        setLoading(false);
        return;
      }
      const { data } = await getAvailabilities(calendarId);
      setAvailabilities(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load availabilities');
    } finally {
      setLoading(false);
    }
  }, [calendarId]);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  const addAvailability = async (availability) => {
    const { data } = await createAvailability(availability);
    setAvailabilities((prev) => [...prev, data]);
  };

  const updateAvailabilityEntry = async (id, availability) => {
    const { data } = await updateAvailability(id, availability);
    setAvailabilities((prev) =>
      prev.map((a) => (a._id === id ? data : a))
    );
  };

  const deleteAvailabilityEntry = async (id) => {
    await deleteAvailability(id);
    setAvailabilities((prev) => prev.filter((a) => a._id !== id));
  };

  const toggleJoin = async (event) => {
    const isJoining = !(event.joiners || []).includes(userName);
    if (isJoining) {
      await joinAvailability(event._id, userName);
    } else {
      await unjoinAvailability(event._id, userName);
    }
    setAvailabilities((prev) =>
      prev.map((a) =>
        a._id === event._id
          ? {
              ...a,
              joiners: isJoining
                ? [...(a.joiners || []), userName]
                : a.joiners.filter((j) => j !== userName),
            }
          : a
      )
    );
  };

  return {
    availabilities,
    loading,
    error,
    setError,
    fetchAvailabilities,
    addAvailability,
    updateAvailability: updateAvailabilityEntry,
    deleteAvailability: deleteAvailabilityEntry,
    toggleJoin,
  };
};

export default useAvailabilities;
