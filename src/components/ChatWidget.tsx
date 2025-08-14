import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  X, 
  Users, 
  Phone, 
  Video,
  Paperclip,
  Smile,
  MoreVertical
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: Date;
  senderName: string;
  avatar?: string;
}

interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: Date;
  isOnline: boolean;
  unreadCount: number;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample contacts
  const contacts: ChatContact[] = [
    {
      id: '1',
      name: 'Jean Kouassi',
      lastMessage: 'Bonjour, ma voiture est prête ?',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isOnline: true,
      unreadCount: 2
    },
    {
      id: '2',
      name: 'Marie Diabaté',
      lastMessage: 'Merci pour la réparation rapide !',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isOnline: false,
      unreadCount: 0
    },
    {
      id: '3',
      name: 'Garage Plateau',
      lastMessage: 'Avez-vous des pièces Renault ?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isOnline: true,
      unreadCount: 1
    },
    {
      id: '4',
      name: 'Koffi Yao',
      lastMessage: 'Rdv confirmé pour demain',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isOnline: false,
      unreadCount: 0
    }
  ];

  // Sample messages for selected contact
  const sampleMessages: Message[] = [
    {
      id: '1',
      text: 'Bonjour, j\'aimerais prendre un rendez-vous',
      sender: 'other',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      senderName: 'Jean Kouassi'
    },
    {
      id: '2',
      text: 'Bonjour ! Bien sûr, quel jour vous convient ?',
      sender: 'user',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      senderName: 'Vous'
    },
    {
      id: '3',
      text: 'Demain dans l\'après-midi si possible',
      sender: 'other',
      timestamp: new Date(Date.now() - 7 * 60 * 1000),
      senderName: 'Jean Kouassi'
    },
    {
      id: '4',
      text: 'Parfait ! 14h ça vous va ?',
      sender: 'user',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      senderName: 'Vous'
    },
    {
      id: '5',
      text: 'Oui c\'est parfait, merci !',
      sender: 'other',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      senderName: 'Jean Kouassi'
    }
  ];

  useEffect(() => {
    if (selectedContact) {
      setMessages(sampleMessages);
    }
  }, [selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() && selectedContact) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: 'user',
        timestamp: new Date(),
        senderName: 'Vous'
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      return `il y a ${Math.floor(diffInMinutes / 60)} h`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const totalUnread = contacts.reduce((sum, contact) => sum + contact.unreadCount, 0);

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-strong hover:shadow-strong transition-all duration-300 animate-bounce-gentle"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: '#25D366' }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {totalUnread > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 w-5 h-5 text-xs flex items-center justify-center"
              >
                {totalUnread}
              </Badge>
            )}
          </div>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 h-96 z-50 shadow-strong animate-scale-in">
          {!selectedContact ? (
            // Contact List
            <>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-80 overflow-y-auto">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-3 hover:bg-muted cursor-pointer border-b border-border/50 transition-colors"
                      onClick={() => setSelectedContact(contact)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={contact.avatar} alt={contact.name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {contact.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {contact.isOnline && (
                            <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{contact.name}</p>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-muted-foreground">
                                {formatLastSeen(contact.timestamp)}
                              </span>
                              {contact.unreadCount > 0 && (
                                <Badge variant="destructive" className="w-5 h-5 text-xs">
                                  {contact.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {contact.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </>
          ) : (
            // Chat Interface
            <>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedContact(null)}
                      className="p-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {selectedContact.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {selectedContact.isOnline && (
                        <div className="absolute -bottom-0 -right-0 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{selectedContact.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedContact.isOnline ? 'En ligne' : 'Hors ligne'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" className="p-1">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-1">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col">
                {/* Messages */}
                <div className="flex-1 max-h-60 overflow-y-auto p-3 space-y-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <p>{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-3 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="p-2">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder="Tapez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="sm" className="p-2">
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      )}
    </>
  );
};

export default ChatWidget;