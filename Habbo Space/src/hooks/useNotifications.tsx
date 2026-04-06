import { useState, useCallback } from "react";

export interface BetNotification {
  id: string;
  betId: string;
  from: string;
  activity: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  timestamp: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<BetNotification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<BetNotification, "id" | "timestamp">) => {
      const newNotification: BetNotification = {
        ...notification,
        id: `notif-${Date.now()}`,
        timestamp: Date.now(),
      };
      setNotifications((prev) => [newNotification, ...prev]);
      return newNotification;
    },
    []
  );

  const approveNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, status: "approved" } : n
      )
    );
  }, []);

  const rejectNotification = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, status: "rejected" } : n
      )
    );
  }, []);

  const getPendingNotifications = useCallback(() => {
    return notifications.filter((n) => n.status === "pending");
  }, [notifications]);

  return {
    notifications,
    addNotification,
    approveNotification,
    rejectNotification,
    getPendingNotifications,
  };
}
