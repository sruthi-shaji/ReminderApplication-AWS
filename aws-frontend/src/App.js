import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/login/login';
import Signup from './pages/signup/signup';
import Dashboard from './pages/dashboard/dashboard';
import Navbar from './components/navbar/navbar';

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <div className="App-header">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div >
      </div>
    </Router >

  );
}

export default App;
