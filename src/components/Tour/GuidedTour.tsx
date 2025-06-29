'use client';

import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const tourSteps: Step[] = [
  {
    target: '.tour-welcome',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">🌟 Welcome to WeatherGuard!</h3>
        <p>Your ultimate safety companion for weather emergencies and disaster preparedness. Let's take a quick tour to show you all the powerful features!</p>
      </div>
    ),
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.tour-search',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">🔍 Global Location Search</h3>
        <p>Search for any location worldwide! Our comprehensive database includes cities, landmarks, airports, and points of interest. Click the 📌 pin button to save locations for quick access.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '.tour-emergency-status',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">🚨 Emergency Status Center</h3>
        <p>Monitor real-time emergency conditions with our advanced detection system. The PANIC BUTTON instantly alerts your emergency contacts via SMS and WhatsApp with your live location!</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '.tour-pinned-locations',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">📌 Pinned Locations</h3>
        <p>Save important locations like home, work, or family members' addresses. Click on any pinned location to instantly view its weather conditions and safety status.</p>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '.tour-map-controls',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">🗺️ Interactive Map Controls</h3>
        <p>Toggle different map layers:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>Weather Radar:</strong> Real-time precipitation data</li>
          <li><strong>Traffic:</strong> Current traffic conditions</li>
          <li><strong>Saved Places:</strong> Your pinned locations</li>
          <li><strong>Live Locations:</strong> Family member tracking</li>
          <li><strong>Weather Alerts:</strong> Active weather warnings</li>
          <li><strong>Disasters:</strong> Emergency events nearby</li>
        </ul>
      </div>
    ),
    placement: 'left',
  },
  {
    target: '.tour-map',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">🌍 Interactive Safety Map</h3>
        <p>Click anywhere on the map to get instant safety information for that location. The map shows weather alerts, disaster events, and safety zones with color-coded indicators.</p>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '.tour-emergency-mode',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">⚠️ Smart Emergency Detection</h3>
        <p>Our AI monitors multiple factors:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Severe weather threats</li>
          <li>Device shaking (panic detection)</li>
          <li>Multiple simultaneous alerts</li>
          <li>Proximity to disasters</li>
        </ul>
        <p className="mt-2">Emergency mode activates automatically when critical conditions are detected!</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '.tour-settings',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">⚙️ Settings & Contacts</h3>
        <p>Configure your emergency contacts, notification preferences, and privacy settings. Add family members who will receive automatic alerts during emergencies.</p>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '.tour-welcome',
    content: (
      <div>
        <h3 className="text-lg font-bold mb-2">🎉 You're All Set!</h3>
        <p>WeatherGuard is now ready to keep you and your family safe. Remember:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Pin important locations</li>
          <li>Add emergency contacts</li>
          <li>Keep location services enabled</li>
          <li>Test the panic button with family</li>
        </ul>
        <p className="mt-3 font-semibold text-blue-600">Stay safe out there! 🛡️</p>
      </div>
    ),
    placement: 'center',
  },
];

export default function GuidedTour({ isOpen, onClose }: GuidedTourProps) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM elements are rendered
      setTimeout(() => setRun(true), 500);
    } else {
      setRun(false);
    }
  }, [isOpen]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      onClose();
      
      // Mark tour as completed in localStorage
      localStorage.setItem('weatherguard-tour-completed', 'true');
    }
  };

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#2563eb',
          textColor: '#374151',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          arrowColor: '#ffffff',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          color: '#1f2937',
          fontSize: '18px',
          fontWeight: 'bold',
        },
        tooltipContent: {
          color: '#4b5563',
          fontSize: '14px',
          lineHeight: '1.5',
        },
        buttonNext: {
          backgroundColor: '#2563eb',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: 10,
        },
        buttonSkip: {
          color: '#6b7280',
        },
        buttonClose: {
          color: '#6b7280',
        },
      }}
      locale={{
        back: 'Previous',
        close: 'Close',
        last: 'Finish Tour',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
}
