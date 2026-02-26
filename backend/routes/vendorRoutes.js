import express from 'express';
import * as vendorCtrl from '../controllers/vendorController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================== VENDOR PROFILE ====================
// Create vendor profile (requires auth)
router.post('/profile', authenticate, vendorCtrl.createVendorProfile);

// Get my vendor profile
router.get('/profile', authenticate, vendorCtrl.getVendorProfile);

// Update vendor profile
router.put('/profile', authenticate, vendorCtrl.updateVendorProfile);

// Get vendor by ID (public)
router.get('/vendor/:id', vendorCtrl.getVendorById);

// List vendors with filters
router.get('/vendors', vendorCtrl.listVendors);

// ==================== VENDOR PRICES ====================
// Add price offer
router.post('/prices', authenticate, vendorCtrl.addVendorPrice);

// Get my price offers
router.get('/my-prices', authenticate, vendorCtrl.getMyVendorPrices);

// Get active price offers (for farmers)
router.get('/prices/active', vendorCtrl.getActiveVendorPrices);

// ==================== VENDOR TRANSPORT ====================
// Add transport
router.post('/transport', authenticate, vendorCtrl.addVendorTransport);

// Get my transport
router.get('/my-transport', authenticate, vendorCtrl.getMyVendorTransport);

// Get available transport (for farmers)
router.get('/transport/available', vendorCtrl.getAvailableTransport);

// ==================== VENDOR STORAGE ====================
// Add storage facility
router.post('/storage', authenticate, vendorCtrl.addVendorStorage);

// Get available storage (for farmers)
router.get('/storage/available', vendorCtrl.getAvailableStorage);

// ==================== TRANSPORT BOOKINGS ====================
// Create booking (farmer books vendor transport)
router.post('/bookings', authenticate, vendorCtrl.createTransportBooking);

// Get my bookings (farmer)
router.get('/my-bookings', authenticate, vendorCtrl.getMyBookings);

// Get vendor bookings
router.get('/vendor-bookings', authenticate, vendorCtrl.getVendorBookings);

// Update booking status (vendor)
router.put('/bookings/:id/status', authenticate, vendorCtrl.updateBookingStatus);

// ==================== VENDOR RATINGS ====================
// Rate a vendor
router.post('/ratings', authenticate, vendorCtrl.rateVendor);

// Get vendor ratings
router.get('/vendor/:vendor_id/ratings', vendorCtrl.getVendorRatings);

// ==================== VENDOR DEMAND ====================
// Add demand
router.post('/demand', authenticate, vendorCtrl.addVendorDemand);

// Get active demands
router.get('/demand/active', vendorCtrl.getActiveDemands);

// ==================== ANALYTICS ====================
// Get vendor analytics
router.get('/analytics', authenticate, vendorCtrl.getVendorAnalytics);

export default router;
