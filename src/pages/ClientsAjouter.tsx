import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import ClientForm from '@/components/ClientForm';
import { Link } from 'react-router-dom';

const ClientsAjouter: React.FC = () => {
  const { isDark } = useTheme();
  const [showClientForm, setShowClientForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="py-4 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/clients/liste">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à la liste
              </Button>
            </Link>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Ajouter un client
            </h1>
          </div>
        </div>

        {/* Carte d'information */}
        <Card className={`max-w-2xl mx-auto shadow-soft animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className={`text-2xl ${isDark ? 'text-white' : ''}`}>
              Nouveau Client
            </CardTitle>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Remplissez le formulaire ci-dessous pour ajouter un nouveau client
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => setShowClientForm(true)}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ouvrir le formulaire
            </Button>
          </CardContent>
        </Card>

        {/* Modal d'ajout de client */}
        <ClientForm
          isOpen={showClientForm}
          onClose={() => setShowClientForm(false)}
          onSubmit={(data) => {
            console.log('Nouveau client:', data);
            setIsLoading(true);

            // Simuler l'ajout du client
            setTimeout(() => {
              setIsLoading(false);
              setShowClientForm(false);
              // Rediriger vers la liste après ajout
              window.location.href = '/clients/liste';
            }, 1500);
          }}
          isLoading={isLoading}
        />
    </div>
  );
};

export default ClientsAjouter;
