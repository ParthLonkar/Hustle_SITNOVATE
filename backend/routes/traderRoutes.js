import express from 'express';
import * as traderCtrl from '../controllers/traderController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ==================== TRADER PROFILE ====================
router.post('/profile', authMiddleware, traderCtrl.saveTraderProfile);
router.get('/profile', authMiddleware, traderCtrl.getMyTraderProfile);

// ==================== DEMANDS ====================
router.post('/demands', authMiddleware, traderCtrl.createTraderDemand);
router.get('/demands', authMiddleware, traderCtrl.getMyDemands);
router.get('/demands/active', traderCtrl.getActiveDemands);

// ==================== PRICE OFFERS ====================
router.post('/offers', authMiddleware, traderCtrl.createPriceOffer);
router.get('/offers', authMiddleware, traderCtrl.getMyPriceOffers);

// ==================== SUPPLY ====================
router.get('/supply', authMiddleware, traderCtrl.getAggregatedSupply);

// ==================== PRICE TRENDS ====================
router.get('/price-trends', authMiddleware, traderCtrl.getPriceTrends);
router.get('/price-trends/summary', authMiddleware, traderCtrl.getPriceTrendsSummary);

// ==================== CROP ARRIVALS ====================
router.get('/arrivals', authMiddleware, traderCtrl.getCropArrivals);

// ==================== PROCUREMENT PLANNING ====================
router.post('/procurement', authMiddleware, traderCtrl.createProcurementPlan);
router.get('/procurement', authMiddleware, traderCtrl.getMyProcurementPlans);

// ==================== LOGISTICS ====================
router.post('/logistics', authMiddleware, traderCtrl.createLogisticsPlan);
router.get('/logistics', authMiddleware, traderCtrl.getMyLogisticsPlans);

// ==================== ALERTS ====================
router.get('/alerts', authMiddleware, traderCtrl.getMyAlerts);
router.put('/alerts/:id/read', authMiddleware, traderCtrl.markAlertRead);

// ==================== ANALYTICS ====================
router.get('/dashboard', authMiddleware, traderCtrl.getTraderDashboard);
router.get('/mandi-prices', authMiddleware, traderCtrl.getMandiPrices);
router.get('/spoilage-risk', authMiddleware, traderCtrl.getSpoilageRiskByRegion);

export default router;
