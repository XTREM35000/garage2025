import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Clock, CheckCircle, AlertCircle, DollarSign, Plus, Camera, Eye, AlertTriangle, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { usePhotoEvidence } from '@/hooks/usePhotoEvidence';
import { needsPhotoEvidence } from '@/utils/photoEvidence';
import ReparationModal from '@/components/ReparationModal';
import ReparationDetailModal from '@/components/ReparationDetailModal';
import { Reparation, REPARATION_STATUTS, VEHICULES_EXEMPLES, CLIENTS_EXEMPLES } from '@/types/reparations';
import ReparationImages from '@/assets/images/reparation.webp';


const Reparations: React.FC = () => {
  const { isDark } = useTheme();
  const [reparations, setReparations] = useState<Reparation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedReparation, setSelectedReparation] = useState<Reparation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  const [filterVehicule, setFilterVehicule] = useState('all');
  const { hasPhotoEvidence, getPhotoEvidence } = usePhotoEvidence();

  // Données initiales
  const initialReparations: Reparation[] = [
    {
      id: 1,
      vehicule: 'Toyota Corolla',
      client: 'Kouassi Jean',
      statut: 'En cours',
      description: 'Vidange + Filtres',
      prix: 45000,
      dateDebut: '2024-01-15',
      dateFin: '2024-01-16',
      technicien: 'Thierry Gogo',
      priorite: 'Normale',
      notes: 'Vidange complète avec remplacement des filtres',
      piecesUtilisees: ['Filtre à huile', 'Huile moteur 5W30', 'Filtre à air'],
      tempsEstime: 2,
      tempsReel: 1.5,
      dateCreation: '2024-01-15T08:00:00Z'
    },
    {
      id: 2,
      vehicule: 'Peugeot 206',
      client: 'Diabaté Fatou',
      statut: 'Terminé',
      description: 'Réparation freinage',
      prix: 125000,
      dateDebut: '2024-01-10',
      dateFin: '2024-01-12',
      technicien: 'Mamadou Diallo',
      priorite: 'Haute',
      notes: 'Remplacement des plaquettes et disques de frein avant',
      piecesUtilisees: ['Plaquettes de frein avant', 'Disques de frein avant', 'Liquide de frein'],
      tempsEstime: 4,
      tempsReel: 3.5,
      dateCreation: '2024-01-10T09:00:00Z',
      dateModification: '2024-01-12T17:00:00Z'
    },
    {
      id: 3,
      vehicule: 'Renault Logan',
      client: 'Traoré Ali',
      statut: 'En attente',
      description: 'Diagnostic moteur',
      prix: 25000,
      dateDebut: '2024-01-18',
      technicien: 'Kouassi Koffi',
      priorite: 'Basse',
      notes: 'Diagnostic complet du système moteur',
      tempsEstime: 1,
      dateCreation: '2024-01-18T10:00:00Z'
    },
    {
      id: 4,
      vehicule: 'Hyundai i10',
      client: 'Yao Marie',
      statut: 'En cours',
      description: 'Remplacement embrayage',
      prix: 180000,
      dateDebut: '2024-01-14',
      technicien: 'Yao Yao',
      priorite: 'Urgente',
      notes: 'Remplacement complet de l\'embrayage',
      piecesUtilisees: ['Kit embrayage complet', 'Huile de transmission'],
      tempsEstime: 6,
      tempsReel: 5,
      dateCreation: '2024-01-14T08:30:00Z'
    },
    {
      id: 5,
      vehicule: 'Dacia Sandero',
      client: 'Koné Issouf',
      statut: 'Terminé',
      description: 'Révision complète',
      prix: 75000,
      dateDebut: '2024-01-08',
      dateFin: '2024-01-09',
      technicien: 'Traoré Moussa',
      priorite: 'Normale',
      notes: 'Révision complète du véhicule',
      piecesUtilisees: ['Filtres divers', 'Huiles', 'Bougies'],
      tempsEstime: 3,
      tempsReel: 2.5,
      dateCreation: '2024-01-08T07:00:00Z',
      dateModification: '2024-01-09T16:00:00Z'
    },
    {
      id: 6,
      vehicule: 'Suzuki Swift',
      client: 'Ouattara Aminata',
      statut: 'En attente',
      description: 'Réparation climatisation',
      prix: 95000,
      dateDebut: '2024-01-20',
      technicien: 'Koné Issouf',
      priorite: 'Normale',
      notes: 'Réparation du système de climatisation',
      piecesUtilisees: ['Compresseur climatisation', 'Filtre habitacle'],
      tempsEstime: 4,
      dateCreation: '2024-01-20T11:00:00Z'
    }
  ];

  useEffect(() => {
    // Charger les données depuis localStorage ou utiliser les données initiales
    const savedReparations = localStorage.getItem('reparations');
    if (savedReparations) {
      setReparations(JSON.parse(savedReparations));
    } else {
      setReparations(initialReparations);
      localStorage.setItem('reparations', JSON.stringify(initialReparations));
    }
  }, []);

  // Sauvegarder les données dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('reparations', JSON.stringify(reparations));
  }, [reparations]);

  const handleAddReparation = (newReparation: Omit<Reparation, 'id' | 'dateCreation' | 'dateModification'>) => {
    const reparation: Reparation = {
      ...newReparation,
      id: Date.now(),
      dateCreation: new Date().toISOString()
    };
    setReparations(prev => [...prev, reparation]);
  };

  const handleUpdateReparation = (updatedReparation: Reparation) => {
    setReparations(prev => prev.map(rep =>
      rep.id === updatedReparation.id ? updatedReparation : rep
    ));
  };

  const handleDeleteReparation = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réparation ?')) {
      setReparations(prev => prev.filter(rep => rep.id !== id));
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedReparation(null);
    setIsModalOpen(true);
  };

  const openEditModal = (reparation: Reparation) => {
    setModalMode('edit');
    setSelectedReparation(reparation);
    setIsModalOpen(true);
  };

  const openDetailModal = (reparation: Reparation) => {
    setSelectedReparation(reparation);
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReparation(null);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedReparation(null);
  };

  // Filtrage des réparations
  const filteredReparations = reparations.filter(rep => {
    const matchesSearch = rep.vehicule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatut = filterStatut === 'all' || rep.statut === filterStatut;
    const matchesVehicule = filterVehicule === 'all' || rep.vehicule === filterVehicule;

    return matchesSearch && matchesStatut && matchesVehicule;
  });

  // Calculs des statistiques
  const totalChiffreAffaires = reparations
    .filter(r => r.statut === 'Terminé')
    .reduce((sum, r) => sum + r.prix, 0);

  const reparationsEnCours = reparations.filter(r => r.statut === 'En cours').length;
  const reparationsTerminees = reparations.filter(r => r.statut === 'Terminé').length;
  const reparationsEnAttente = reparations.filter(r => r.statut === 'En attente').length;

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'En cours':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'Terminé':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'En attente':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'Annulé':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Wrench className="w-5 h-6 text-primary" />;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'En cours':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'Terminé':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'En attente':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Annulé':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPrioriteColor = (priorite?: string) => {
    switch (priorite) {
      case 'Urgente':
        return 'text-red-600 bg-red-100';
      case 'Haute':
        return 'text-orange-600 bg-orange-100';
      case 'Normale':
        return 'text-blue-600 bg-blue-100';
      case 'Basse':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div>
      <div className="py-4 w-full">
        <picture>
          <source srcSet={ReparationImages} type="image/webp" />
          <img
            className="w-full h-40 object-cover rounded-xl mb-6 shadow-soft animate-fade-in"
            src={ReparationImages}
            alt="Parc automobile disponible"
            loading="lazy"
            decoding="async"
          />
        </picture>

        {/* En-tête avec bouton d'ajout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Réparations
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {totalChiffreAffaires.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <Button
              onClick={openAddModal}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Réparation
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className={`shadow-soft animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>En cours</p>
                  <p className="text-2xl font-bold text-blue-500">{reparationsEnCours}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-soft animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Terminées</p>
                  <p className="text-2xl font-bold text-green-500">{reparationsTerminees}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-soft animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>En attente</p>
                  <p className="text-2xl font-bold text-yellow-500">{reparationsEnAttente}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-soft animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total</p>
                  <p className="text-2xl font-bold text-purple-500">{reparations.length}</p>
                </div>
                <Wrench className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher une réparation..."
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
              {REPARATION_STATUTS.map(statut => (
                <SelectItem key={statut.value} value={statut.value}>{statut.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterVehicule} onValueChange={setFilterVehicule}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les véhicules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les véhicules</SelectItem>
              {VEHICULES_EXEMPLES.map(vehicule => (
                <SelectItem key={vehicule} value={vehicule}>{vehicule}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Liste des réparations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReparations.map((r) => (
            <Card
              key={r.id}
              className={`shadow-soft animate-fade-in cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
              onClick={() => openDetailModal(r)}
            >
              <CardHeader className="flex flex-row items-center gap-3">
                {getStatusIcon(r.statut)}
                <div className="flex-1">
                  <CardTitle className={`text-lg ${isDark ? 'text-white' : ''}`}>{r.vehicule}</CardTitle>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{r.client}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>Description :</strong> {r.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(r.statut)}`}>
                      {r.statut}
                    </span>
                    {r.priorite && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioriteColor(r.priorite)}`}>
                        {r.priorite}
                      </span>
                    )}
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {r.prix.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <p>Début : {new Date(r.dateDebut).toLocaleDateString('fr-FR')}</p>
                  {r.dateFin && <p>Fin : {new Date(r.dateFin).toLocaleDateString('fr-FR')}</p>}
                  {r.technicien && <p>Tech : {r.technicien}</p>}
                </div>

                {/* Indicateur de preuves photo */}
                {needsPhotoEvidence({
                  id: r.id.toString(),
                  durationHours: 48,
                  type: r.description.toLowerCase(),
                  vehicleValue: 6000000,
                  client: { isBlacklisted: false }
                }) && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        {hasPhotoEvidence(r.id.toString()) ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <Camera className="w-4 h-4" />
                            <span className="text-xs">Photos capturées</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs">Photos requises</span>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReparation(r);
                        }}
                        className="text-xs"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Voir
                      </Button>
                    </div>
                  )}

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(r);
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteReparation(r.id);
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
        {filteredReparations.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réparation trouvée</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatut !== 'all' || filterVehicule !== 'all'
                ? 'Aucune réparation ne correspond à vos critères de recherche.'
                : 'Aucune réparation enregistrée.'
              }
            </p>
            {!searchTerm && filterStatut === 'all' && filterVehicule === 'all' && (
              <Button onClick={openAddModal} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Créer la première réparation
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal pour ajouter/modifier */}
      <ReparationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleAddReparation}
        onUpdate={handleUpdateReparation}
        item={selectedReparation}
        mode={modalMode}
      />

      {/* Modal pour afficher les détails */}
      <ReparationDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        item={selectedReparation}
        onEdit={openEditModal}
        onDelete={handleDeleteReparation}
      />
    </div>
  );
};

export default Reparations;
