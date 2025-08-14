import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Plus, Search, Edit, Trash2, Eye, Fuel, Settings, User, Calendar, Gauge } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import VehicleForm, { VehicleData } from '@/components/VehicleForm';
import VehicleDetailModal from '@/components/VehicleDetailModal';
import { Vehicle, VEHICLE_CARBURANTS, VEHICLE_ETATS, VEHICLE_MARQUES } from '@/types/vehicles';
import vehiculesImage from '@/assets/images/vehicule.webp';


const Vehicules: React.FC = () => {
  const { isDark } = useTheme();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMarque, setFilterMarque] = useState('all');
  const [filterCarburant, setFilterCarburant] = useState('all');
  const [filterEtat, setFilterEtat] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Données initiales enrichies
  const initialVehicles: Vehicle[] = [
    {
      id: 1,
      marque: 'Peugeot',
      modele: '208',
      immatriculation: 'AB-123-CD',
      annee: '2020',
      couleur: 'Blanc',
      carburant: 'Essence',
      kilometrage: '45000',
      proprietaire: 'Kouassi Jean',
      numeroChassis: 'VF3XXXXXXXXXXXXXXX',
      dateAcquisition: '2020-03-15',
      etat: 'Excellent',
      notes: 'Véhicule en parfait état, entretien régulier',
      dateCreation: '2023-06-15T10:00:00Z',
      derniereRevision: '2024-01-10',
      prochaineRevision: '2024-07-10',
      assurance: '2024-12-31',
      vignette: '2024-12-31',
      controleTechnique: '2025-03-15'
    },
    {
      id: 2,
      marque: 'Renault',
      modele: 'Clio',
      immatriculation: 'EF-456-GH',
      annee: '2019',
      couleur: 'Gris',
      carburant: 'Diesel',
      kilometrage: '78000',
      proprietaire: 'Diabaté Fatou',
      numeroChassis: 'VF1XXXXXXXXXXXXXXX',
      dateAcquisition: '2019-08-20',
      etat: 'Très bon',
      notes: 'Bon véhicule, quelques rayures mineures',
      dateCreation: '2023-08-20T14:30:00Z',
      derniereRevision: '2024-01-05',
      prochaineRevision: '2024-07-05',
      assurance: '2024-11-30',
      vignette: '2024-11-30',
      controleTechnique: '2024-08-20'
    },
    {
      id: 3,
      marque: 'Toyota',
      modele: 'Yaris',
      immatriculation: 'IJ-789-KL',
      annee: '2021',
      couleur: 'Rouge',
      carburant: 'Hybride',
      kilometrage: '32000',
      proprietaire: 'Traoré Ali',
      numeroChassis: 'JTDXXXXXXXXXXXXXXX',
      dateAcquisition: '2021-05-10',
      etat: 'Excellent',
      notes: 'Véhicule hybride, très économique',
      dateCreation: '2024-01-18T09:15:00Z',
      derniereRevision: '2024-01-15',
      prochaineRevision: '2024-07-15',
      assurance: '2025-01-31',
      vignette: '2025-01-31',
      controleTechnique: '2026-05-10'
    },
    {
      id: 4,
      marque: 'Hyundai',
      modele: 'i10',
      immatriculation: 'MN-012-PQ',
      annee: '2018',
      couleur: 'Bleu',
      carburant: 'Essence',
      kilometrage: '95000',
      proprietaire: 'Yao Marie',
      numeroChassis: 'KMHXXXXXXXXXXXXXXX',
      dateAcquisition: '2018-11-12',
      etat: 'Bon',
      notes: 'Véhicule fiable, kilométrage élevé mais bien entretenu',
      dateCreation: '2023-09-10T11:45:00Z',
      derniereRevision: '2024-01-08',
      prochaineRevision: '2024-07-08',
      assurance: '2024-10-31',
      vignette: '2024-10-31',
      controleTechnique: '2024-11-12'
    },
    {
      id: 5,
      marque: 'Dacia',
      modele: 'Sandero',
      immatriculation: 'RS-345-TU',
      annee: '2017',
      couleur: 'Noir',
      carburant: 'Diesel',
      kilometrage: '120000',
      proprietaire: 'Koné Issouf',
      numeroChassis: 'VF1XXXXXXXXXXXXXXX',
      dateAcquisition: '2017-06-25',
      etat: 'Moyen',
      notes: 'Véhicule ancien, nécessite quelques réparations',
      dateCreation: '2022-03-15T08:20:00Z',
      derniereRevision: '2024-01-02',
      prochaineRevision: '2024-07-02',
      assurance: '2024-09-30',
      vignette: '2024-09-30',
      controleTechnique: '2024-06-25'
    },
    {
      id: 6,
      marque: 'Suzuki',
      modele: 'Swift',
      immatriculation: 'VW-678-XY',
      annee: '2022',
      couleur: 'Vert',
      carburant: 'Essence',
      kilometrage: '18000',
      proprietaire: 'Ouattara Aminata',
      numeroChassis: 'JS2XXXXXXXXXXXXXXX',
      dateAcquisition: '2022-09-18',
      etat: 'Excellent',
      notes: 'Véhicule récent, très peu utilisé',
      dateCreation: '2024-01-20T16:30:00Z',
      derniereRevision: '2024-01-18',
      prochaineRevision: '2024-07-18',
      assurance: '2025-02-28',
      vignette: '2025-02-28',
      controleTechnique: '2027-09-18'
    }
  ];

  useEffect(() => {
    // Charger les données depuis localStorage ou utiliser les données initiales
    const savedVehicles = localStorage.getItem('vehicles');
    if (savedVehicles) {
      setVehicles(JSON.parse(savedVehicles));
    } else {
      setVehicles(initialVehicles);
      localStorage.setItem('vehicles', JSON.stringify(initialVehicles));
    }
  }, []);

  // Sauvegarder les données dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  const handleAddVehicle = async (vehicleData: VehicleData) => {
    setIsLoading(true);
    try {
      const newVehicle: Vehicle = {
        id: Date.now(),
        ...vehicleData,
        dateCreation: new Date().toISOString()
      };

      setVehicles(prev => [...prev, newVehicle]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du véhicule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateVehicle = async (vehicleData: VehicleData) => {
    if (!selectedVehicle) return;

    setIsLoading(true);
    try {
      const updatedVehicle: Vehicle = {
        ...selectedVehicle,
        ...vehicleData,
        dateModification: new Date().toISOString()
      };

      setVehicles(prev => prev.map(vehicle =>
        vehicle.id === selectedVehicle.id ? updatedVehicle : vehicle
      ));
      setIsModalOpen(false);
      setSelectedVehicle(null);
    } catch (error) {
      console.error('Erreur lors de la modification du véhicule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVehicle = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
    }
  };

  const openAddModal = () => {
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const openDetailModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedVehicle(null);
  };

  // Filtrage des véhicules
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.marque.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.modele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.immatriculation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.proprietaire.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMarque = filterMarque === 'all' || vehicle.marque === filterMarque;
    const matchesCarburant = filterCarburant === 'all' || vehicle.carburant === filterCarburant;
    const matchesEtat = filterEtat === 'all' || vehicle.etat === filterEtat;

    return matchesSearch && matchesMarque && matchesCarburant && matchesEtat;
  });

  // Calculs des statistiques
  const totalVehicles = vehicles.length;
  const vehiclesEssence = vehicles.filter(v => v.carburant === 'Essence').length;
  const vehiclesDiesel = vehicles.filter(v => v.carburant === 'Diesel').length;
  const vehiclesHybrides = vehicles.filter(v => v.carburant === 'Hybride' || v.carburant === 'Électrique').length;

  const getCarburantColor = (carburant: string) => {
    const carburantType = VEHICLE_CARBURANTS.find(c => c.value === carburant);
    return carburantType ? carburantType.color : 'text-gray-600 bg-gray-100';
  };

  const getEtatColor = (etat: string) => {
    const etatType = VEHICLE_ETATS.find(e => e.value === etat);
    return etatType ? etatType.color : 'text-gray-600 bg-gray-100';
  };

  const getEtatIcon = (etat: string) => {
    switch (etat) {
      case 'Excellent':
        return <Car className="w-4 h-4 text-green-500" />;
      case 'Très bon':
        return <Car className="w-4 h-4 text-blue-500" />;
      case 'Bon':
        return <Car className="w-4 h-4 text-yellow-500" />;
      case 'Moyen':
        return <Car className="w-4 h-4 text-orange-500" />;
      case 'Mauvais':
        return <Car className="w-4 h-4 text-red-500" />;
      case 'Hors service':
        return <Car className="w-4 h-4 text-gray-500" />;
      default:
        return <Car className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatKilometrage = (kilometrage: string) => {
    const km = parseInt(kilometrage);
    if (km >= 1000000) {
      return `${(km / 1000000).toFixed(1)}M km`;
    } else if (km >= 1000) {
      return `${(km / 1000).toFixed(0)}k km`;
    }
    return `${km} km`;
  };

  return (
    <div>
      <div className="py-4 w-full">
        <picture>
          <source srcSet={vehiculesImage} type="image/webp" />
          <img
            className="w-full h-40 object-cover rounded-xl mb-6 shadow-soft animate-fade-in"
            src={vehiculesImage}
            alt="Parc automobile disponible"
            loading="lazy"
            decoding="async"
          />
        </picture>

        {/* En-tête avec bouton d'ajout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Véhicules
          </h1>
          <Button
            onClick={openAddModal}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un Véhicule
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className={`shadow-soft animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total véhicules</p>
                  <p className="text-2xl font-bold text-blue-500">{totalVehicles}</p>
                </div>
                <Car className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-soft animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Essence</p>
                  <p className="text-2xl font-bold text-red-500">{vehiclesEssence}</p>
                </div>
                <Fuel className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-soft animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Diesel</p>
                  <p className="text-2xl font-bold text-blue-500">{vehiclesDiesel}</p>
                </div>
                <Fuel className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`shadow-soft animate-fade-in ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Hybrides/Électriques</p>
                  <p className="text-2xl font-bold text-green-500">{vehiclesHybrides}</p>
                </div>
                <Settings className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un véhicule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterMarque} onValueChange={setFilterMarque}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes les marques" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les marques</SelectItem>
              {VEHICLE_MARQUES.map(marque => (
                <SelectItem key={marque} value={marque}>{marque}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCarburant} onValueChange={setFilterCarburant}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les carburants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les carburants</SelectItem>
              {VEHICLE_CARBURANTS.map(carburant => (
                <SelectItem key={carburant.value} value={carburant.value}>{carburant.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterEtat} onValueChange={setFilterEtat}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les états" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les états</SelectItem>
              {VEHICLE_ETATS.map(etat => (
                <SelectItem key={etat.value} value={etat.value}>{etat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Liste des véhicules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className={`shadow-soft animate-fade-in cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}
              onClick={() => openDetailModal(vehicle)}
            >
              <CardHeader className="flex flex-row items-center gap-3">
                {getEtatIcon(vehicle.etat)}
                <CardTitle className={`text-lg ${isDark ? 'text-white' : ''}`}>
                  {vehicle.marque} {vehicle.modele}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Immatriculation :
                  </span>
                  <span className="font-semibold">{vehicle.immatriculation}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {vehicle.proprietaire}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {vehicle.annee}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Gauge className="w-4 h-4 text-gray-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {formatKilometrage(vehicle.kilometrage)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Badge className={getCarburantColor(vehicle.carburant)}>
                      {vehicle.carburant}
                    </Badge>
                    <Badge className={getEtatColor(vehicle.etat)}>
                      {vehicle.etat}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetailModal(vehicle);
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
                      openEditModal(vehicle);
                    }}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteVehicle(vehicle.id);
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
        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun véhicule trouvé</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterMarque !== 'all' || filterCarburant !== 'all' || filterEtat !== 'all'
                ? 'Aucun véhicule ne correspond à vos critères de recherche.'
                : 'Aucun véhicule enregistré.'
              }
            </p>
            {!searchTerm && filterMarque === 'all' && filterCarburant === 'all' && filterEtat === 'all' && (
              <Button onClick={openAddModal} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Créer le premier véhicule
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal pour ajouter/modifier */}
      <VehicleForm
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={selectedVehicle ? handleUpdateVehicle : handleAddVehicle}
      />

      {/* Modal pour afficher les détails */}
      <VehicleDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        vehicle={selectedVehicle}
        onEdit={openEditModal}
        onDelete={handleDeleteVehicle}
      />
    </div>
  );
};

export default Vehicules;
