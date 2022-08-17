const path = require( 'path' )
const express = require( 'express' )
const mongoose = require( 'mongoose' )
const {check } = require( 'express-validator' );
const authController = require( '../controller/auth' );
const User = require( '../models/user' )
const route = express.Router()
const isLogin = require( '../middleware/is-auth' );

route.get( '/login',authController.getLogin );

route.post( '/login',
    [
        check( 'email' )
            .isEmail()
            .withMessage( 'Please enter a valid email address.' )
            .normalizeEmail(),
        check( 'password' , 'Please enter your password.' )
            .exists()
            .isLength( { min: 5 } )
            .isAlphanumeric()
            .trim()
    ],
    authController.postLogin 
)

route.get( '/register',authController.getRegister );

route.post( '/register',
    [
        check( 'email' )
            .isEmail()
            .withMessage( 'Please enter a valid email.' )
            .custom( ( value, { req } ) => {
                return User.findOne( { email: value } ).then( userDoc => {
                    if ( userDoc ) {
                        return Promise.reject(
                            'E-Mail exists already, please pick a different one.'
                        );
                    }
                } );
            } )
            .normalizeEmail(),
        check(
            'password',
            'Please enter a password with only numbers and text and at least 5 characters.' )
            .isLength( { min: 5 } )
            .isAlphanumeric()
            .trim(),
        check(
                'confirmPassword',
                'Please enter a confirmPassword with only numbers and text and at least 5 characters.' )
                .isLength( { min: 5 } )
                .isAlphanumeric()
                .trim(),
        check( 'confirmPassword' )
            .trim()
            .custom( ( value, { req } ) => {
                if ( value !== req.body.password ) {
                    throw new Error( 'Passwords have to match!' );
                }
                return true;
            } )
    ]
    ,authController.postRegister );

route.get( '/reset',authController.getReset );

route.post( '/reset',
[
    check( 'email' )
    .isEmail()
    .withMessage( 'Please enter a valid email.' )
    .custom( ( value, { req } ) => {
        return User.findOne( { email: value } ).then( userDoc => {
            if ( !userDoc ) {
                return Promise.reject(
                    'E-Mail not exists already, please pick a different one.'
                );
            }
        } );
    } )
    .normalizeEmail(),
]
,authController.postReset );

route.get( '/new-password/:token',authController.getNewPassword );

route.post( '/new-password',
[
    check( 'password','This password must me 5+ characters long' )
        .exists()
        .isLength( {min:5} )
        .trim(),
    check( 'confirmPassword','This confirmPassword must me 5+ characters long' )
        .exists()
        .isLength( {min:5} )
        .trim(),
    check( 'confirmPassword' )
        .trim()
        .custom( ( value, { req } ) => {
            if ( value !== req.body.password ) {
                throw new Error( 'Passwords have to match!' );
            }
            return true;
        } )
        
]
,authController.postNewPassword );

route.get( '/logout',authController.logOut );

route.get( '/cart',isLogin,authController.getCart );

route.post( '/cart',isLogin,authController.postCart );

route.post( '/cart-delete',isLogin,authController.postDeleteMovieCart )

// INFOR account User

route.get('/my-account',authController.getInforUser)

route.get('/change-myaccount', authController.getChangeMyAccount)

route.put( '/change-myaccount',
    [
        check( 'currentpassword','This currentpassword must me 5+ characters long' )
            .exists()
            .isLength( {min:5} )
            .trim(),
        check( 'newpassword','This newpassword must me 5+ characters long' )
            .exists()
            .isLength( {min:5} )
            .trim()
            
    ],
    authController.putChangeMyAccount )

module.exports = route;