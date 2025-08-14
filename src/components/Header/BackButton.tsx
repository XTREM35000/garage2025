import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  fallback?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ fallback = '/', className }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // If there is history and we aren't at the first entry, go back
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    // If the current path equals the fallback, do nothing to avoid loop
    if (location.pathname === fallback) {
      return;
    }
    // Otherwise navigate to fallback
    navigate(fallback, { replace: true });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={className}
    >
      <ChevronLeft className="w-4 h-4 mr-1" />
      Retour
    </Button>
  );
};

export default BackButton;