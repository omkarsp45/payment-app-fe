import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Signup } from './pages/Signup';
import { Signin } from './pages/Signin';
import { Dashboard } from './pages/Dashboard';

const isAuthenticated = () => !!localStorage.getItem('token');

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  return isAuthenticated() ? children : <Navigate to="/signup" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>} />
        <Route path="/*" element={
          <div className='w-screen flex flex-col justify-center items-center'>
            <p>Page not found</p>
            <a href="/dashboard">Home Page</a>
          </div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
