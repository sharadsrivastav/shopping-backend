var express = require('express');
var router = express.Router();

const{getProductById, createProduct,getProduct, photo,updateProduct,deleteProduct,getAllProduct,getAllUniqueCategory} = require('../controllers/product');
const{isSignedIn,isAuthenticated,isAdmin} = require('../controllers/auth');
const{getUserById} = require('../controllers/user');
const { getAllCategory } = require('../controllers/category');

router.param("userId",getUserById);
router.param("productId",getProductById);


router.post("/product/create/:userId",isSignedIn,isAuthenticated,isAdmin,createProduct);

router.get("/product/:productId",getProduct);
router.get("/product/photo/:productId",photo);


router.delete("/product/:productId/:userId",isSignedIn,isAuthenticated,isAdmin, deleteProduct);
router.put("/product/:productId/:userId",isSignedIn,isAuthenticated,isAdmin,updateProduct);

router.get("/products",getAllProduct);
router.get("/products/categories",getAllUniqueCategory);


module.exports = router;