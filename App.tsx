
import React, { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, User, signOut } from './firebase';
import LoginPage from './components/LoginPage';
import POSInterface from './components/POSInterface';
import ManageProducts from './components/ManageProducts';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'pos' | 'manage'>('pos');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="min-h-screen bg-zinc-950">
      {currentView === 'pos' ? (
        <POSInterface 
          user={user} 
          onLogout={handleLogout} 
          onToggleManage={() => setCurrentView('manage')} 
        />
      ) : (
        <ManageProducts 
          user={user} 
          onBack={() => setCurrentView('pos')} 
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default App;
