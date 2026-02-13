import { ECardTemplate } from '../types/celebration';
import { Sparkles, Heart, Star, Gift, Award } from 'lucide-react';

interface ECardProps {
  template: ECardTemplate;
  message?: string;
  senderName?: string;
  recipientName?: string;
  size?: 'small' | 'medium' | 'large';
  showMessage?: boolean;
}

export function ECard({ 
  template, 
  message, 
  senderName, 
  recipientName = 'You',
  size = 'medium',
  showMessage = false 
}: ECardProps) {
  
  const sizeClasses = {
    small: 'w-48 h-32',
    medium: 'w-80 h-56',
    large: 'w-96 h-72',
  };

  const renderDesign = () => {
    switch (template.design) {
      case 'confetti':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-60"
                style={{
                  width: `${Math.random() * 8 + 4}px`,
                  height: `${Math.random() * 8 + 4}px`,
                  backgroundColor: i % 2 === 0 ? template.accentColor : '#FFFFFF',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>
        );
      
      case 'balloons':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-40"
                style={{
                  width: `${Math.random() * 40 + 30}px`,
                  height: `${Math.random() * 50 + 40}px`,
                  backgroundColor: i % 2 === 0 ? template.accentColor : '#FFFFFF',
                  left: `${Math.random() * 80}%`,
                  bottom: `-${Math.random() * 20}%`,
                }}
              >
                <div 
                  className="absolute w-0.5 h-12 opacity-60"
                  style={{ 
                    backgroundColor: template.textColor,
                    left: '50%',
                    top: '100%',
                  }}
                />
              </div>
            ))}
          </div>
        );
      
      case 'stars':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <Star
                key={i}
                className="absolute opacity-40"
                style={{
                  color: i % 2 === 0 ? template.accentColor : '#FFFFFF',
                  width: `${Math.random() * 16 + 12}px`,
                  height: `${Math.random() * 16 + 12}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
                fill="currentColor"
              />
            ))}
          </div>
        );
      
      case 'gradient':
        return (
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${template.backgroundColor} 0%, ${template.accentColor} 100%)`,
            }}
          />
        );
      
      case 'pattern':
        return (
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, ${template.accentColor} 1px, transparent 1px),
                                  radial-gradient(circle at 80% 80%, ${template.accentColor} 1px, transparent 1px),
                                  radial-gradient(circle at 40% 20%, ${template.accentColor} 1px, transparent 1px)`,
                backgroundSize: '50px 50px, 80px 80px, 100px 100px',
              }}
            />
          </div>
        );
      
      case 'floral':
        return (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-30"
                style={{
                  width: `${Math.random() * 30 + 20}px`,
                  height: `${Math.random() * 30 + 20}px`,
                  backgroundColor: template.accentColor,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  boxShadow: `0 0 20px ${template.accentColor}`,
                }}
              />
            ))}
          </div>
        );
      
      case 'minimal':
        return (
          <div className="absolute inset-0 border-4 border-current opacity-20" 
               style={{ borderColor: template.accentColor, margin: '8px' }} 
          />
        );
      
      default:
        return null;
    }
  };

  const getIconForCategory = () => {
    switch (template.category) {
      case 'anniversary':
        return <Award className="w-8 h-8" />;
      case 'birthday':
        return <Gift className="w-8 h-8" />;
      case 'congratulations':
        return <Sparkles className="w-8 h-8" />;
      case 'thank-you':
        return <Heart className="w-8 h-8" />;
      default:
        return <Star className="w-8 h-8" />;
    }
  };

  return (
    <div 
      className={`relative rounded-2xl shadow-lg overflow-hidden ${sizeClasses[size]}`}
      style={{ backgroundColor: template.backgroundColor }}
    >
      {/* Background Design */}
      {renderDesign()}
      
      {/* Content */}
      <div 
        className="relative h-full flex flex-col items-center justify-center p-6 text-center z-10"
        style={{ color: template.textColor }}
      >
        {/* Icon */}
        <div className="mb-4 opacity-80">
          {getIconForCategory()}
        </div>
        
        {/* Main Text */}
        <h3 className="font-bold text-xl mb-2 capitalize">
          {template.category === 'anniversary' && 'Congratulations!'}
          {template.category === 'birthday' && 'Happy Birthday!'}
          {template.category === 'congratulations' && 'Well Done!'}
          {template.category === 'thank-you' && 'Thank You!'}
          {template.category === 'general' && 'Celebration'}
        </h3>
        
        {recipientName && (
          <p className="text-lg font-semibold mb-3 opacity-90">
            {recipientName}
          </p>
        )}
        
        {/* Message Preview */}
        {showMessage && message && (
          <p className="text-sm italic opacity-80 line-clamp-2">
            "{message}"
          </p>
        )}
        
        {/* Sender */}
        {senderName && (
          <p className="text-xs mt-auto opacity-70">
            From {senderName}
          </p>
        )}
      </div>
    </div>
  );
}