
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ClaimHistory } from '@/utils/couponService';

interface AdminClaimHistoryProps {
  claimHistory: ClaimHistory[];
}

const AdminClaimHistory: React.FC<AdminClaimHistoryProps> = ({ claimHistory }) => {
  // Format date for better readability
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };
  
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Claim History</h2>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coupon Code</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>User Agent</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claimHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No claim history available
                </TableCell>
              </TableRow>
            ) : (
              claimHistory.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">{claim.couponCode}</TableCell>
                  <TableCell>{claim.ipAddress}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {claim.userAgent}
                  </TableCell>
                  <TableCell>{formatDate(claim.timestamp)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminClaimHistory;
