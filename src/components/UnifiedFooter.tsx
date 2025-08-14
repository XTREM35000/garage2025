import React from 'react';
import { Car, Phone, MapPin, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';

const UnifiedFooter: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <footer className={`py-12 transition-colors duration-500 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-900 text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDark ? 'bg-orange-500' : 'bg-orange-500'
              }`}>
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Garage Abidjan</span>
            </div>
            <p className="text-gray-400 mb-4">
              Excellence automobile depuis 2010. Votre partenaire de confiance pour tous vos besoins automobiles.
            </p>
            <div className="flex space-x-4">
              <Badge variant="secondary" className="bg-orange-500 hover:bg-orange-600">
                🚗 GaragePro © 2024
              </Badge>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>07 58 96 61 56</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Abidjan, Côte d'Ivoire</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>Lun-Sam: 8h-18h</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Développeur</h3>
            <div className="space-y-2 text-gray-400">
              <div>Thierry Gogo</div>
              <div>FullStack Freelance</div>
              <div className="animate-pulse">🚗 GaragePro © 2024</div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Garage Abidjan. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default UnifiedFooter;
