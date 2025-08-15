import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Sparkles, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import '../styles/whatsapp-theme.css';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  popular?: boolean;
  icon: React.ComponentType<any>;
  color: string;
}

interface PricingModalProps {
  isOpen: boolean;
  onSelectPlan: (planId: string) => Promise<void> | void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onSelectPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0',
      period: '1 semaine',
      description: 'Découvrez notre solution pendant une semaine',
      icon: Star,
      color: 'from-green-400 to-green-600',
      features: [
        '1 garage seulement',
        'Gestion de base des véhicules',
        'Suivi des réparations simples',
        'Jusqu\'à 3 utilisateurs',
        'Support par email'
      ],
      limitations: [
        'Durée limitée à 1 semaine',
        'Redirection obligatoire vers plans payants après la période'
      ]
    },
    {
      id: 'monthly',
      name: 'Mensuel',
      price: '25 000',
      period: 'par mois',
      description: 'Solution flexible pour votre organisation',
      icon: Zap,
      color: 'from-[#128C7E] to-[#075E54]',
      popular: true,
      features: [
        '1 organisation',
        '3 instances maximum (garage/lavage-auto/buvette/superette)',
        'Utilisateurs illimités',
        'Toutes les fonctionnalités',
        'Support prioritaire',
        'Sauvegarde automatique',
        'Rapports détaillés',
        'Notifications SMS'
      ],
      limitations: [
        'Limité à 1 organisation',
        'Maximum 3 instances'
      ]
    },
    {
      id: 'annual',
      name: 'Annuel',
      price: '250 000',
      period: 'par an',
      description: 'Solution complète pour organisations multiples',
      icon: Crown,
      color: 'from-purple-500 to-purple-700',
      features: [
        'Organisations multiples',
        'Instances illimitées',
        'Utilisateurs illimités',
        'Toutes les fonctionnalités',
        'Support VIP 24/7',
        'Sauvegarde automatique',
        'Rapports avancés',
        'Notifications SMS + Email',
        'API personnalisée',
        'Formation sur mesure',
        'Déploiement dédié'
      ],
      limitations: [
        'Engagement annuel',
        'Paiement en une fois'
      ]
    }
  ];

  const handlePlanSelection = async (planId: string) => {
    setSelectedPlan(planId);
    setIsLoading(true);
    
    try {
      await onSelectPlan(planId);
    } catch (error) {
      console.error('Erreur lors de la sélection du plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <div className="modal-whatsapp-card">
          {/* Header avec gradient WhatsApp */}
          <div className="modal-whatsapp-header">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 
                             rounded-full opacity-90 blur-xl animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-orange-300 to-orange-500 
                             rounded-full opacity-75 blur-lg animate-pulse delay-150" />
                  <div className="relative bg-black/30 p-3 rounded-full backdrop-blur-sm">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  Choisissez Votre Plan
                </DialogTitle>
                <DialogDescription className="text-white/90 mt-2">
                  Sélectionnez le plan qui correspond le mieux à vos besoins
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Body avec les plans */}
          <div className="modal-whatsapp-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="relative">
                  {/* Badge "Populaire" */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-[#25D366] to-[#20C997] text-white px-4 py-1 rounded-full shadow-lg">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Populaire
                      </Badge>
                    </div>
                  )}

                  {/* Card du plan */}
                  <Card className={`h-full transition-all duration-300 hover:scale-105 ${
                    plan.popular ? 'ring-2 ring-[#128C7E] shadow-xl' : 'hover:shadow-lg'
                  }`}>
                    <CardHeader className={`bg-gradient-to-br ${plan.color} text-white text-center pb-4`}>
                      <div className="flex justify-center mb-2">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <plan.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                      <p className="text-white/90 text-sm">{plan.description}</p>
                    </CardHeader>

                    <CardContent className="p-6 space-y-4">
                      {/* Prix */}
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {plan.price === '0' ? 'Gratuit' : `${plan.price} FCFA`}
                        </div>
                        <div className="text-gray-600 text-sm">{plan.period}</div>
                      </div>

                      {/* Fonctionnalités */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-[#128C7E] text-sm uppercase tracking-wide">
                          Fonctionnalités incluses
                        </h4>
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Limitations */}
                      {plan.limitations.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-orange-600 text-sm uppercase tracking-wide">
                            Limitations
                          </h4>
                          <ul className="space-y-2">
                            {plan.limitations.map((limitation, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <XCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{limitation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Bouton de sélection */}
                      <Button
                        onClick={() => handlePlanSelection(plan.id)}
                        disabled={isLoading}
                        className={`w-full ${
                          plan.popular 
                            ? 'btn-whatsapp-primary' 
                            : plan.id === 'free'
                            ? 'btn-whatsapp-success'
                            : 'btn-whatsapp-secondary'
                        }`}
                      >
                        {isLoading && selectedPlan === plan.id ? (
                          <span className="flex items-center gap-2">
                            <div className="loading-whatsapp-spinner"></div>
                            Sélection en cours...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            {plan.id === 'free' ? (
                              <>
                                <Star className="w-4 h-4" />
                                Commencer gratuitement
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Choisir ce plan
                              </>
                            )}
                          </span>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-[#128C7E]/20">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-[#128C7E] mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium text-[#128C7E] mb-1">Informations importantes</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Tous les plans incluent une période d'essai de 7 jours</li>
                    <li>• Possibilité de changer de plan à tout moment</li>
                    <li>• Support technique inclus dans tous les plans</li>
                    <li>• Données sauvegardées automatiquement</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;
