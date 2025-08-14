import { useState, useCallback } from 'react';
import { NotificationData } from '@/components/ui/notification-enhanced';

interface NotificationWithId extends NotificationData {
  id: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationWithId[]>([]);

  const addNotification = useCallback((notification: NotificationData) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Méthodes d'aide pour les types de notifications
  const success = useCallback((title: string, message: string, options?: Partial<NotificationData>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      duration: 4000,
      ...options
    });
  }, [addNotification]);

  const error = useCallback((title: string, message: string, options?: Partial<NotificationData>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      duration: 6000,
      ...options
    });
  }, [addNotification]);

  const warning = useCallback((title: string, message: string, options?: Partial<NotificationData>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      duration: 5000,
      ...options
    });
  }, [addNotification]);

  const info = useCallback((title: string, message: string, options?: Partial<NotificationData>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      duration: 4000,
      ...options
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };
};