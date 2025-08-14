import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Camera, Palette, User, Building, Mail, Phone, MapPin, Check } from 'lucide-react';

interface GarageSetupData {
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  themeColor: string;
  logoFile: File | null;
}

interface GarageSetupModalProps {
  isOpen: boolean;
  onComplete: (data: GarageSetupData) => void;
}

const GarageSetupModal = ({ isOpen, onComplete }: GarageSetupModalProps) => {
  const [formData, setFormData] = useState<GarageSetupData>({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    themeColor: '#25D366',
    logoFile: null,
  });

  const [step, setStep] = useState(1);
  const [dragActive, setDragActive] = useState(false);

  const colorOptions = [
    { name: 'WhatsApp Vert', value: '#25D366' },
    { name: 'Bleu Océan', value: '#0EA5E9' },
    { name: 'Violet Moderne', value: '#8B5CF6' },
    { name: 'Orange Dynamique', value: '#F97316' },
    { name: 'Rouge Passion', value: '#EF4444' },
    { name: 'Indigo Professionnel', value: '#6366F1' },
  ];

  const handleFileUpload = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, logoFile: file }));
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleSubmit = () => {
    if (formData.name && formData.ownerName) {
      onComplete(formData);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Building className="w-6 h-6 text-primary" />
            Configuration de votre garage
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex justify-center space-x-2 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-muted'
                  }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations de base
              </h3>

              {/* Nom du garage */}
              <div>
                <Label htmlFor="garageName">Nom du garage *</Label>
                <Input
                  id="garageName"
                  placeholder="Ex: Garage Central Auto"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>

              {/* Logo upload */}
              <div>
                <Label>Logo du garage (optionnel)</Label>
                
                {/* Preview de l'image */}
                {formData.logoFile && (
                  <div className="mt-2 flex justify-center">
                    <div className="relative w-[150px] h-[150px] rounded-xl overflow-hidden shadow-lg border-2 border-primary/20">
                      <img
                        src={URL.createObjectURL(formData.logoFile)}
                        alt="Aperçu du logo"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, logoFile: null }))}
                          className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div
                  className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${dragActive ? 'border-primary bg-primary/10' : 'border-muted'
                    }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {formData.logoFile ? (
                    <div className="space-y-2">
                      <Check className="w-8 h-8 text-green-500 mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        {formData.logoFile.name}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('logoInput')?.click()}
                      >
                        Changer le fichier
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Glissez votre logo ici ou
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('logoInput')?.click()}
                      >
                        Choisir un fichier
                      </Button>
                    </div>
                  )}
                  <input
                    id="logoInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </div>
              </div>

              {/* Nom du propriétaire */}
              <div>
                <Label htmlFor="ownerName">Nom du propriétaire *</Label>
                <Input
                  id="ownerName"
                  placeholder="Ex: Jean Kouassi"
                  value={formData.ownerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={nextStep} disabled={!formData.name || !formData.ownerName}>
                  Suivant
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Logo et Contact
              </h3>

              {/* Logo upload */}
              <div>
                <Label>Logo du garage (optionnel)</Label>
                <div
                  className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${dragActive ? 'border-primary bg-primary/10' : 'border-muted'
                    }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {formData.logoFile ? (
                    <div className="space-y-2">
                      <Check className="w-8 h-8 text-green-500 mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        {formData.logoFile.name}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Glissez votre logo ici ou
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('logoInput')?.click()}
                      >
                        Choisir un fichier
                      </Button>
                    </div>
                  )}
                  <input
                    id="logoInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@garage.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    placeholder="07 58 96 61 56"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  placeholder="Cocody, Abidjan"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  Précédent
                </Button>
                <Button onClick={nextStep}>Suivant</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Couleur de thème
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {colorOptions.map((color) => (
                  <Card
                    key={color.value}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-medium ${formData.themeColor === color.value ? 'ring-2 ring-primary' : ''
                      }`}
                    onClick={() => setFormData(prev => ({ ...prev, themeColor: color.value }))}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: color.value }}
                        />
                        <span className="text-sm font-medium">{color.name}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={prevStep}>
                  Précédent
                </Button>
                <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">
                  <Check className="w-4 h-4 mr-2" />
                  Finaliser la configuration
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GarageSetupModal;