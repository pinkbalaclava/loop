import React from 'react';
import { Package } from '../types';
import { Wifi, Star, Check } from 'lucide-react';

interface PackageCardProps {
  package: Package;
  onSelect?: (packageId: string) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ package: pkg, onSelect }) => {
  return (
    <div className={`bg-white rounded-lg border-2 p-4 shadow-sm hover:shadow-md transition-all ${
      pkg.is_popular ? 'border-loop-secondary ring-2 ring-loop-secondary ring-opacity-20' : 'border-gray-200'
    }`}>
      {pkg.is_popular && (
        <div className="flex items-center justify-center mb-2">
          <span className="bg-loop-secondary text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
            <Star size={12} fill="currentColor" />
            <span>Most Popular</span>
          </span>
        </div>
      )}
      
      <div className="text-center mb-3">
        <div className="flex items-center justify-center mb-2">
          <Wifi className="text-loop-primary" size={24} />
        </div>
        <h3 className="font-bold text-lg text-gray-800">{pkg.name}</h3>
        <p className="text-2xl font-bold text-loop-primary">{pkg.price_display}</p>
        <p className="text-sm text-gray-600">{pkg.speed} • {pkg.description}</p>
      </div>
      
      <div className="space-y-2">
        {pkg.features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <Check size={14} className="text-green-500 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
      </div>
      
      {onSelect && (
        <button
          onClick={() => onSelect(pkg.id)}
          className={`w-full mt-4 py-2 px-4 rounded-lg font-semibold transition-colors ${
            pkg.is_popular
              ? 'bg-loop-secondary hover:bg-loop-primary text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
        >
          Select Package
        </button>
      )}
    </div>
  );
};

export default PackageCard;