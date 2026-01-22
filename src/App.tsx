import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { EventProvider } from './contexts/EventContext';
import { RegistrationProvider } from './contexts/RegistrationContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Registration from './pages/Registration';
import Confirmation from './pages/Confirmation';
import Login from './pages/Login';
import Admin from './pages/Admin';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <EventProvider>
          <RegistrationProvider>
            <div className="app">
              <Header />
              <main className="main-content">
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
                </Routes>
              </main>
              <Footer />
            </div>
          </RegistrationProvider>
        </EventProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
