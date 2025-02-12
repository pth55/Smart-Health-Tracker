import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { ProfileSetup } from './pages/ProfileSetup';
import { Documents } from './pages/Documents';
import { VitalsTracking } from './pages/VitalsTracking';
import { AuthLayout } from './components/layouts/AuthLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<AuthLayout />}>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/vitals" element={<VitalsTracking />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;