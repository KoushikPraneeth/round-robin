
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';
import Header from '@/components/Header';
import { adminLogin, isAdminLoggedIn } from '@/utils/authService';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if already logged in
    if (isAdminLoggedIn()) {
      navigate('/admin');
    }
  }, [navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    const loginSuccess = await adminLogin(username, password);
    
    if (loginSuccess) {
      navigate('/admin');
    } else {
      setError('Invalid username or password');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/30">
      <Header />
      
      <main className="flex-1 container max-w-md mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-full">
          <Card className="animate-slide-up">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="text-primary" size={20} />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access the admin panel
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="animate-fade-in">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus-ring"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full button-hover">
                  Login
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Demo credentials: username "admin" / password "admin123"</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
