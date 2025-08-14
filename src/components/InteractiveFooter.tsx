import React from 'react';
import { Heart, MapPin, Phone, Mail, Clock, Shield } from 'lucide-react';

const InteractiveFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const garageData = JSON.parse(localStorage.getItem('garageData') || '{}');

  return (
    <footer className="bg-gradient-to-r from-card/90 via-card to-card/90 backdrop-blur-sm border-t border-border/50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Informations du garage */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {garageData.name || 'Garage Abidjan'}
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              {garageData.address && (
                <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <MapPin className="w-4 h-4 text-primary" />
                  {garageData.address}
                </div>
              )}
              {garageData.phone && (
                <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Phone className="w-4 h-4 text-primary" />
                  {garageData.phone}
                </div>
              )}
              {garageData.email && (
                <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Mail className="w-4 h-4 text-primary" />
                  {garageData.email}
                </div>
              )}
            </div>
          </div>

          {/* Horaires */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Horaires d'ouverture
            </h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Lundi - Vendredi</span>
                <span className="font-medium">8h00 - 18h00</span>
              </div>
              <div className="flex justify-between">
                <span>Samedi</span>
                <span className="font-medium">8h00 - 16h00</span>
              </div>
              <div className="flex justify-between">
                <span>Dimanche</span>
                <span className="text-destructive font-medium">Fermé</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Services</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="hover:text-foreground transition-colors cursor-pointer">Mécanique générale</div>
              <div className="hover:text-foreground transition-colors cursor-pointer">Carrosserie</div>
              <div className="hover:text-foreground transition-colors cursor-pointer">Électricité auto</div>
              <div className="hover:text-foreground transition-colors cursor-pointer">Climatisation</div>
              <div className="hover:text-foreground transition-colors cursor-pointer">Diagnostic</div>
            </div>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-border/30 mt-8 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>&copy; {currentYear} {garageData.name || 'Garage Abidjan'}. Tous droits réservés.</span>
            </div>
            <div className="flex items-center gap-1 mt-2 md:mt-0">
              <span>Fait avec</span>
              <Heart className="w-4 h-4 text-destructive animate-pulse" />
              <span>à Abidjan, Côte d'Ivoire</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default InteractiveFooter;