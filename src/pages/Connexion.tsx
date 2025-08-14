import React from 'react';
import { Button } from '@/components/ui/button';

const Connexion: React.FC = () => (
  <div className="py-8 w-full max-w-md mx-auto">
    <div className="bg-card rounded-xl p-6 shadow-soft animate-fade-in">
      <h1 className="text-2xl font-bold mb-4">Connexion</h1>
      <form className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input type="email" className="w-full input input-bordered" placeholder="Email" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Mot de passe</label>
          <input type="password" className="w-full input input-bordered" placeholder="Mot de passe" />
        </div>
        <Button type="submit" className="w-full">Se connecter</Button>
      </form>
    </div>
  </div>
);

export default Connexion;