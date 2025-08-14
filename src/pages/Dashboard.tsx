import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Car, Wrench, TrendingUp } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import DashboardImage from '@/assets/images/dashboard.webp';

const Dashboard: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="py-4 w-full">
      {/* Main content */}
      <picture>
        <source srcSet={DashboardImage} type="image/webp" />
        <img
          className="w-full h-40 object-cover rounded-xl mb-6 shadow-soft animate-fade-in"
          src={DashboardImage}
          alt="Parc automobile disponible"
          loading="lazy"
          decoding="async"
        />
      </picture>
      <h1 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Tableau de bord
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className={`shadow-lg animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <CardTitle className={isDark ? 'text-white' : ''}>Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-500">+120</p>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Interventions ce mois</p>
          </CardContent>
        </Card>
        <Card className={`shadow-lg animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <CardTitle className={isDark ? 'text-white' : ''}>Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-500">56</p>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Clients actifs</p>
          </CardContent>
        </Card>
        <Card className={`shadow-lg animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <CardTitle className={isDark ? 'text-white' : ''}>Véhicules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">89</p>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Véhicules suivis</p>
          </CardContent>
        </Card>
        <Card className={`shadow-lg animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <CardTitle className={isDark ? 'text-white' : ''}>Réparations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-500">14</p>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>En cours</p>
          </CardContent>
        </Card>
        <Card className={`shadow-lg animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <CardTitle className={isDark ? 'text-white' : ''}>Chiffre d'affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-500">8 250 000 FCFA</p>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Ce mois</p>
          </CardContent>
        </Card>
      </div>
      <div className={`rounded-xl p-6 shadow-lg animate-fade-in ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
        <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Bienvenue sur votre espace GarageManager !
        </h2>
        <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
          Gérez vos clients, véhicules, réparations et stocks en toute simplicité.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
