import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Coupon } from '@/utils/couponService';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CouponCardProps {
  coupon: Coupon;
  onClaim?: () => Promise<{ success: boolean; message?: string }>;
  claimed?: boolean;
  className?: string;
}

const CouponCard: React.FC<CouponCardProps> = ({ 
  coupon, 
  onClaim, 
  claimed = false,
  className = ""
}) => {
  const { toast } = useToast();
  const [claiming, setClaiming] = useState(false);

  const handleClaimCoupon = async () => {
    setClaiming(true);
    try {
      const response = await onClaim();
      if (response.success) {
        toast({
          title: "Success!",
          description: "Coupon claimed successfully",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to claim",
          description: response.message || 'Failed to claim coupon.',
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden border bg-card shadow-sm transition-all duration-300",
      "hover:shadow-md hover:-translate-y-0.5",
      claimed && "opacity-75",
      className
    )}>
      <CardHeader className="pb-2 pt-6">
        <div className="w-full flex justify-between items-center">
          <CardTitle className="text-lg font-medium">
            {coupon.code}
          </CardTitle>
          <div className="rounded-full bg-primary/10 dark:bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
            {coupon.discount}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground">{coupon.description}</p>
      </CardContent>
      <CardFooter className="pt-0 pb-6">
        {onClaim ? (
          <Button
            className="w-full font-medium relative"
            onClick={handleClaimCoupon}
            disabled={claimed || claiming}
          >
            {claiming && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin absolute left-4" />
            )}
            {claimed 
              ? 'Coupon Claimed' 
              : claiming 
                ? 'Claiming...' 
                : 'Claim Coupon'
            }
          </Button>
        ) : (
          <p className="text-sm font-medium text-center w-full">
            {coupon.isActive ? 'Active' : 'Inactive'}
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default CouponCard;
