var express = require('express');
var router = express.Router();

const{getUserById,pushOrderInPurchaseList }= require("../controllers/user")
const{isSignedIn,isAdmin,isAuthenticated}= require("../controllers/auth")
const{updateStock} = require('../controllers/product');
const{getOrderById, createOrder,getAllOrder,updateStatus,getOrderStatus}= require('../controllers/order');

//params
router.param("/userId",getUserById);
router.param("/orderId",getOrderById);


//actual routes
router.post("/order/create/:userId",isSignedIn,isAuthenticated,pushOrderInPurchaseList,updateStock,createOrder);
router.get("/order/all/:userId",isSignedIn,isAuthenticated,isAdmin,getAllOrder);

router.get("/order/status/:userId",isSignedIn,isAuthenticated,isAdmin,getOrderStatus);
router.put("/order/:orderId/status/:userId",isSignedIn,isAuthenticated,isAdmin,updateStatus);

module.exports = router;