
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import AdminCouponTable from '@/components/AdminCouponTable';
import AdminClaimHistory from '@/components/AdminClaimHistory';
import { getAllCoupons, getClaimHistory, Coupon, ClaimHistory } from '@/utils/couponService';
import { isAdminLoggedIn } from '@/utils/authService';

const Admin = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [claimHistory, setClaimHistory] = useState<ClaimHistory[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const loadingRef = useRef(false);
  const toastShown = useRef(false);
  
  const loadData = useCallback(async () => {
    if (loadingRef.current) return; // Prevent multiple simultaneous calls
    loadingRef.current = true;
    
    try {
      if (!refreshing) {
        setInitialLoading(true);
      }
      setRefreshing(true);
      const couponsData = await getAllCoupons();
      const historyData = await getClaimHistory();
      
      setCoupons(couponsData);
      setClaimHistory(historyData);
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
      if (!toastShown.current) {
        toastShown.current = true;
      }
      loadingRef.current = false;
    }
  }, []);
  
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [navigate, loadData]);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-down">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage coupons and track user claim history
          </p>
        </div>
        
        <Tabs defaultValue="coupons" className="animate-fade-in">
          <TabsList className="mb-6">
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="claims">Claim History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="coupons" className="animate-fade-in">
            <div className="p-4 bg-card rounded-lg border shadow-sm">
              {initialLoading ? (
                <div className="text-center py-8">Loading coupons...</div>
              ) : (
                <AdminCouponTable coupons={coupons} onCouponsChange={loadData} />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="claims" className="animate-fade-in">
            <div className="p-4 bg-card rounded-lg border shadow-sm">
              {initialLoading ? (
                <div className="text-center py-8">Loading claim history...</div>
              ) : (
                <AdminClaimHistory claimHistory={claimHistory} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
