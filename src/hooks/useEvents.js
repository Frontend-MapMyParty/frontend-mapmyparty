 import { useState, useEffect } from "react";

const STORAGE_KEY = "mapMyParty_events";

export const useEvents = () => {
  const [events, setEvents] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const addEvent = (event) => {
    const newEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  };

  const updateEvent = (id, updates) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === id ? { ...event, ...updates } : event))
    );
  };

  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const getPublishedEvents = () => {
    return events.filter((event) => event.status === "published");
  };

  const getDraftEvents = () => {
    return events.filter((event) => event.status === "draft");
  };

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getPublishedEvents,
    getDraftEvents,
  };
};
