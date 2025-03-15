
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Coupon, addCoupon, updateCoupon, toggleCouponStatus } from '@/utils/couponService';
import { Pencil, Plus } from 'lucide-react';

interface AdminCouponTableProps {
  coupons: Coupon[];
  onCouponsChange: () => void;
}

const AdminCouponTable: React.FC<AdminCouponTableProps> = ({ coupons, onCouponsChange }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount: '',
    isActive: true
  });
  
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setTogglingIds(prev => new Set(prev).add(id));
    try {
      const result = await toggleCouponStatus(id);
      if (result) {
        toast({
          title: "Success",
          description: `Coupon ${result.code} ${currentStatus ? 'disabled' : 'enabled'}`,
        });
        onCouponsChange();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update coupon status",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update coupon status",
      });
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };
  
  const openAddDialog = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discount: '',
      isActive: true
    });
    setDialogOpen(true);
  };
  
  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discount: coupon.discount,
      isActive: coupon.isActive
    });
    setDialogOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      if (editingCoupon) {
        const result = await updateCoupon(editingCoupon.id, formData);
        if (result) {
          toast({
            title: "Success",
            description: "Coupon updated successfully",
          });
          setDialogOpen(false);
          onCouponsChange();
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update coupon",
          });
        }
      } else {
        const result = await addCoupon(formData);
        if (result.success && result.coupon) {
          toast({
            title: "Success",
            description: "Coupon added successfully",
          });
          setDialogOpen(false);
          onCouponsChange();
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.message || "Failed to add coupon",
          });
        }
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while saving the coupon",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Coupons</h2>
        <Button onClick={openAddDialog} size="sm" className="flex items-center gap-1">
          <Plus size={16} />
          <span>Add Coupon</span>
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No coupons available
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell>{coupon.description}</TableCell>
                  <TableCell>{coupon.discount}</TableCell>
                  <TableCell>
                    <Switch 
                      checked={coupon.isActive}
                      disabled={togglingIds.has(coupon.id)} 
                      onCheckedChange={() => handleToggleStatus(coupon.id, coupon.isActive)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openEditDialog(coupon)}
                    >
                      <Pencil size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="SUMMER20"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="20% off summer collection"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount">Discount Value</Label>
                <Input
                  id="discount"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  placeholder="20%"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingCoupon ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCouponTable;
