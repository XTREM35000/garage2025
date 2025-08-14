import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SplashScreen from '@/components/SplashScreen';
import PricingModal from '@/components/PricingModal';
import SuperAdminSetupModal from '@/components/SuperAdminSetupModal';
import { OrganisationOnboarding } from '@/components/OrganisationOnboarding';
import BrandSetupWizard from '@/components/BrandSetupWizard';

interface SimpleSetupProps {
  onComplete: () => void;
  children: React.ReactNode;
}

export type SetupStep = 'splash' | 'pricing' | 'super-admin' | 'organisation' | 'brand' | 'complete' | 'redirect-auth';

const SimpleSetup: React.FC<SimpleSetupProps> = ({ onComplete, children }) => {
  const [currentStep, setCurrentStep] = useState<SetupStep>('splash');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [superAdminData, setSuperAdminData] = useState<any>(null);
  const [organisationId, setOrganisationId] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // Démarrer directement avec splash puis pricing
    console.log('🚀 Démarrage du workflow de setup simplifié');
  }, []);

  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);
    setCurrentStep('super-admin');
  };

  const handleSuperAdminCreated = (adminData: any) => {
    setSuperAdminData(adminData);
    setCurrentStep('organisation');
  };

  const handleOrganisationCreated = (orgId: string) => {
    setOrganisationId(orgId);
    setCurrentStep('brand');
  };

  const handleBrandSetupComplete = () => {
    setCurrentStep('complete');
    onComplete();
  };

  // Render selon l'étape actuelle
  switch (currentStep) {
    case 'splash':
      return <SplashScreen onComplete={() => setCurrentStep('pricing')} />;

    case 'pricing':
      return (
        <PricingModal 
          isOpen={true} 
          onSelectPlan={handlePlanSelection}
        />
      );

    case 'super-admin':
      return (
        <SuperAdminSetupModal
          isOpen={true}
          onComplete={handleSuperAdminCreated}
        />
      );

    case 'organisation':
      return (
        <OrganisationOnboarding
          isOpen={true}
          onComplete={handleOrganisationCreated}
          plan={selectedPlan}
        />
      );

    case 'brand':
      return (
        <BrandSetupWizard
          isOpen={true}
          onComplete={handleBrandSetupComplete}
        />
      );

    case 'complete':
    default:
      return <>{children}</>;
  }
};

export default SimpleSetup;