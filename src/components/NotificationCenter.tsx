import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Wrench,
  User,
  Package,
  Settings,
  Clock,
  Check,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Notification, NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from '@/types/notifications';
import { useNavigate } from 'react-router-dom';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  // Données de démonstration
  const demoNotifications: Notification[] = [
    {
      id: 1,
      title: 'Réparation terminée',
      message: 'La réparation du véhicule Toyota Corolla de Kouassi Jean a été terminée avec succès.',
      type: 'success',
      category: 'reparation',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
      read: false,
      actionUrl: '/reparations',
      actionText: 'Voir les détails',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Stock faible',
      message: 'Le stock de filtres à huile est faible (5 unités restantes). Pensez à commander.',
      type: 'warning',
      category: 'stock',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
      read: false,
      actionUrl: '/stock',
      actionText: 'Gérer le stock',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Nouveau client',
      message: 'Un nouveau client "Traoré Ali" a été ajouté au système.',
      type: 'info',
      category: 'client',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
      read: true,
      actionUrl: '/clients/liste',
      actionText: 'Voir le profil',
      priority: 'low'
    },
    {
      id: 4,
      title: 'Rappel de maintenance',
      message: 'La révision du véhicule Peugeot 206 de Diabaté Fatou est prévue dans 3 jours.',
      type: 'info',
      category: 'reminder',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
      read: false,
      actionUrl: '/reparations',
      actionText: 'Planifier',
      priority: 'medium'
    },
    {
      id: 5,
      title: 'Sauvegarde automatique',
      message: 'La sauvegarde automatique des données a été effectuée avec succès.',
      type: 'success',
      category: 'system',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8h ago
      read: true,
      priority: 'low'
    },
    {
      id: 6,
      title: 'Erreur de connexion',
      message: 'Problème de connexion à la base de données. Tentative de reconnexion en cours.',
      type: 'error',
      category: 'system',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12h ago
      read: false,
      priority: 'high'
    }
  ];

  useEffect(() => {
    // Charger les notifications depuis localStorage ou utiliser les données de démonstration
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      setNotifications(demoNotifications);
      localStorage.setItem('notifications', JSON.stringify(demoNotifications));
    }
  }, []);

  // Sauvegarder les notifications dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      setNotifications([]);
    }
  };

  const handleAction = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      onClose();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reparation':
        return <Wrench className="w-4 h-4" />;
      case 'client':
        return <User className="w-4 h-4" />;
      case 'stock':
        return <Package className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
      case 'reminder':
        return <Clock className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = NOTIFICATION_CATEGORIES.find(c => c.value === category);
    return cat ? cat.color : 'text-gray-600 bg-gray-100';
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </DialogTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-700"
            >
              <Check className="w-4 h-4 mr-1" />
              Tout marquer comme lu
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Filtres */}
        <div className="flex space-x-2 pb-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Toutes ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Non lues ({unreadCount})
          </Button>
          <Button
            variant={filter === 'read' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('read')}
          >
            Lues ({notifications.length - unreadCount})
          </Button>
        </div>

        <Separator />

        {/* Liste des notifications */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3 pt-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {filter === 'all'
                    ? 'Aucune notification'
                    : filter === 'unread'
                    ? 'Aucune notification non lue'
                    : 'Aucune notification lue'
                  }
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                    notification.read
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white border-blue-200 shadow-sm'
                  } ${notification.priority === 'high' ? 'ring-2 ring-red-200' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`text-sm font-semibold ${
                          notification.read ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getCategoryColor(notification.category)}>
                            {getCategoryIcon(notification.category)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                      </div>

                      <p className={`text-sm mb-3 ${
                        notification.read ? 'text-gray-600' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {notification.actionUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(notification)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {notification.actionText}
                            </Button>
                          )}

                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Marquer comme lu
                            </Button>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationCenter;
