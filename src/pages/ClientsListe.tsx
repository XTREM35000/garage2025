import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Phone, Mail, MapPin, Car, Calendar, DollarSign, Plus, Search, Edit, Trash2, Eye, Crown, Shield, User, Clock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import ClientForm from '@/components/ClientForm';
import ClientDetailModal from '@/components/ClientDetailModal';
import { Client, CLIENT_STATUTS } from '@/types/clients';
import ClientImages from '@/assets/images/clients.webp';


const ClientsListe: React.FC = () => {
  const { isDark } = useTheme();
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Données initiales enrichies
  const initialClients: Client[] = [
    {
      id: 1,
      name: 'Kouassi Jean',
      phone: '+225 07 58 96 61 56',
      email: 'kouassi.jean@gmail.com',
      adresse: 'Cocody, Abidjan',
      vehicules: ['Toyota Corolla 2018', 'Peugeot 206 2015'],
      derniereVisite: '2024-01-15',
      totalDepense: 450000,
      statut: 'Actif',
      dateNaissance: '1985-03-15',
      numeroPermis: 'CI-123456789',
      notes: 'Client fidèle, très satisfait de nos services',
      dateCreation: '2023-06-15T10:00:00Z'
    },
    {
      id: 2,
      name: 'Diabaté Fatou',
      phone: '+225 05 42 18 73 29',
      email: 'diabate.fatou@yahoo.fr',
      adresse: 'Marcory, Abidjan',
      vehicules: ['Peugeot 206 2017'],
      derniereVisite: '2024-01-12',
      totalDepense: 125000,
      statut: 'Actif',
      dateNaissance: '1990-07-22',
      numeroPermis: 'CI-987654321',
      notes: 'Préfère les réparations le matin',
      dateCreation: '2023-08-20T14:30:00Z'
    },
    {
      id: 3,
      name: 'Traoré Ali',
      phone: '+225 06 33 45 67 89',
      email: 'traore.ali@hotmail.com',
      adresse: 'Plateau, Abidjan',
      vehicules: ['Renault Logan 2019'],
      derniereVisite: '2024-01-18',
      totalDepense: 25000,
      statut: 'Nouveau',
      dateNaissance: '1995-11-08',
      numeroPermis: 'CI-456789123',
      notes: 'Nouveau client, première visite',
      dateCreation: '2024-01-18T09:15:00Z'
    },
    {
      id: 4,
      name: 'Yao Marie',
      phone: '+225 07 12 34 56 78',
      email: 'yao.marie@gmail.com',
      adresse: 'Yopougon, Abidjan',
      vehicules: ['Hyundai i10 2020'],
      derniereVisite: '2024-01-14',
      totalDepense: 180000,
      statut: 'Actif',
      dateNaissance: '1988-04-12',
      numeroPermis: 'CI-789123456',
      notes: 'Client régulier, toujours ponctuel',
      dateCreation: '2023-09-10T11:45:00Z'
    },
    {
      id: 5,
      name: 'Koné Issouf',
      phone: '+225 05 67 89 12 34',
      email: 'kone.issouf@yahoo.fr',
      adresse: 'Adjamé, Abidjan',
      vehicules: ['Dacia Sandero 2016'],
      derniereVisite: '2024-01-09',
      totalDepense: 75000,
      statut: 'Actif',
      dateNaissance: '1982-12-03',
      numeroPermis: 'CI-321654987',
      notes: 'Client de longue date, très satisfait',
      dateCreation: '2022-03-15T08:20:00Z'
    },
    {
      id: 6,
      name: 'Ouattara Aminata',
      phone: '+225 06 98 76 54 32',
      email: 'ouattara.aminata@gmail.com',
      adresse: 'Treichville, Abidjan',
      vehicules: ['Suzuki Swift 2021'],
      derniereVisite: '2024-01-20',
      totalDepense: 95000,
      statut: 'Nouveau',
      dateNaissance: '1992-09-18',
      numeroPermis: 'CI-147258369',
      notes: 'Nouvelle cliente, intéressée par nos services premium',
      dateCreation: '2024-01-20T16:30:00Z'
    },
    {
      id: 7,
      name: 'Bamba Souleymane',
      phone: '+225 07 45 67 89 12',
      email: 'bamba.souleymane@hotmail.com',
      adresse: 'Bingerville',
      vehicules: ['Toyota Hilux 2018'],
      derniereVisite: '2024-01-10',
      totalDepense: 320000,
      statut: 'VIP',
      dateNaissance: '1978-06-25',
      numeroPermis: 'CI-963852741',
      notes: 'Client VIP, propriétaire d\'entreprise, services premium',
      dateCreation: '2021-12-05T10:00:00Z'
    },
    {
      id: 8,
      name: 'Coulibaly Aïcha',
      phone: '+225 05 23 45 67 89',
      email: 'coulibaly.aicha@gmail.com',
      adresse: 'Grand-Bassam',
      vehicules: ['Renault Clio 2019'],
      derniereVisite: '2024-01-08',
      totalDepense: 89000,
      statut: 'Actif',
      dateNaissance: '1987-01-30',
      numeroPermis: 'CI-852963741',
      notes: 'Client fidèle, habite loin mais fait confiance à notre garage',
      dateCreation: '2023-04-12T13:15:00Z'
    }
  ];

  useEffect(() => {
    // Charger les données depuis localStorage ou utiliser les données initiales
    const savedClients = localStorage.getItem('clients');
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    } else {
      setClients(initialClients);
      localStorage.setItem('clients', JSON.stringify(initialClients));
    }
  }, []);

  // Sauvegarder les données dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  const handleAddClient = async (formData: any) => {
    setIsLoading(true);
    try {
      const newClient: Client = {
        id: Date.now(),
        name: `${formData.nom} ${formData.prenom}`,
        phone: formData.telephone,
        email: formData.email,
        adresse: formData.adresse,
        vehicules: [],
        derniereVisite: new Date().toISOString().split('T')[0],
        totalDepense: 0,
        statut: formData.statut === 'nouveau' ? 'Nouveau' :
          formData.statut === 'actif' ? 'Actif' :
            formData.statut === 'vip' ? 'VIP' : 'Inactif',
        dateNaissance: formData.dateNaissance || undefined,
        numeroPermis: formData.numeroPermis || undefined,
        notes: formData.notes || undefined,
        dateCreation: new Date().toISOString()
      };

      setClients(prev => [...prev, newClient]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClient = async (formData: any) => {
    if (!selectedClient) return;

    setIsLoading(true);
    try {
      const updatedClient: Client = {
        ...selectedClient,
        name: `${formData.nom} ${formData.prenom}`,
        phone: formData.telephone,
        email: formData.email,
        adresse: formData.adresse,
        statut: formData.statut === 'nouveau' ? 'Nouveau' :
          formData.statut === 'actif' ? 'Actif' :
            formData.statut === 'vip' ? 'VIP' : 'Inactif',
        dateNaissance: formData.dateNaissance || undefined,
        numeroPermis: formData.numeroPermis || undefined,
        notes: formData.notes || undefined,
        dateModification: new Date().toISOString()
      };

      setClients(prev => prev.map(client =>
        client.id === selectedClient.id ? updatedClient : client
      ));
      setIsModalOpen(false);
      setSelectedClient(null);
    } catch (error) {
      console.error('Erreur lors de la modification du client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClient = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      setClients(prev => prev.filter(client => client.id !== id));
    }
  };

  const openAddModal = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    // Convertir le client en format attendu par ClientForm
    const [nom, ...prenomParts] = client.name.split(' ');
    const prenom = prenomParts.join(' ');

    const formData = {
      nom: nom || '',
      prenom: prenom || '',
      telephone: client.phone,
      email: client.email,
      adresse: client.adresse,
      dateNaissance: client.dateNaissance || '',
      numeroPermis: client.numeroPermis || '',
      statut: client.statut === 'Nouveau' ? 'nouveau' :
        client.statut === 'Actif' ? 'actif' :
          client.statut === 'VIP' ? 'vip' : 'inactif',
      notes: client.notes || ''
    };

    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const openDetailModal = (client: Client) => {
    setSelectedClient(client);
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedClient(null);
  };

  // Filtrage des clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.adresse.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatut = filterStatut === 'all' ||
      (filterStatut === 'nouveau' && client.statut === 'Nouveau') ||
      (filterStatut === 'actif' && client.statut === 'Actif') ||
      (filterStatut === 'vip' && client.statut === 'VIP') ||
      (filterStatut === 'inactif' && client.statut === 'Inactif');

    return matchesSearch && matchesStatut;
  });

  // Calculs des statistiques
  const totalClients = clients.length;
  const clientsActifs = clients.filter(c => c.statut === 'Actif').length;
  const clientsVIP = clients.filter(c => c.statut === 'VIP').length;
  const totalChiffreAffaires = clients.reduce((sum, client) => sum + client.totalDepense, 0);

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'VIP':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      case 'Actif':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'Nouveau':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'Inactif':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'VIP':
        return <Crown className="w-4 h-4 text-purple-500" />;
      case 'Actif':
        return <Shield className="w-4 h-4 text-green-500" />;
      case 'Nouveau':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'Inactif':
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div>
      <div className="py-4 w-full">
        <picture>
          <source srcSet={ClientImages} type="image/webp" />
          <img
            className="w-full h-40 object-cover rounded-xl mb-6 shadow-soft animate-fade-in"
            src={ClientImages}
            alt="Parc automobile disponible"
            loading="lazy"
            decoding="async"
          />
        </picture>

        {/* En-tête avec bouton d'ajout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Gestion des Clients
          </h1>
          <Button
            onClick={openAddModal}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un client
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className={`shadow-soft animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total clients</p>
                  <p className="text-2xl font-bold text-blue-500">{totalClients}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-soft animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Clients actifs</p>
                  <p className="text-2xl font-bold text-green-500">{clientsActifs}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-soft animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Clients VIP</p>
                  <p className="text-2xl font-bold text-purple-500">{clientsVIP}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-soft animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Chiffre d'affaires</p>
                  <p className="text-xl font-bold text-green-500">
                    {(totalChiffreAffaires / 1000).toFixed(0)}k FCFA
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterStatut} onValueChange={setFilterStatut}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {CLIENT_STATUTS.map(statut => (
                <SelectItem key={statut.value} value={statut.value}>{statut.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Liste des clients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className={`shadow-soft animate-fade-in cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
              onClick={() => openDetailModal(client)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg ${isDark ? 'text-white' : ''}`}>{client.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(client.statut)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.statut)}`}>
                      {client.statut}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {client.phone}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {client.email}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {client.adresse}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Car className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {client.vehicules.length} véhicule(s)
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Dernière visite : {new Date(client.derniereVisite).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Total dépensé :
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {client.totalDepense.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetailModal(client);
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(client);
                    }}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClient(client.id);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Message si aucun résultat */}
        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client trouvé</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatut !== 'all'
                ? 'Aucun client ne correspond à vos critères de recherche.'
                : 'Aucun client enregistré.'
              }
            </p>
            {!searchTerm && filterStatut === 'all' && (
              <Button onClick={openAddModal} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Créer le premier client
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal pour ajouter/modifier */}
      <ClientForm
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={selectedClient ? handleUpdateClient : handleAddClient}
        isLoading={isLoading}
        initialData={selectedClient ? {
          nom: selectedClient.name.split(' ')[0] || '',
          prenom: selectedClient.name.split(' ').slice(1).join(' ') || '',
          telephone: selectedClient.phone,
          email: selectedClient.email,
          adresse: selectedClient.adresse,
          dateNaissance: selectedClient.dateNaissance || '',
          numeroPermis: selectedClient.numeroPermis || '',
          statut: selectedClient.statut === 'Nouveau' ? 'nouveau' :
            selectedClient.statut === 'Actif' ? 'actif' :
              selectedClient.statut === 'VIP' ? 'vip' : 'inactif',
          notes: selectedClient.notes || ''
        } : undefined}
      />

      {/* Modal pour afficher les détails */}
      <ClientDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        client={selectedClient}
        onEdit={openEditModal}
        onDelete={handleDeleteClient}
      />
    </div>
  );
};

export default ClientsListe;
