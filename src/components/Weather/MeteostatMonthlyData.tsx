'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, Calendar, Thermometer, Droplets, Wind } from 'lucide-react';

interface MonthlyDataPoint {
  date: string;
  tavg?: number;
  tmin?: number;
  tmax?: number;
  prcp?: number;
  wspd?: number;
  pres?: number;
}

interface MeteostatResponse {
  success: boolean;
  data?: {
    station: {
      id: string;
      name: string;
      country: string;
      region: string;
      latitude: number;
      longitude: number;
      elevation: number;
    };
    data: MonthlyDataPoint[];
    location: {
      latitude: number;
      longitude: number;
    };
    period: {
      year: number;
      month: number;
    };
  };
  error?: string;
}

export default function MeteostatMonthlyData() {
  const [latitude, setLatitude] = useState<string>('33.2098');
  const [longitude, setLongitude] = useState<string>('-87.5692');
  const [year, setYear] = useState<string>('2023');
  const [month, setMonth] = useState<string>('6');
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<MeteostatResponse | null>(null);
  const [error, setError] = useState<string>('');

  const fetchMonthlyData = async () => {
    setLoading(true);
    setError('');
    setData(null);

    try {
      const response = await fetch(
        `/api/weather/meteostat/monthly?lat=${latitude}&lng=${longitude}&year=${year}&month=${month}`
      );
      
      const result: MeteostatResponse = await response.json();
      
      if (result.success) {
        setData(result);
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatTemperature = (temp?: number) => {
    if (temp === undefined || temp === null) return 'N/A';
    return `${temp.toFixed(1)}°C`;
  };

  const formatPrecipitation = (prcp?: number) => {
    if (prcp === undefined || prcp === null) return 'N/A';
    return `${prcp.toFixed(1)} mm`;
  };

  const formatWindSpeed = (wspd?: number) => {
    if (wspd === undefined || wspd === null) return 'N/A';
    return `${wspd.toFixed(1)} km/h`;
  };

  const formatPressure = (pres?: number) => {
    if (pres === undefined || pres === null) return 'N/A';
    return `${pres.toFixed(1)} hPa`;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Meteostat Monthly Point Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="33.2098"
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-87.5692"
              />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="1970"
                max={new Date().getFullYear()}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2023"
              />
            </div>
            <div>
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="6"
              />
            </div>
          </div>
          
          <Button 
            onClick={fetchMonthlyData} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching Data...
              </>
            ) : (
              'Get Monthly Data'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {data?.data && (
        <div className="space-y-4">
          {/* Station Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Weather Station Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Station:</strong> {data.data.station.name}</p>
                  <p><strong>ID:</strong> {data.data.station.id}</p>
                  <p><strong>Country:</strong> {data.data.station.country}</p>
                  <p><strong>Region:</strong> {data.data.station.region}</p>
                </div>
                <div>
                  <p><strong>Coordinates:</strong> {data.data.station.latitude.toFixed(4)}, {data.data.station.longitude.toFixed(4)}</p>
                  <p><strong>Elevation:</strong> {data.data.station.elevation} m</p>
                  <p><strong>Period:</strong> {monthNames[data.data.period.month - 1]} {data.data.period.year}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Data */}
          {data.data.data.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Monthly Weather Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.data.data.map((dataPoint, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Date: {dataPoint.date}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-red-500" />
                          <div>
                            <p className="font-medium">Avg Temp</p>
                            <p>{formatTemperature(dataPoint.tavg)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-medium">Min Temp</p>
                            <p>{formatTemperature(dataPoint.tmin)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-orange-500" />
                          <div>
                            <p className="font-medium">Max Temp</p>
                            <p>{formatTemperature(dataPoint.tmax)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-medium">Precipitation</p>
                            <p>{formatPrecipitation(dataPoint.prcp)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="font-medium">Wind Speed</p>
                            <p>{formatWindSpeed(dataPoint.wspd)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-gray-400 rounded-full" />
                          <div>
                            <p className="font-medium">Pressure</p>
                            <p>{formatPressure(dataPoint.pres)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertDescription>
                No monthly data available for the selected period and location.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
