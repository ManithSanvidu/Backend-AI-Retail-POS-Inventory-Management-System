const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const systemEvents = require('../events/eventBus');

// 1. Load JSON File
const dataPath = path.join(__dirname, '../data/recommendations.json');
let recommendationsData = {};

const loadRecommendations = () => {
    try {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        recommendationsData = JSON.parse(rawData);
        console.log("✅ Recommendation engine loaded successfully");
        console.log(`   Sales recs: ${recommendationsData.salesRecommendations?.length || 0}`);
        console.log(`   Inventory recs: ${recommendationsData.inventoryRecommendations?.length || 0}`);
        console.log(`   Cross-sell pairs: ${recommendationsData.crossSellRecommendations?.length || 0}`);
        return true;
    } catch (error) {
        console.error("❌ Failed to load recommendations.json:", error.message);
        return false;
    }
};

// Initial load
loadRecommendations();

// Helper to format success response
const formatResponse = (data) => ({
    success: true,
    data,
    source: "trained-recommendation-engine"
});

// Helper to handle limits
const applyLimit = (array, limit) => {
    if (!array) return [];
    const limitNum = parseInt(limit) || 10;
    return array.slice(0, limitNum);
};

// 1. GET /api/recommendations/sales/top-products
router.get('/sales/top-products', (req, res) => {
    try {
        const data = applyLimit(recommendationsData.salesRecommendations, req.query.limit);
        res.json(formatResponse(data));
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. GET /api/recommendations/inventory/low-stock
router.get('/inventory/low-stock', (req, res) => {
    try {
        const data = applyLimit(recommendationsData.inventoryRecommendations, req.query.limit);
        res.json(formatResponse(data));
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. GET /api/recommendations/cross-sell/:productId
router.get('/cross-sell/:productId', (req, res) => {
    try {
        const productId = req.params.productId;
        const allCrossSell = recommendationsData.crossSellRecommendations || [];
        const filtered = allCrossSell.filter(item => item.productId === productId);
        res.json(formatResponse(applyLimit(filtered, req.query.limit)));
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. GET /api/recommendations/personalized/:customerId
router.get('/personalized/:customerId', (req, res) => {
    try {
        const customerId = req.params.customerId;
        const allPersonalized = recommendationsData.personalizedRecommendations || [];
        const filtered = allPersonalized.filter(item => item.customerId === customerId);
        res.json(formatResponse(applyLimit(filtered, req.query.limit)));
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. GET /api/recommendations/trending/products
router.get('/trending/products', (req, res) => {
    try {
        const data = applyLimit(recommendationsData.trendingProducts, req.query.limit);
        res.json(formatResponse(data));
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 6. GET /api/recommendations/customers/behavior
router.get('/customers/behavior', (req, res) => {
    try {
        const data = applyLimit(recommendationsData.customerBehavior, req.query.limit);
        res.json(formatResponse(data));
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 7. GET /api/recommendations/analytics/insights
router.get('/analytics/insights', (req, res) => {
    try {
        const data = recommendationsData.conversationalAnalytics || {};
        res.json(formatResponse(data));
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 8. POST /api/recommendations/refresh
router.post('/refresh', (req, res) => {
    try {
        const success = loadRecommendations();
        if (success) {
            // Trigger a notification that the model has been refreshed
            systemEvents.emit('SEND_ALERT', {
                target: { role: 'Manager' }, 
                category: 'SYSTEM',
                type: 'INFO',
                title: 'AI Recommendations Updated',
                message: 'The AI Recommendation Engine has been retrained with new sales and inventory data.',
                channels: ['in-app']
            });

            res.json({
                success: true,
                message: "Recommendation engine retrained and reloaded successfully",
                stats: {
                    salesRecs: recommendationsData.salesRecommendations?.length || 0,
                    inventoryRecs: recommendationsData.inventoryRecommendations?.length || 0,
                    crossSellPairs: recommendationsData.crossSellRecommendations?.length || 0
                }
            });
        } else {
            res.status(500).json({ success: false, error: "Failed to reload recommendations data" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
