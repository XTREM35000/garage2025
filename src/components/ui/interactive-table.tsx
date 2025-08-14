import React, { useState } from 'react';
import {
  Edit,
  Trash2,
  Eye,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { LoadingSpinner } from './loading-spinner';
import { cn } from '@/lib/utils';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface InteractiveTableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onView?: (row: any) => void;
  onAdd?: () => void;
  searchable?: boolean;
  filterable?: boolean;
  className?: string;
}

export const InteractiveTable: React.FC<InteractiveTableProps> = ({
  columns,
  data,
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  onAdd,
  searchable = true,
  filterable = true,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Filtrage des données
  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Tri des données
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Gestion du tri
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Rendu d'une cellule
  const renderCell = (column: Column, row: any) => {
    const value = row[column.key];

    if (column.render) {
      return column.render(value, row);
    }

    return <span className="text-gray-900">{value}</span>;
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Chargement des données..." />;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Barre d'outils */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {filterable && (
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          )}
        </div>

        {onAdd && (
          <Button onClick={onAdd} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        )}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                      column.sortable && 'cursor-pointer hover:bg-gray-100 transition-colors'
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && sortColumn === column.key && (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      )}
                    </div>
                  </th>
                ))}
                {(onEdit || onDelete || onView) && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((row, index) => (
                <tr
                  key={index}
                  className={cn(
                    'hover:bg-gray-50 transition-all duration-200 cursor-pointer',
                    hoveredRow === index && 'bg-green-50 shadow-sm'
                  )}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {renderCell(column, row)}
                    </td>
                  ))}

                  {(onEdit || onDelete || onView) && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onView(row)}
                            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 transition-all duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}

                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(row)}
                            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600 transition-all duration-200"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}

                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(row)}
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm ? 'Aucun résultat trouvé' : 'Aucune donnée disponible'}
            </div>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>
          {sortedData.length} élément{sortedData.length !== 1 ? 's' : ''} affiché{sortedData.length !== 1 ? 's' : ''}
        </span>
        {searchTerm && (
          <span>
            Recherche : "{searchTerm}"
          </span>
        )}
      </div>
    </div>
  );
};

// Composants utilitaires pour les colonnes
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'actif':
      case 'en cours':
        return 'bg-green-100 text-green-800';
      case 'inactif':
      case 'terminé':
        return 'bg-gray-100 text-gray-800';
      case 'en attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'annulé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {status}
    </Badge>
  );
};

export const AvatarCell: React.FC<{ src?: string; alt: string; fallback: string }> = ({
  src,
  alt,
  fallback
}) => {
  return (
    <div className="flex items-center">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
        {src ? (
          <img src={src} alt={alt} className="w-full h-full rounded-full object-cover" />
        ) : (
          fallback.charAt(0).toUpperCase()
        )}
      </div>
      <span className="ml-3 text-gray-900">{fallback}</span>
    </div>
  );
};
