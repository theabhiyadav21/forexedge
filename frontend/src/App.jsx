import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator'; // <-- Naya import
import TradeJournal from './pages/TradeJournal'; 
import MLPredictor from './pages/MLPredictor';
import MonteCarlo from './pages/MonteCarlo';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      <Route 
  path="/journal" 
  element={
    <ProtectedRoute>
      <TradeJournal />
    </ProtectedRoute>
  } 
/>
<Route 
path="/ml" 
element={
   <ProtectedRoute>
     <MLPredictor />
  </ProtectedRoute>} />
<Route 
  path="/montecarlo" 
  element={
    <ProtectedRoute>
      <MonteCarlo />
    </ProtectedRoute>
  } 
/>
        {/* Naya Route */}
        <Route 
          path="/calculator" 
          element={
            <ProtectedRoute>
              <Calculator />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}