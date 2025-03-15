
// Coupon service for managing coupons and claims

import axios from 'axios';
import { authAxios } from './authService';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: string;
  isActive: boolean;
  claimedBy?: string;
  claimedAt?: Date;
}

export interface ClaimHistory {
  id: string;
  couponId: string;
  couponCode: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// API URL
const API_URL = 'https://couponhub-backend-n67k.onrender.com/api';

// LocalStorage key for last claim time
const LAST_CLAIM_KEY = 'lastClaim';

// Get all coupons (admin only)
export const getAllCoupons = async (): Promise<Coupon[]> => {
  try {
    const response = await authAxios.get('/coupons');
    return response.data.map((coupon: any) => ({
      id: coupon._id,
      code: coupon.code,
      description: coupon.description,
      discount: coupon.discount,
      isActive: coupon.isActive,
      claimedBy: coupon.claimedBy,
      claimedAt: coupon.claimedAt
    }));
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return [];
  }
};

// Get active coupons
export const getActiveCoupons = async (): Promise<Coupon[]> => {
  try {
    const response = await axios.get(`${API_URL}/coupons/active`);
    return response.data.map((coupon: any) => ({
      id: coupon._id,
      code: coupon.code,
      description: coupon.description,
      discount: coupon.discount,
      isActive: coupon.isActive
    }));
  } catch (error) {
    console.error('Error fetching active coupons:', error);
    return [];
  }
};

// Get claim history (admin only)
export const getClaimHistory = async (): Promise<ClaimHistory[]> => {
  try {
    const response = await authAxios.get('/coupons/history');
    return response.data.map((history: any) => ({
      id: history._id,
      couponId: history.couponId,
      couponCode: history.couponCode,
      ipAddress: history.ipAddress,
      userAgent: history.userAgent,
      timestamp: new Date(history.createdAt)
    }));
  } catch (error) {
    console.error('Error fetching claim history:', error);
    return [];
  }
};

// Add a new coupon (admin only)
export const addCoupon = async (coupon: Omit<Coupon, 'id'>): Promise<{ success: boolean; message?: string; coupon?: Coupon }> => {
  try {
    const response = await authAxios.post('/coupons', coupon);
    return {
      success: true,
      coupon: {
        id: response.data._id,
        code: response.data.code,
        description: response.data.description,
        discount: response.data.discount,
        isActive: response.data.isActive
      }
    };
  } catch (error: any) {
    console.error('Error adding coupon:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to add coupon'
    };
  }
};

// Update a coupon (admin only)
export const updateCoupon = async (id: string, updates: Partial<Coupon>): Promise<Coupon | null> => {
  try {
    const response = await authAxios.put(`/coupons/${id}`, updates);
    return {
      id: response.data._id,
      code: response.data.code,
      description: response.data.description,
      discount: response.data.discount,
      isActive: response.data.isActive
    };
  } catch (error) {
    console.error('Error updating coupon:', error);
    return null;
  }
};

// Toggle coupon active status (admin only)
export const toggleCouponStatus = async (id: string): Promise<Coupon | null> => {
  try {
    const response = await authAxios.patch(`/coupons/${id}/toggle`);
    return {
      id: response.data._id,
      code: response.data.code,
      description: response.data.description,
      discount: response.data.discount,
      isActive: response.data.isActive
    };
  } catch (error) {
    console.error('Error toggling coupon status:', error);
    return null;
  }
};

// Check if user can claim a coupon (cooldown period check)
export const canClaimCoupon = (): boolean => {
  const lastClaim = localStorage.getItem(LAST_CLAIM_KEY);
  
  if (!lastClaim) return true;
  
  const lastClaimTime = new Date(JSON.parse(lastClaim)).getTime();
  const now = new Date().getTime();
  
  // 30 minute cooldown
  const cooldownPeriod = 30 * 60 * 1000;
  
  return now - lastClaimTime > cooldownPeriod;
};

// Get cooldown time remaining in minutes
export const getCooldownRemaining = (): number => {
  const lastClaim = localStorage.getItem(LAST_CLAIM_KEY);
  
  if (!lastClaim) return 0;
  
  const lastClaimTime = new Date(JSON.parse(lastClaim)).getTime();
  const now = new Date().getTime();
  const cooldownPeriod = 30 * 60 * 1000;
  const remaining = cooldownPeriod - (now - lastClaimTime);
  
  return Math.max(0, Math.ceil(remaining / (60 * 1000)));
};

// Claim a coupon
export const claimCoupon = async (): Promise<{ success: boolean; coupon?: Coupon; message: string }> => {
  if (!canClaimCoupon()) {
    const minutesRemaining = getCooldownRemaining();
    return {
      success: false,
      message: `Please wait ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''} before claiming another coupon.`
    };
  }
  
  try {
    console.log('Attempting to claim coupon at:', `${API_URL}/coupons/claim`);
    const response = await axios.post(`${API_URL}/coupons/claim`);
    console.log('Claim response:', response.data);
    
    // Set last claim time
    localStorage.setItem(LAST_CLAIM_KEY, JSON.stringify(new Date()));
    
    return {
      success: true,
      coupon: {
        id: response.data.coupon._id,
        code: response.data.coupon.code,
        description: response.data.coupon.description,
        discount: response.data.coupon.discount,
        isActive: response.data.coupon.isActive
      },
      message: response.data.message
    };
  } catch (error: any) {
    console.error('Claim error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });

    if (error.response && error.response.data && error.response.data.message) {
      return {
        success: false,
        message: error.response.data.message
      };
    }
    
    return {
      success: false,
      message: 'Error claiming coupon. Please try again later.'
    };
  }
};
