'use strict';

const jwt               = require('jsonwebtoken');
const config            = require('../config/config');

const { check, validationResult } = require('express-validator');

function AuthMiddleware(){};

/* Validate login request */
AuthMiddleware.prototype.registerRequestValidate = [
	check('email')
        .exists().withMessage('Email should not be empty')
        .trim(),
    function(req, res, next) { 
        const errorValidation = validationResult(req);
        if (!errorValidation.isEmpty()) {
            return res.status(422).json({
                title: 'an error occured',
                error: errorValidation.array()
            });
        }
        next()
    },
    check('password')
        .exists().withMessage('Password should not be empty')
        .isAlphanumeric().withMessage('Password should be alpanumeric')
        .isLength({min: 5 , max: 50}).withMessage('Password should not be empty, should be more than one and less than 50 character')
        .trim(),
    function(req, res, next) {
        const errorValidation = validationResult(req);
        if (!errorValidation.isEmpty()) {
            return res.status(422).json({
                title: 'an error occured',
                error: errorValidation.array()
            });
        }
        next()
    }
];

AuthMiddleware.prototype.htmlHeader = function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('content-type', 'text/html');
    next();
};

AuthMiddleware.prototype.jsonHeader = function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('content-type', 'application/json');
    next();
};

AuthMiddleware.prototype.verifyTokenAuth = function (req, res, next) {
    const data = {
        success: false, 
        msg: 'Authentication failed. Token expired or wrong token!.'
    };

    if(req.headers.authorization){
        jwt.verify(req.headers.authorization, config.secret, function(err, decoded){
            if(err){
                res.json(data);
            } else {
                data.success = true;
                data.DECODEDTOKEN = decoded;
                data.msg = '';

                return next(null, data);
            }
        });        
    } else {
        res.json(data);
    }
};

module.exports = AuthMiddleware;