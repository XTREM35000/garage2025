import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OrganisationOnboardingProps {
  onComplete: (orgId: string) => void;
  plan: string;
}

const OrganisationOnboarding: React.FC<OrganisationOnboardingProps> = ({ onComplete, plan }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation d'une création d'organisation
    const mockOrgId = 'org_' + Math.random().toString(36).substr(2, 9);
    onComplete(mockOrgId);
  };

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center p-4">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Configuration de l'organisation</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="orgName">Nom de l'organisation</Label>
            <Input id="orgName" placeholder="Nom de votre organisation" required />
          </div>
          <div className="text-muted-foreground text-sm">
            Plan sélectionné : {plan}
          </div>
          <Button type="submit" className="w-full">
            Créer l'organisation
          </Button>
        </form>
      </div>
    </div>
  );
};

export default OrganisationOnboarding;