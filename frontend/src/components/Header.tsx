
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { adminLogout, isAdminLoggedIn } from '@/utils/authService';
import { ThemeToggle } from './ThemeToggle';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');
  const isLoggedIn = isAdminLoggedIn();
  
  const handleLogout = () => {
    adminLogout();
    navigate('/');
  };
  
  return (
    <header className="w-full mx-auto px-6 py-4 flex items-center justify-between z-10 bg-background/95 backdrop-blur-md sticky top-0 border-b">
      <div className="flex items-center">
        <Link to="/" className="text-2xl font-semibold tracking-tight">
          CouponHub
        </Link>
      </div>
      
      <nav className="flex items-center space-x-4">
        <ThemeToggle />
        {isAdmin ? (
          <>
            {isLoggedIn && (
              <>
                <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm font-medium hover:text-destructive transition-colors"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            )}
          </>
        ) : (
          <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
            Admin
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;
