import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './toastConfig.css';
import { AuthProvider } from './contexts/AuthContext';
import { EventProvider } from './contexts/EventContext';
import { RegistrationProvider } from './contexts/RegistrationContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Registration from './pages/Registration';
import Confirmation from './pages/Confirmation';
import Login from './pages/Login';
import Admin from './pages/Admin';
import AdminSettings from './pages/AdminSettings';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="app">
      {!isLoginPage && <Header />}
      <main className={isLoginPage ? '' : 'main-content'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inscricao" element={<Registration />} />
          <Route path="/confirmacao" element={<Confirmation />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/configuracoes" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminSettings />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      {!isLoginPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <EventProvider>
            <RegistrationProvider>
              <AppContent />
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </RegistrationProvider>
          </EventProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
