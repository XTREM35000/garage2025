import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  stats?: {
    value: string | number;
    label: string;
    trend?: 'up' | 'down' | 'stable';
  };
  onClick: () => void;
  gradient?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon: Icon,
  stats,
  onClick,
  gradient = 'from-primary/10 via-primary/5 to-transparent',
  badge
}) => {
  return (
    <Card 
      className={`group relative overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 bg-gradient-to-br ${gradient} border-border/50 hover:border-primary/30 active:scale-95`}
      onClick={onClick}
    >
      {/* Effet de brillance au hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>

      <CardHeader className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors duration-300">
            <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
          </div>
          {badge && (
            <Badge variant={badge.variant || 'default'} className="text-xs animate-pulse">
              {badge.text}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
            {description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="relative">
        {stats && (
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                {stats.value}
              </span>
              {stats.trend && (
                <div className={`flex items-center text-sm font-medium ${
                  stats.trend === 'up' ? 'text-green-500' : 
                  stats.trend === 'down' ? 'text-red-500' : 
                  'text-muted-foreground'
                }`}>
                  {stats.trend === 'up' && '↗️'}
                  {stats.trend === 'down' && '↘️'}
                  {stats.trend === 'stable' && '➡️'}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {stats.label}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="relative">
        <div className="w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
      </CardFooter>
    </Card>
  );
};

export default DashboardCard;