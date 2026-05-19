import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Storefront from './components/Storefront';
import AdminPanel from './components/AdminPanel';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = async () => {
    // For simplicity in this demo environment, we allow a specific admin login
    // In a real app, this would be proper Firebase Auth
    if (email === 'admin@ros.com' && password === 'ros2024') {
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0F0A0C] p-4 rtl">
      <div className="bg-[#1E1318] border border-[#3A2530] rounded-[2rem] p-10 max-w-sm w-full shadow-2xl text-center">
        <div className="text-4xl font-black italic bg-gradient-to-br from-[#9A7A30] to-[#E8C97A] bg-clip-text text-transparent mb-2">ROS</div>
        <p className="text-[#B09098] text-sm mb-8">لوحة تحكم المتجر — دخول المشرف</p>
        <div className="space-y-3">
          <input 
            type="email" 
            placeholder="البريد الإلكتروني" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-[#1A1015] border-2 border-[#3A2530] p-3 rounded-xl outline-none focus:border-[#C9A84C] text-white text-right"
          />
          <input 
            type="password" 
            placeholder="كلمة المرور" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full bg-[#1A1015] border-2 border-[#3A2530] p-3 rounded-xl outline-none focus:border-[#C9A84C] text-white text-right"
          />
          <button 
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-[#C9A84C] to-[#9A7A30] text-white py-3.5 rounded-xl font-bold shadow-lg mt-4 active:scale-95 transition-all"
          >دخول →</button>
          
          {error && (
             <div className="text-[#E05555] text-xs mt-3 flex items-center justify-center gap-2">
               ❌ خطأ في البيانات
             </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-[#3A2530] text-[0.65rem] text-[#B09098]">
             مستخدم: <span className="text-[#E8C97A]">admin@ros.com</span> | كلمة المرور: <span className="text-[#E8C97A]">ros2024</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('ros_admin') === 'true');

  const handleLogin = () => {
    setIsAdmin(true);
    localStorage.setItem('ros_admin', 'true');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('ros_admin');
  };

  useEffect(() => {
    // Add mode class to body for shared styling
    if (isAdmin) {
      document.body.classList.add('admin-mode');
      document.body.classList.remove('store-mode');
    } else {
      document.body.classList.add('store-mode');
      document.body.classList.remove('admin-mode');
    }
  }, [isAdmin]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Storefront />} />
        <Route 
          path="/admin" 
          element={isAdmin ? <AdminPanel onLogout={handleLogout} /> : <Login onLogin={handleLogin} />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
