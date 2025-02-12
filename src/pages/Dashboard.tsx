import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, FileText, User, Heart, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Profile, VitalRecord } from '../types/database';
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

export function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch vital records
        const { data: vitalsData, error: vitalsError } = await supabase
          .from('vital_records')
          .select('*')
          .eq('user_id', user.id)
          .order('recorded_at', { ascending: false })
          .limit(10);

        if (vitalsError) throw vitalsError;
        setVitals(vitalsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const chartData = vitals.map(vital => ({
    date: new Date(vital.recorded_at).toLocaleDateString(),
    bloodPressure: vital.blood_pressure_systolic,
    heartRate: vital.heart_rate,
    bloodSugar: vital.blood_sugar
  })).reverse();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="mt-2 text-gray-600">Here's an overview of your health records</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Link
            to="/vitals"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <h2 className="ml-3 text-xl font-semibold text-gray-900">Latest Vitals</h2>
            </div>
            {vitals[0] ? (
              <div className="mt-4 space-y-2">
                <p className="text-gray-600">
                  Blood Pressure: {vitals[0].blood_pressure_systolic}/{vitals[0].blood_pressure_diastolic}
                </p>
                <p className="text-gray-600">
                  Blood Sugar: {vitals[0].blood_sugar} mg/dL
                </p>
                <p className="text-gray-600">
                  Heart Rate: {vitals[0].heart_rate} bpm
                </p>
              </div>
            ) : (
              <p className="mt-4 text-gray-600">No vitals recorded yet</p>
            )}
          </Link>

          <Link
            to="/documents"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <h2 className="ml-3 text-xl font-semibold text-gray-900">Documents</h2>
            </div>
            <p className="mt-4 text-gray-600">
              Manage and access your medical records securely
            </p>
          </Link>

          <Link
            to="/profile-setup"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <h2 className="ml-3 text-xl font-semibold text-gray-900">Profile</h2>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-gray-600">Age: {profile?.date_of_birth ? 
                Math.floor((new Date().getTime() - new Date(profile.date_of_birth).getTime()) / 31557600000) : 'N/A'
              } years</p>
              <p className="text-gray-600">Blood Type: {profile?.blood_type || 'Not set'}</p>
            </div>
          </Link>
        </div>

        {vitals.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
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

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Heart className="h-8 w-8 text-blue-600" />
            <h2 className="ml-3 text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Record New Data</h3>
              <div className="mt-4 space-y-4">
                <Link
                  to="/vitals"
                  className="block px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Add Vital Signs
                </Link>
                <Link
                  to="/documents"
                  className="block px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Upload Document
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              <div className="mt-4 space-y-2">
                {vitals.slice(0, 3).map((vital, index) => (
                  <p key={index} className="text-gray-600">
                    Vitals recorded - {new Date(vital.recorded_at).toLocaleDateString()}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}