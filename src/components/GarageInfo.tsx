import React from 'react';
// import { getGarageInfoForDocuments } from '@/lib/config';

interface GarageInfoProps {
  showLogo?: boolean;
  showAddress?: boolean;
  showContact?: boolean;
  showLegal?: boolean;
  className?: string;
}

const GarageInfo: React.FC<GarageInfoProps> = ({
  showLogo = true,
  showAddress = true,
  showContact = true,
  showLegal = false,
  className = ''
}) => {
  const garageInfo = {
    name: 'Garage Central Abidjan',
    address: 'Plateau, Abidjan',
    phone: '+225 07 58 96 61 56',
    email: 'contact@garage-central.ci',
    logo: null,
    rccm: null,
    taxRegime: null,
    taxId: null
  };

  return (
    <div className={`garage-info ${className}`}>
      {showLogo && garageInfo.logo && (
        <div className="garage-logo mb-2">
          <img
            src={garageInfo.logo}
            alt={`Logo ${garageInfo.name}`}
            className="h-12 w-auto object-contain"
          />
        </div>
      )}

      <div className="garage-details">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {garageInfo.name}
        </h3>

        {showAddress && garageInfo.address && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {garageInfo.address}
          </p>
        )}

        {showContact && (
          <div className="contact-info mt-2 space-y-1">
            {garageInfo.phone && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Tél: {garageInfo.phone}
              </p>
            )}
            {garageInfo.email && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Email: {garageInfo.email}
              </p>
            )}
          </div>
        )}

        {showLegal && (
          <div className="legal-info mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
            {garageInfo.rccm && (
              <p>RCCM: {garageInfo.rccm}</p>
            )}
            {garageInfo.taxRegime && (
              <p>Régime Fiscal: {garageInfo.taxRegime === 'reel' ? 'Réel' : 'Simplifié'}</p>
            )}
            {garageInfo.taxId && (
              <p>N° Fiscal: {garageInfo.taxId}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GarageInfo;
