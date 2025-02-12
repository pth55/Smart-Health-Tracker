import { useState, useEffect } from 'react';
import { ArrowRight, Heart, Shield, FileText, X, Activity, Users, Lock, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function LandingPage() {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
      title: "Track Your Health Journey",
      description: "Monitor vital signs and health metrics in real-time"
    },
    {
      image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=80",
      title: "Secure Document Storage",
      description: "Keep all your medical records in one safe place"
    },
    {
      image: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=1200&q=80",
      title: "Family Health Management",
      description: "Track health records for your entire family"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const validatePassword = (pass) => {
    return pass.length < 6 ? 'Password must be at least 6 characters long' : null;
  };

  const validatePhone = (phoneNumber) => {
    const phoneRegex = /^\+?[1-9]\d{9,11}$/;
    return !phoneRegex.test(phoneNumber) ? 'Please enter a valid phone number (10-12 digits)' : null;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        setLoading(false);
        return;
      }

      if (isSignUp) {
        const phoneError = validatePhone(phone);
        if (phoneError) {
          setError(phoneError);
          setLoading(false);
          return;
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { phone_number: phone },
            emailRedirectTo: window.location.origin
          }
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: signUpData.user.id,
              full_name: email.split('@')[0],
              date_of_birth: new Date('2000-01-01').toISOString(),
              phone_number: phone,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

          if (profileError) {
            console.error('Profile creation error:', profileError);
            await supabase.auth.signOut();
            throw new Error('Failed to create profile. Please try again.');
          }

          navigate('/profile-setup');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Activity className="h-12 w-12 text-blue-600" />,
      title: "Health Monitoring",
      description: "Track vital signs, including blood pressure, heart rate, and blood sugar levels with detailed analytics and trends."
    },
    {
      icon: <FileText className="h-12 w-12 text-blue-600" />,
      title: "Document Management",
      description: "Securely store and organize all your medical records, prescriptions, and test reports in one place."
    },
    {
      icon: <Lock className="h-12 w-12 text-blue-600" />,
      title: "Data Security",
      description: "Bank-level encryption ensures your medical data remains private and secure."
    },
    {
      icon: <Users className="h-12 w-12 text-blue-600" />,
      title: "Family Health Tracking",
      description: "Manage health records for your entire family with separate profiles and easy access."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Cloud Based PHR Management System by Siddhartha Academy of Higher Edu.</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => { setIsSignUp(false); setShowAuthModal(true); setError(''); }} className="px-4 py-2 text-blue-600 hover:text-blue-700">Log In</button>
            <button onClick={() => { setIsSignUp(true); setShowAuthModal(true); setError(''); }} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Sign Up</button>
          </div>
        </div>
      </nav>
      
      {/* Hero Section with Slider */}
      <section className="relative text-center py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl mb-6">
            Your Health Records, <span className="text-blue-600">Simplified</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Securely store and manage your medical records, track vital signs, and stay on top of your health journey.
          </p>
          <button
            onClick={() => { setIsSignUp(true); setShowAuthModal(true); setError(''); }}
            className="mt-10 inline-flex items-center px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </button>

          {/* Image Slider */}
          <div className="mt-10 relative max-w-4xl mx-auto">
            <div className="relative h-[400px] overflow-hidden rounded-lg shadow-xl">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-left">
                      <h3 className="text-2xl font-bold mb-2">{slide.title}</h3>
                      <p className="text-lg">{slide.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Comprehensive Health Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Secure Sign Up</h3>
              <p className="text-gray-600">Create your account with email verification for enhanced security</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Upload Records</h3>
              <p className="text-gray-600">Easily upload and organize your medical documents</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Track Health</h3>
              <p className="text-gray-600">Monitor your vitals and view detailed health analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Heart className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">HealthTrack</span>
              </div>
              <p className="text-gray-400">
                Your comprehensive health management solution for a better, healthier life.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Health Monitoring</li>
                <li>Document Management</li>
                <li>Family Health Tracking</li>
                <li>Secure Storage</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Contact Support</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Twitter</li>
                <li>Facebook</li>
                <li>LinkedIn</li>
                <li>Instagram</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} HealthTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
            <button onClick={() => { setShowAuthModal(false); setError(''); setEmail(''); setPassword(''); setPhone(''); }} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
            <form onSubmit={handleAuth} className="space-y-4">
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full rounded-md border-gray-300" 
                required 
                placeholder="Email"
              />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full rounded-md border-gray-300" 
                required 
                minLength={6} 
                placeholder="Password" 
              />
              {isSignUp && (
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="w-full rounded-md border-gray-300" 
                  required 
                  placeholder="Phone Number" 
                />
              )}
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Log In'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button 
                onClick={() => { 
                  setIsSignUp(!isSignUp); 
                  setError(''); 
                  setEmail(''); 
                  setPassword(''); 
                  setPhone('');
                }} 
                className="text-blue-600 hover:text-blue-700"
              >
                {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
