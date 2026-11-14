import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import FindDonations from './pages/FindDonations';
import Profile from './pages/Profile';
import DonorDashboard from './pages/donor/DonorDashboard';
import ReceiverDashboard from './pages/receiver/ReceiverDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import { useAuth } from './context/AuthContext';

function RoleHome() {
  const { user } = useAuth();

  if (user?.role === 'donor') return <DonorDashboard />;
  if (user?.role === 'receiver') return <ReceiverDashboard />;
  if (user?.role === 'admin') return <AdminDashboard />;
  return <Home />;
}

function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<RoleHome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/donor" element={<Register role="donor" />} />
            <Route path="/register/receiver" element={<Register role="receiver" />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/donations" element={<FindDonations />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/donor/dashboard" element={<DonorDashboard />} />
            <Route path="/receiver/dashboard" element={<ReceiverDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
