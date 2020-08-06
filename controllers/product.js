const Product = require('../models/product');
const formidable = require('formidable');
 const _ = require('lodash');
const fs = require('fs');
const product = require('../models/product');
const { error } = require('console');
const category = require('../models/category');


exports.getProductById = (req,res,next,id) =>{
    Product.findById(id)
    .populate("category")
    .exec((err,product) => {
        if(err){
            return res.status(400).json({
                error : "product not found"
            });
        }
        req.product = product;
        next();
    });

};

exports.createProduct = (req,res) =>{
    let form = new formidable.IncomingForm();
    form.keepExtensions= true;

    form.parse(req, (err, fields, file) =>{
        if(err){
            return res.status(400).json({
                error: "problem with image"
            });
        }

        const{name,description,price,category,stock}= fields;

        if(!name || !description || !price || !category || !stock){
            return res.status(400).json({
                error: "All fields are necessary"
            });
        }

        let product = new Product(fields);

        if(file.photo){
            if(file.photo.size> 3000000){
                return res.status(400).json({
                    error: "file is too big"
                });
            }
            product.photo.data = fs.readFileSync(file.photo.path);
            product.photo.contentType = file.photo.type;

            product.save((err,product)=>{
                if(err){
                    return res.status(400).json({
                        error: "saving product in DB failed"
                    });
                }
                res.json(product);
            });
        }

    });
};

exports.getProduct = (req,res) =>{
    req.product.photo = undefined;
    return res.json(req.product);
};

exports.photo = (req,res,next) =>{
    if(req.product.photo.data){
        res.set("contentType",req.product.photo.contentType);
        return res.send(req.product.photo.data);

    }
    next();
};

exports.deleteProduct = (req,res) =>{
    let product = req.product;
    product.remove((err,deletedProduct)=>{
        if(err){
            return res.status(400).json({
                error: "failed to delete the product"
            });
        }
        res.json({
            message : "deletion successful",
            deletedProduct
        });
    });
};

exports.updateProduct = (req,res) =>{
    let form = new formidable.IncomingForm();
    form.keepExtensions= true;

    form.parse(req, (err, fields, file) =>{
        if(err){
            return res.status(400).json({
                error: "problem with image"
            });
        }

        let product = req.product;
        product = _.extend(product,fields);

        if(file.photo){
            if(file.photo.size> 3000000){
                return res.status(400).json({
                    error: "file is too big"
                });
            }
            product.photo.data = fs.readFileSync(file.photo.path);
            product.photo.contentType = file.photo.type;

            product.save((err,product)=>{
                if(err){
                    return res.status(400).json({
                        error: "updation of product failed"
                    });
                }
                res.json(product);
            });
        }

    });
}

exports.getAllProduct = (req,res) =>{
    let limit = req.query.limit ? parseInt( req.query.limit) :8;
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";



    Product.find()
    .select("-photo")
    .populate("category")
    .limit(limit)
    .sort([[sortBy,"asc"]])
    .exec((err,products) =>{
        if(err){
        return res.status(400).json({
            error: "no product found"
        });
    }
    res.json(products);
    })
}

exports.getAllUniqueCategory = (req,res) =>{
    Product.distinct("category",{},(err,category) =>{
        if(err){
            return res.status(400).json({
                error: "no category found"
            });
        }
        res.json(category);
    });
};

exports.updateStock = (req,res) =>{
    let myOperations = req.body.order.product.map(prod =>{
        return {
            updateOne :{
                filter : {_id:prod._id},
                update : {$inc: {stock : -prod.count, sold: +prod.count}}
            }
        }
    });
    Product.bulkWrite(myOperations,{},(err,product)=>{
        if(err){
            return res.status(400).json({
                error: "Bulk operation failed"
            });
        }
        next();
    });
};
