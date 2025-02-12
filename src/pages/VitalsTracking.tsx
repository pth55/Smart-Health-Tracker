import { useState, useEffect } from 'react';
import { Activity, TrendingUp } from 'lucide-react';
import { supabase, ensureProfile } from '../lib/supabase';
import type { VitalRecord } from '../types/database';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export function VitalsTracking() {
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newVital, setNewVital] = useState({
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    blood_sugar: '',
    heart_rate: '',
  });

  const fetchVitals = async () => {
    try {
      const profile = await ensureProfile();
      if (!profile) throw new Error('Profile not found');

      const { data, error: fetchError } = await supabase
        .from('vital_records')
        .select('*')
        .eq('user_id', profile.id)
        .order('recorded_at', { ascending: false });

      if (fetchError) throw fetchError;
      setVitals(data || []);
    } catch (error: any) {
      console.error('Error fetching vitals:', error);
      setError('Failed to load vital records');
    }
  };

  useEffect(() => {
    fetchVitals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const profile = await ensureProfile();
      if (!profile) throw new Error('Profile not found');

      // Validate inputs
      const systolic = parseInt(newVital.blood_pressure_systolic);
      const diastolic = parseInt(newVital.blood_pressure_diastolic);
      const sugar = parseFloat(newVital.blood_sugar);
      const heartRate = parseInt(newVital.heart_rate);

      if (systolic < 70 || systolic > 200) throw new Error('Invalid systolic pressure (70-200)');
      if (diastolic < 40 || diastolic > 130) throw new Error('Invalid diastolic pressure (40-130)');
      if (sugar < 30 || sugar > 600) throw new Error('Invalid blood sugar level (30-600)');
      if (heartRate < 40 || heartRate > 200) throw new Error('Invalid heart rate (40-200)');

      const { error: insertError } = await supabase
        .from('vital_records')
        .insert({
          user_id: profile.id,
          blood_pressure_systolic: systolic,
          blood_pressure_diastolic: diastolic,
          blood_sugar: sugar,
          heart_rate: heartRate,
          recorded_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      setNewVital({
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        blood_sugar: '',
        heart_rate: '',
      });

      await fetchVitals();
    } catch (error: any) {
      console.error('Error saving vitals:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = vitals.map(vital => ({
    date: new Date(vital.recorded_at).toLocaleDateString(),
    bloodPressure: vital.blood_pressure_systolic,
    heartRate: vital.heart_rate,
    bloodSugar: vital.blood_sugar
  })).reverse();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-6">
            <Activity className="h-8 w-8 text-blue-600" />
            <h1 className="ml-3 text-2xl font-bold text-gray-900">Track Your Vitals</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Blood Pressure (mmHg)
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="number"
                    placeholder="Systolic"
                    value={newVital.blood_pressure_systolic}
                    onChange={(e) => setNewVital({
                      ...newVital,
                      blood_pressure_systolic: e.target.value
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    min="70"
                    max="200"
                  />
                  <span className="text-gray-500 self-center">/</span>
                  <input
                    type="number"
                    placeholder="Diastolic"
                    value={newVital.blood_pressure_diastolic}
                    onChange={(e) => setNewVital({
                      ...newVital,
                      blood_pressure_diastolic: e.target.value
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                    min="40"
                    max="130"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Blood Sugar (mg/dL)
                </label>
                <input
                  type="number"
                  value={newVital.blood_sugar}
                  onChange={(e) => setNewVital({
                    ...newVital,
                    blood_sugar: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="30"
                  max="600"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={newVital.heart_rate}
                  onChange={(e) => setNewVital({
                    ...newVital,
                    heart_rate: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="40"
                  max="200"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Record Vitals'}
              </button>
            </div>
          </form>
        </div>

        {vitals.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center mb-6">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <h2 className="ml-3 text-xl font-semibold text-gray-900">Health Trends</h2>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bloodPressure"
                    stroke="#2563eb"
                    name="Blood Pressure"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="heartRate"
                    stroke="#dc2626"
                    name="Heart Rate"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bloodSugar"
                    stroke="#059669"
                    name="Blood Sugar"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Records</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blood Pressure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blood Sugar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Heart Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vitals.map((vital) => (
                  <tr key={vital.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vital.recorded_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vital.blood_sugar}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vital.heart_rate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}