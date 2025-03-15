import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CouponCard from '@/components/CouponCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { claimCoupon, canClaimCoupon, getCooldownRemaining, Coupon } from '@/utils/couponService';
import { Clock, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [claimed, setClaimed] = useState(false);
  const [claimedCoupon, setClaimedCoupon] = useState<Coupon | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const canClaim = canClaimCoupon();
    setClaimed(!canClaim);
    if (!canClaim) {
      setCooldownRemaining(getCooldownRemaining());
      const interval = setInterval(() => {
        const remaining = getCooldownRemaining();
        setCooldownRemaining(remaining);
        if (remaining === 0) {
          setClaimed(false);
          clearInterval(interval);
          toast({
            title: "Ready!",
            description: "You can now claim another coupon",
          });
        }
      }, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, []);
  
  const handleClaim = async () => {
    setIsAnimating(true);
    setLoading(true);
    
    setTimeout(async () => {
      try {
        const result = await claimCoupon();
        setMessage(result.message);
        setIsError(!result.success);
        
        if (result.success && result.coupon) {
          setClaimed(true);
          setClaimedCoupon(result.coupon);
          setCooldownRemaining(30); // Reset to 30 minutes
          toast({
            title: "Success!",
            description: "Coupon claimed successfully.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.message,
          });
        }
      } catch (error) {
        console.error("Error claiming coupon:", error);
        setMessage("An error occurred while claiming the coupon. Please try again.");
        setIsError(true);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to claim coupon. Please try again.",
        });
      } finally {
        setIsAnimating(false);
        setLoading(false);
      }
    }, 600); // Small delay for animation
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-10 space-y-8">
        <section className="text-center animate-fade-in">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Exclusive Coupons Just For You
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Claim a special discount coupon to use on your purchase. 
            Our system ensures fair distribution with one coupon per user.
          </p>
        </section>
        
        <section className="animate-fade-in">
          <div className="max-w-md mx-auto transform transition-all duration-500">
            {message && (
              <Alert variant={isError ? "destructive" : "default"} className="mb-6 animate-fade-in">
                <div className="flex items-center gap-2">
                  {isError ? <AlertCircle size={18} /> : null}
                  <AlertDescription>{message}</AlertDescription>
                </div>
              </Alert>
            )}
            
            <Card className={cn(
              "overflow-hidden border bg-card transition-all duration-300",
              isAnimating && "scale-[1.02] shadow-lg",
              claimed && "opacity-90"
            )}>
              <CardContent className="p-6 flex flex-col items-center text-center">
                {claimed && claimedCoupon ? (
                  <>
                    <div className="mb-6 mt-2 w-full">
                      <div className="text-sm font-medium text-muted-foreground mb-2">Your Coupon</div>
                      <CouponCard coupon={claimedCoupon} claimed={true} className="animate-fade-in" />
                    </div>
                    
                    <div className="flex items-center mt-2 text-muted-foreground animate-fade-in">
                      <Clock size={18} className="mr-2" />
                      <span className="text-sm">
                        Next coupon available in {cooldownRemaining} minute{cooldownRemaining !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-semibold mb-4">Get Your Coupon</h2>
                    <p className="text-muted-foreground mb-6">
                      Click the button below to claim a special discount coupon.
                    </p>
                    
                    <Button
                      size="lg"
                      onClick={handleClaim}
                      disabled={claimed || isAnimating || loading}
                      className={cn(
                        "relative transition-all duration-300",
                        loading && "pl-8"
                      )}
                    >
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin absolute left-4" />
                      )}
                      {loading ? 'Processing...' : claimed ? 'Try Again Later' : 'Claim Your Coupon'}
                    </Button>
                    
                    {claimed && (
                      <div className="flex items-center mt-4 text-muted-foreground animate-fade-in">
                        <Clock size={18} className="mr-2" />
                        <span className="text-sm">
                          Available again in {cooldownRemaining} minute{cooldownRemaining !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
        
        <section className="text-center opacity-85">
          <h2 className="text-xl font-medium mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4 dark:bg-primary/20">
                <span className="font-medium text-primary">1</span>
              </div>
              <h3 className="font-medium mb-2">Claim a Coupon</h3>
              <p className="text-sm text-muted-foreground">
                Click the button to receive a unique discount coupon.
              </p>
            </div>
            <div className="p-4">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4 dark:bg-primary/20">
                <span className="font-medium text-primary">2</span>
              </div>
              <h3 className="font-medium mb-2">Use Your Discount</h3>
              <p className="text-sm text-muted-foreground">
                Apply the coupon code during checkout to get your discount.
              </p>
            </div>
            <div className="p-4">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4 dark:bg-primary/20">
                <span className="font-medium text-primary">3</span>
              </div>
              <h3 className="font-medium mb-2">Come Back Later</h3>
              <p className="text-sm text-muted-foreground">
                Return after the cooldown period to claim more coupons.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-6 border-t bg-card text-center text-sm text-muted-foreground">
        <div className="container">
          &copy; {new Date().getFullYear()} CouponHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
