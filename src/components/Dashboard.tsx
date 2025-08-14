import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BarChart3, 
  Users, 
  Car, 
  Wrench, 
  TrendingUp, 
  MessageCircle, 
  Bell,
  Settings,
  FileText,
  Calendar,
  DollarSign,
  PlusCircle,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import ChatWidget from './ChatWidget';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DashboardProps {
  garageData: {
    name: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    themeColor: string;
    logoFile: File | null;
  };
}

const Dashboard = ({ garageData }: DashboardProps) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Sample data for charts
  const revenueData = [
    { month: 'Jan', revenue: 4500000, repairs: 45 },
    { month: 'Fév', revenue: 5200000, repairs: 52 },
    { month: 'Mar', revenue: 4800000, repairs: 48 },
    { month: 'Avr', revenue: 6100000, repairs: 61 },
    { month: 'Mai', revenue: 5800000, repairs: 58 },
    { month: 'Jun', revenue: 6800000, repairs: 68 },
  ];

  const repairTypeData = [
    { type: 'Vidange', count: 120 },
    { type: 'Freinage', count: 85 },
    { type: 'Pneus', count: 95 },
    { type: 'Moteur', count: 45 },
    { type: 'Climatisation', count: 35 },
  ];

  const recentRepairs = [
    { id: 1, client: 'Jean Kouassi', vehicle: 'Toyota Camry', status: 'En cours', priority: 'Urgent' },
    { id: 2, client: 'Marie Diabaté', vehicle: 'Honda Civic', status: 'Terminé', priority: 'Normal' },
    { id: 3, client: 'Koffi Yao', vehicle: 'Nissan Sentra', status: 'En attente', priority: 'Normal' },
    { id: 4, client: 'Aya Traoré', vehicle: 'Ford Focus', status: 'En cours', priority: 'Urgent' },
  ];

  const upcomingAppointments = [
    { time: '09:00', client: 'Paul Mensah', service: 'Vidange + Filtres' },
    { time: '11:30', client: 'Fatou Diallo', service: 'Diagnostic moteur' },
    { time: '14:00', client: 'Ibrahim Sanogo', service: 'Changement pneus' },
    { time: '16:30', client: 'Adjoua Koffi', service: 'Révision générale' },
  ];

  const statCards = [
    { title: 'Chiffre d\'affaires', value: '6,800,000', unit: 'FCFA', icon: DollarSign, trend: '+12%', color: 'text-green-600' },
    { title: 'Réparations', value: '68', unit: 'ce mois', icon: Wrench, trend: '+8%', color: 'text-blue-600' },
    { title: 'Clients actifs', value: '156', unit: 'clients', icon: Users, trend: '+15%', color: 'text-purple-600' },
    { title: 'Véhicules', value: '89', unit: 'véhicules', icon: Car, trend: '+5%', color: 'text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{garageData.name}</h1>
                <p className="text-sm text-muted-foreground">{garageData.ownerName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                <Badge variant="destructive" className="ml-1">3</Badge>
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" alt={garageData.ownerName} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {garageData.ownerName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index} className="animate-fade-in shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.unit}</p>
                    </div>
                    <p className={`text-xs ${stat.color} font-medium`}>
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      {stat.trend}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="animate-slide-up shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Évolution du chiffre d'affaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} FCFA`, 'Chiffre d\'affaires']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={garageData.themeColor} 
                    strokeWidth={3}
                    dot={{ fill: garageData.themeColor, strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="animate-slide-up shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Types de réparations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={repairTypeData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="type" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill={garageData.themeColor} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-fade-in shadow-soft">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Réparations récentes
                </CardTitle>
                <Button variant="outline" size="sm">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Nouvelle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRepairs.map((repair) => (
                  <div key={repair.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {repair.client.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{repair.client}</p>
                        <p className="text-sm text-muted-foreground">{repair.vehicle}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={repair.priority === 'Urgent' ? 'destructive' : 'secondary'}>
                        {repair.priority}
                      </Badge>
                      <Badge variant={repair.status === 'Terminé' ? 'default' : 'outline'}>
                        {repair.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Rendez-vous aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="text-center">
                      <div className="font-bold text-primary">{appointment.time}</div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{appointment.client}</p>
                      <p className="text-sm text-muted-foreground">{appointment.service}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default Dashboard;