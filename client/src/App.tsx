import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';
import { useAuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [loading, setLoading] = useState(true);
  const { checkAuth, user } = useAuthContext();
  const navigate = useNavigate();
  useEffect(() => {
    const authenticate = async () => {
      await checkAuth();
      setLoading(false);
    };
    authenticate();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:conversationId" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
