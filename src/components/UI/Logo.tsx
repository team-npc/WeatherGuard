'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="thunderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Cloud Shape */}
          <path
            d="M25 45 C25 35, 35 25, 45 25 C50 20, 60 20, 65 25 C75 25, 85 35, 85 45 C85 50, 80 55, 75 55 L35 55 C30 55, 25 50, 25 45 Z"
            fill="url(#cloudGradient)"
            className="drop-shadow-lg"
          />

          {/* Thunder Bolt */}
          <path
            d="M45 35 L55 35 L48 50 L52 50 L42 70 L48 55 L45 55 L52 40 L45 40 Z"
            fill="url(#thunderGradient)"
            filter="url(#glow)"
            className="drop-shadow-md"
          />

          {/* Shield Outline for Safety */}
          <path
            d="M50 15 C45 15, 40 18, 40 25 L40 35 C40 45, 45 50, 50 55 C55 50, 60 45, 60 35 L60 25 C60 18, 55 15, 50 15 Z"
            fill="none"
            stroke="url(#cloudGradient)"
            strokeWidth="2"
            opacity="0.6"
          />

          {/* Safety Dots */}
          <circle cx="30" cy="30" r="2" fill="#10b981" opacity="0.8" />
          <circle cx="70" cy="30" r="2" fill="#10b981" opacity="0.8" />
          <circle cx="30" cy="65" r="2" fill="#10b981" opacity="0.8" />
          <circle cx="70" cy="65" r="2" fill="#10b981" opacity="0.8" />
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-900 ${textSizeClasses[size]} leading-none`}>
            WeatherGuard
          </span>
          <span className="text-xs text-blue-600 font-medium leading-none mt-0.5">
            Safety First
          </span>
        </div>
      )}
    </div>
  );
}

// Simplified icon-only version
export function LogoIcon({ size = 'md', className = '' }: Omit<LogoProps, 'showText'>) {
  return <Logo size={size} showText={false} className={className} />;
}

// Animated version for loading states
export function AnimatedLogo({ size = 'md', showText = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : size === 'lg' ? 'w-12 h-12' : 'w-16 h-16'} relative animate-pulse`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full animate-bounce"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="animatedCloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa">
                <animate attributeName="stop-color" values="#60a5fa;#3b82f6;#60a5fa" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#1d4ed8">
                <animate attributeName="stop-color" values="#1d4ed8;#60a5fa;#1d4ed8" dur="2s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
            <linearGradient id="animatedThunderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24">
                <animate attributeName="stop-color" values="#fbbf24;#f59e0b;#fbbf24" dur="1s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#d97706">
                <animate attributeName="stop-color" values="#d97706;#fbbf24;#d97706" dur="1s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>

          <path
            d="M25 45 C25 35, 35 25, 45 25 C50 20, 60 20, 65 25 C75 25, 85 35, 85 45 C85 50, 80 55, 75 55 L35 55 C30 55, 25 50, 25 45 Z"
            fill="url(#animatedCloudGradient)"
            className="drop-shadow-lg"
          />

          <path
            d="M45 35 L55 35 L48 50 L52 50 L42 70 L48 55 L45 55 L52 40 L45 40 Z"
            fill="url(#animatedThunderGradient)"
            className="drop-shadow-md"
          >
            <animateTransform
              attributeName="transform"
              type="scale"
              values="1;1.1;1"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-900 ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : size === 'lg' ? 'text-2xl' : 'text-3xl'} leading-none`}>
            WeatherGuard
          </span>
          <span className="text-xs text-blue-600 font-medium leading-none mt-0.5">
            Safety First
          </span>
        </div>
      )}
    </div>
  );
}
