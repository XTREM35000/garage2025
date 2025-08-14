import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, TrendingUp, DollarSign, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import StockModal from '@/components/StockModal';
import StockDetailModal from '@/components/StockDetailModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StockImages from '@/assets/images/stock.webp';


interface StockItem {
  id: number;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  seuilAlerte: number;
  categorie: string;
  fournisseur: string;
  description?: string;
  codeProduit?: string;
  dateAjout?: string;
  dateModification?: string;
}

const Stock: React.FC = () => {
  const { isDark } = useTheme();
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Données initiales
  const initialStock: StockItem[] = [
    {
      id: 1,
      nom: 'Filtre à huile',
      quantite: 12,
      prixUnitaire: 2500,
      seuilAlerte: 5,
      categorie: 'Filtres',
      fournisseur: 'Total Côte d\'Ivoire',
      description: 'Filtre à huile haute performance pour moteurs essence et diesel',
      codeProduit: 'FIL-001',
      dateAjout: new Date().toISOString()
    },
    {
      id: 2,
      nom: 'Plaquettes de frein avant',
      quantite: 8,
      prixUnitaire: 8500,
      seuilAlerte: 3,
      categorie: 'Freinage',
      fournisseur: 'Brembo Distribution',
      description: 'Plaquettes de frein avant pour véhicules légers',
      codeProduit: 'FRE-001',
      dateAjout: new Date().toISOString()
    },
    {
      id: 3,
      nom: 'Batterie 60Ah',
      quantite: 5,
      prixUnitaire: 45000,
      seuilAlerte: 2,
      categorie: 'Électricité',
      fournisseur: 'Exide Technologies',
      description: 'Batterie 12V 60Ah pour véhicules particuliers',
      codeProduit: 'BAT-001',
      dateAjout: new Date().toISOString()
    },
    {
      id: 4,
      nom: 'Huile moteur 5W30',
      quantite: 20,
      prixUnitaire: 3500,
      seuilAlerte: 8,
      categorie: 'Lubrifiants',
      fournisseur: 'Total Côte d\'Ivoire',
      description: 'Huile moteur synthétique 5W30 haute performance',
      codeProduit: 'HUI-001',
      dateAjout: new Date().toISOString()
    },
    {
      id: 5,
      nom: 'Bougies d\'allumage',
      quantite: 15,
      prixUnitaire: 1200,
      seuilAlerte: 6,
      categorie: 'Moteur',
      fournisseur: 'NGK Spark Plugs',
      description: 'Bougies d\'allumage iridium longue durée',
      codeProduit: 'BOU-001',
      dateAjout: new Date().toISOString()
    },
    {
      id: 6,
      nom: 'Disques de frein',
      quantite: 6,
      prixUnitaire: 15000,
      seuilAlerte: 4,
      categorie: 'Freinage',
      fournisseur: 'Brembo Distribution',
      description: 'Disques de frein ventilés haute performance',
      codeProduit: 'DIS-001',
      dateAjout: new Date().toISOString()
    },
    {
      id: 7,
      nom: 'Filtre à air',
      quantite: 10,
      prixUnitaire: 1800,
      seuilAlerte: 4,
      categorie: 'Filtres',
      fournisseur: 'Mann Filter',
      description: 'Filtre à air moteur haute filtration',
      codeProduit: 'FIL-002',
      dateAjout: new Date().toISOString()
    },
    {
      id: 8,
      nom: 'Liquide de refroidissement',
      quantite: 25,
      prixUnitaire: 1200,
      seuilAlerte: 10,
      categorie: 'Refroidissement',
      fournisseur: 'Total Côte d\'Ivoire',
      description: 'Liquide de refroidissement longue durée',
      codeProduit: 'LIQ-001',
      dateAjout: new Date().toISOString()
    },
    {
      id: 9,
      nom: 'Courroie de distribution',
      quantite: 3,
      prixUnitaire: 25000,
      seuilAlerte: 2,
      categorie: 'Moteur',
      fournisseur: 'Gates Corporation',
      description: 'Courroie de distribution haute résistance',
      codeProduit: 'COU-001',
      dateAjout: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // Charger les données depuis localStorage ou utiliser les données initiales
    const savedStock = localStorage.getItem('stockItems');
    if (savedStock) {
      setStockItems(JSON.parse(savedStock));
    } else {
      setStockItems(initialStock);
      localStorage.setItem('stockItems', JSON.stringify(initialStock));
    }
  }, []);

  // Sauvegarder les données dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('stockItems', JSON.stringify(stockItems));
  }, [stockItems]);

  const handleAddItem = (newItem: Omit<StockItem, 'id' | 'dateAjout' | 'dateModification'>) => {
    const item: StockItem = {
      ...newItem,
      id: Date.now(),
      dateAjout: new Date().toISOString()
    };
    setStockItems(prev => [...prev, item]);
  };

  const handleUpdateItem = (updatedItem: StockItem) => {
    setStockItems(prev => prev.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  const handleDeleteItem = (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      setStockItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: StockItem) => {
    setModalMode('edit');
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const openDetailModal = (item: StockItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedItem(null);
  };

  // Filtrage des éléments
  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codeProduit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fournisseur.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || item.categorie === filterCategory;

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'alert' && item.quantite <= item.seuilAlerte) ||
      (filterStatus === 'ok' && item.quantite > item.seuilAlerte);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculs des statistiques
  const totalItems = stockItems.length;
  const totalValue = stockItems.reduce((total, item) => total + (item.quantite * item.prixUnitaire), 0);
  const alertItems = stockItems.filter(item => item.quantite <= item.seuilAlerte).length;
  const categories = [...new Set(stockItems.map(item => item.categorie))];

  const getStatusColor = (item: StockItem) => {
    if (item.quantite === 0) return 'bg-red-100 text-red-800 border-red-200';
    if (item.quantite <= item.seuilAlerte) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusText = (item: StockItem) => {
    if (item.quantite === 0) return 'Rupture';
    if (item.quantite <= item.seuilAlerte) return 'Stock faible';
    return 'Stock OK';
  };

  return (
    <div>
      <div className="py-4 w-full">
        {/* Image de fond */}
        <picture>
          <source srcSet={StockImages} type="image/webp" />
          <img
            className="w-full h-40 object-cover rounded-xl mb-6 shadow-soft animate-fade-in"
            src={StockImages}
            alt="Parc automobile disponible"
            loading="lazy"
            decoding="async"
          />
        </picture>

        {/* En-tête avec bouton d'ajout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Gestion du Stock
          </h1>
          <Button
            onClick={openAddModal}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un élément</span>
          </Button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-soft animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valeur Stock</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalValue.toLocaleString()} FCFA
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {alertItems}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+12%</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="ok">Stock OK</SelectItem>
              <SelectItem value="alert">Stock faible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Liste du stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`shadow-soft animate-fade-in cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${item.quantite <= item.seuilAlerte ? 'border-orange-200 bg-orange-50/50' : ''
                }`}
              onClick={() => openDetailModal(item)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg truncate">{item.nom}</CardTitle>
                  {item.codeProduit && (
                    <p className="text-xs text-gray-500 mt-1">{item.codeProduit}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <Badge className={getStatusColor(item)}>
                    {getStatusText(item)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quantité:</span>
                    <span className={`font-semibold ${item.quantite <= item.seuilAlerte ? 'text-orange-600' : ''}`}>
                      {item.quantite} unités
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Prix unitaire:</span>
                    <span className="font-semibold">{item.prixUnitaire.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valeur totale:</span>
                    <span className="font-semibold">{(item.quantite * item.prixUnitaire).toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Catégorie:</span>
                    <span className="text-sm font-medium">{item.categorie}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fournisseur:</span>
                    <span className="text-sm font-medium truncate max-w-[120px]">{item.fournisseur}</span>
                  </div>

                  {item.quantite <= item.seuilAlerte && (
                    <div className="mt-3 p-2 bg-orange-100 rounded-md">
                      <p className="text-xs text-orange-700 font-medium">
                        ⚠️ Stock faible - Seuil d'alerte: {item.seuilAlerte}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(item);
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
                        handleDeleteItem(item.id);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Message si aucun résultat */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun élément trouvé</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Aucun élément ne correspond à vos critères de recherche.'
                : 'Aucun élément de stock enregistré.'
              }
            </p>
            {!searchTerm && filterCategory === 'all' && filterStatus === 'all' && (
              <Button onClick={openAddModal} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter le premier élément
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal pour ajouter/modifier */}
      <StockModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleAddItem}
        onUpdate={handleUpdateItem}
        item={selectedItem}
        mode={modalMode}
      />

      {/* Modal pour afficher les détails */}
      <StockDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        item={selectedItem}
        onEdit={openEditModal}
        onDelete={handleDeleteItem}
      />
    </div>
  );
};

export default Stock;
