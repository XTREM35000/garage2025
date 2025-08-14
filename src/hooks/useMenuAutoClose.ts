import { useEffect, useCallback } from 'react';

interface UseMenuAutoCloseProps {
  isOpen: boolean;
  onClose: () => void;
  timeout?: number; // en millisecondes, défaut 5000ms
}

export const useMenuAutoClose = ({ 
  isOpen, 
  onClose, 
  timeout = 5000 
}: UseMenuAutoCloseProps) => {
  
  // Timer de fermeture automatique
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setTimeout(() => {
      onClose();
    }, timeout);
    
    return () => clearTimeout(timer);
  }, [isOpen, onClose, timeout]);

  // Fermeture au click extérieur
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!isOpen) return;
    
    const target = event.target as Element;
    const dropdownElement = target.closest('[data-dropdown]');
    
    if (!dropdownElement) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  // Fermeture à la sélection d'un item
  const handleItemSelect = useCallback(() => {
    onClose();
  }, [onClose]);

  return { handleItemSelect };
};