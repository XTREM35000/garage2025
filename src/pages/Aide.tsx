import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Aide: React.FC = () => (
  <div className="py-4 w-full max-w-2xl mx-auto">
    <Card className="shadow-soft animate-fade-in">
      <CardHeader>
        <CardTitle>FAQ & Aide</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-4 space-y-2">
          <li>Comment ajouter un client ? Utilisez le bouton "Ajouter un client" dans la section Clients.</li>
          <li>Comment voir l'historique ? Rendez-vous dans Clients &gt; Historique.</li>
          <li>Comment contacter le support ? Utilisez la page Contact dans le footer.</li>
        </ul>
      </CardContent>
    </Card>
  </div>
);

export default Aide;