import { AlertTriangle, Info, ShieldAlert, Zap } from 'lucide-react';
import { Gift } from '../context/GiftContext';

export interface ComplianceBadgesProps {
  gift: Gift;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  showDetails?: boolean;
}

export function ComplianceBadges({ 
  gift, 
  size = 'sm', 
  orientation = 'horizontal',
  showDetails = false 
}: ComplianceBadgesProps) {
  const { compliance } = gift;

  if (!compliance) return null;

  const hasProp65 = compliance.prop65?.required;
  const hasPFAS = compliance.pfas?.containsPFAS;
  const hasEnergyCompliance = compliance.energyCompliance?.regulationRequired;
  const hasRestrictions = compliance.restrictedStates && compliance.restrictedStates.length > 0;

  // If no compliance items, don't render anything
  if (!hasProp65 && !hasPFAS && !hasEnergyCompliance && !hasRestrictions) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const containerClasses = orientation === 'horizontal' 
    ? 'flex flex-wrap gap-1.5 items-center'
    : 'flex flex-col gap-1.5';

  return (
    <div className={containerClasses}>
      {/* Prop 65 Warning */}
      {hasProp65 && (
        <div 
          className={`inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 rounded font-semibold ${sizeClasses[size]}`}
          title={compliance.prop65?.customWarning || 'California Proposition 65 Warning'}
        >
          <AlertTriangle className={iconSizes[size]} />
          <span>PROP 65</span>
        </div>
      )}

      {/* PFAS Warning */}
      {hasPFAS && (
        <div 
          className={`inline-flex items-center gap-1 bg-red-100 text-red-900 border border-red-300 rounded font-semibold ${sizeClasses[size]}`}
          title={compliance.pfas?.warningMessage || 'Contains PFAS (Per- and Polyfluoroalkyl Substances)'}
        >
          <ShieldAlert className={iconSizes[size]} />
          <span>PFAS</span>
          {compliance.pfas?.pfasLevel && size !== 'sm' && (
            <span className="text-xs opacity-80">({compliance.pfas.pfasLevel.toUpperCase()})</span>
          )}
        </div>
      )}

      {/* Energy Compliance */}
      {hasEnergyCompliance && (
        <div 
          className={`inline-flex items-center gap-1 bg-green-100 text-green-900 border border-green-300 rounded font-semibold ${sizeClasses[size]}`}
          title={`California Energy Compliance${compliance.energyCompliance?.energyRating ? `: ${compliance.energyCompliance.energyRating}` : ''}`}
        >
          <Zap className={iconSizes[size]} />
          <span>{compliance.energyCompliance?.energyRating || 'CEC'}</span>
        </div>
      )}

      {/* State Restrictions */}
      {hasRestrictions && (
        <div 
          className={`inline-flex items-center gap-1 bg-purple-100 text-purple-900 border border-purple-300 rounded font-semibold ${sizeClasses[size]}`}
          title={`Restricted in: ${compliance.restrictedStates?.join(', ')}`}
        >
          <Info className={iconSizes[size]} />
          <span>RESTRICTED</span>
        </div>
      )}

      {/* Additional certifications */}
      {compliance.certifications && compliance.certifications.length > 0 && showDetails && (
        <div className={`inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-300 rounded font-semibold ${sizeClasses[size]}`}>
          <span>{compliance.certifications.join(', ')}</span>
        </div>
      )}
    </div>
  );
}

interface ComplianceDetailsProps {
  gift: Gift;
}

export function ComplianceDetails({ gift }: ComplianceDetailsProps) {
  const { compliance } = gift;

  if (!compliance) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900">Compliance & Regulatory Information</h3>

      {/* Prop 65 Details */}
      {compliance.prop65?.required && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-2">California Proposition 65 Warning</h4>
              <p className="text-sm text-amber-800 mb-2">
                {compliance.prop65.customWarning || 
                  `This product can expose you to chemicals ${compliance.prop65.warningType === 'cancer' ? 'known to the State of California to cause cancer' : compliance.prop65.warningType === 'reproductive' ? 'known to the State of California to cause birth defects or other reproductive harm' : 'known to the State of California to cause cancer and birth defects or other reproductive harm'}.`}
              </p>
              {compliance.prop65.chemicalNames && compliance.prop65.chemicalNames.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-amber-900 mb-1">Chemical(s):</p>
                  <p className="text-xs text-amber-800">{compliance.prop65.chemicalNames.join(', ')}</p>
                </div>
              )}
              <p className="text-xs text-amber-700 mt-2">
                For more information go to{' '}
                <a 
                  href="https://www.P65Warnings.ca.gov" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-900"
                >
                  www.P65Warnings.ca.gov
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PFAS Details */}
      {compliance.pfas?.containsPFAS && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-2">PFAS Notice</h4>
              <p className="text-sm text-red-800 mb-2">
                {compliance.pfas.warningMessage || 
                  'This product contains PFAS (Per- and Polyfluoroalkyl Substances), also known as "forever chemicals."'}
              </p>
              {compliance.pfas.pfasLevel && (
                <p className="text-xs text-red-700">
                  PFAS Level: <span className="font-semibold uppercase">{compliance.pfas.pfasLevel}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Energy Compliance Details */}
      {compliance.energyCompliance?.regulationRequired && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-2">California Energy Compliance</h4>
              <p className="text-sm text-green-800 mb-2">
                This product meets California Energy Commission (CEC) regulations.
              </p>
              {compliance.energyCompliance.energyRating && (
                <p className="text-xs text-green-700 mb-1">
                  Rating: <span className="font-semibold">{compliance.energyCompliance.energyRating}</span>
                </p>
              )}
              {compliance.energyCompliance.certificationNumber && (
                <p className="text-xs text-green-700">
                  Certification #: <span className="font-mono">{compliance.energyCompliance.certificationNumber}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* State Restrictions */}
      {compliance.restrictedStates && compliance.restrictedStates.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 mb-2">Shipping Restrictions</h4>
              <p className="text-sm text-purple-800 mb-2">
                This product cannot be shipped to the following states:
              </p>
              <p className="text-sm font-semibold text-purple-900">
                {compliance.restrictedStates.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Additional Warnings */}
      {compliance.additionalWarnings && compliance.additionalWarnings.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Additional Warnings</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {compliance.additionalWarnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Certifications */}
      {compliance.certifications && compliance.certifications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Certifications</h4>
          <div className="flex flex-wrap gap-2">
            {compliance.certifications.map((cert, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-full text-sm font-semibold"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}