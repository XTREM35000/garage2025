import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradient?: string;
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  gradient = 'from-primary/10 to-primary/5',
  onClick
}) => {
  return (
    <Card
      className={`
        relative overflow-hidden cursor-pointer group
        transition-all duration-300 ease-in-out
        hover:shadow-lg hover:scale-105 hover:-translate-y-1
        border-0 bg-gradient-to-br ${gradient}
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
      onClick={onClick}
    >
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary/80 group-hover:text-primary transition-colors" />
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold mb-1 animate-fade-in">
          {value}
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground mb-2">
            {description}
          </p>
        )}
        
        {trend && (
          <div className="flex items-center gap-1">
            <span
              className={`text-xs font-medium ${
                trend.isPositive ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↗' : '↘'} {trend.value}
            </span>
            <span className="text-xs text-muted-foreground">
              vs mois dernier
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};