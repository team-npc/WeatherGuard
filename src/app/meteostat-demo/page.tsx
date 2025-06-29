import React from 'react';
import MeteostatMonthlyData from '@/components/Weather/MeteostatMonthlyData';

export default function MeteostatDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Meteostat Monthly Point Data Demo
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              This demo showcases the integration with Meteostat API via RapidAPI to fetch 
              historical monthly weather data for any location worldwide.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">About Meteostat Integration</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Features:</h3>
                <ul className="space-y-1">
                  <li>• Historical monthly weather data</li>
                  <li>• Global weather station network</li>
                  <li>• Temperature, precipitation, wind data</li>
                  <li>• Pressure and other meteorological parameters</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">API Details:</h3>
                <ul className="space-y-1">
                  <li>• Powered by RapidAPI</li>
                  <li>• Data from 1970 onwards</li>
                  <li>• Automatic station selection</li>
                  <li>• Rate limiting and error handling</li>
                </ul>
              </div>
            </div>
          </div>

          <MeteostatMonthlyData />

          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Configuration Required
            </h3>
            <p className="text-blue-800 mb-3">
              To use this functionality, you need to configure your RapidAPI key:
            </p>
            <div className="bg-blue-100 rounded p-3 font-mono text-sm">
              <p>1. Get a RapidAPI key from: https://rapidapi.com/</p>
              <p>2. Subscribe to Meteostat API</p>
              <p>3. Add to your .env.local file:</p>
              <p className="mt-2 text-blue-900">NEXT_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key_here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
