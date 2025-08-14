export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'reparation' | 'client' | 'stock' | 'system' | 'reminder';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  icon?: string;
  priority: 'low' | 'medium' | 'high';
}

export const NOTIFICATION_TYPES = [
  { value: 'info', label: 'Information', color: 'text-blue-600 bg-blue-100', icon: 'Info' },
  { value: 'success', label: 'Succès', color: 'text-green-600 bg-green-100', icon: 'CheckCircle' },
  { value: 'warning', label: 'Avertissement', color: 'text-yellow-600 bg-yellow-100', icon: 'AlertTriangle' },
  { value: 'error', label: 'Erreur', color: 'text-red-600 bg-red-100', icon: 'XCircle' }
] as const;

export const NOTIFICATION_CATEGORIES = [
  { value: 'reparation', label: 'Réparation', color: 'text-purple-600 bg-purple-100', icon: 'Wrench' },
  { value: 'client', label: 'Client', color: 'text-blue-600 bg-blue-100', icon: 'User' },
  { value: 'stock', label: 'Stock', color: 'text-orange-600 bg-orange-100', icon: 'Package' },
  { value: 'system', label: 'Système', color: 'text-gray-600 bg-gray-100', icon: 'Settings' },
  { value: 'reminder', label: 'Rappel', color: 'text-green-600 bg-green-100', icon: 'Clock' }
] as const;

export type NotificationType = typeof NOTIFICATION_TYPES[number]['value'];
export type NotificationCategory = typeof NOTIFICATION_CATEGORIES[number]['value'];
export type NotificationPriority = 'low' | 'medium' | 'high';
