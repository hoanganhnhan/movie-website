const path = require( 'path' );
const express =require( 'express' );
const adminController = require( '../controller/admin' );
const {check } = require( 'express-validator' );
const isAuth = require( '../middleware/is-auth' );
const checkRole = require( '../middleware/check-Role' )

const router = express.Router();

router.get( '/',adminController.getIndex );

// CRUD USER
router.get( '/get-all-user/:id',adminController.getEditUser );


router.get( '/get-all-user',adminController.getAllUser );

router.post( '/edit-user',
    [
        check( 'email' )
            .isEmail()
            .withMessage( 'Please enter a valid email address.' )
            .normalizeEmail(),
        check( 'password','Please enter your password' )
            .exists()
            .isLength( { min: 5 } )
            .isAlphanumeric()
            .trim()
    ]
    ,adminController.postEditUser );

router.get( '/add-user',adminController.getAddUser );

router.post( '/add-user',
    [
        check( 'email' )
            .isEmail()
            .withMessage( 'Please enter a valid email.' )
            .normalizeEmail(),
        check( 'password','Please enter your password' )
            .exists()
            .isLength( { min: 5 } )
            .isAlphanumeric()
            .trim(),
        check( 'confirmPassword','Please enter a confirm password  .' )
            .exists()
            .isLength( { min: 5 } )
            .custom( ( value, { req } ) => {
                if ( value !== req.body.password ) {
                    throw new Error( 'Passwords have to match!' );
                }
                return true;
            } )
            .trim()
    ]
    ,adminController.postAddUser );

router.post( '/delete-user',adminController.deleteUser );

router.post( '/search-user' ,adminController.searchUser ); 


// CRUD MOVIE
router.get( '/get-all-movie',adminController.getAllMovie );

router.get( '/get-all-movie/:id',adminController.getEditMovie );

router.put( '/edit-movie',
    [
        check( 'name','This username must me 5+ characters long' )
            .exists()
            .isLength( {min:5} )
            .trim(),
        check( 'description','This description must me 5+ characters long' )
            .exists()
            .isLength( {min:5} )
            .trim(),
        check( 'director','This director must me 5+ characters long'  )
            .exists()
            .isString().isLength( {min:5} )
            .trim(),
        check( 'character','This character must me 5+ characters long'  )
            .exists()
            .isString()
            .isLength( {min:5} )
            .trim(),
        check( 'national','This national must me 5+ characters long'  )
            .exists()
            .isString()
            .isLength( {min:5} )
            .trim(),
        check( 'producer','This producer must me 5+ characters long'  )
            .exists()
            .isString()
            .isLength( {min:5} )
            .trim()
    ],
    adminController.postEditMovie )

router.get( '/add-movie',adminController.getAddMovies );

router.post( '/add-movie',
    [
        check( 'name','This username must me 5+ characters long' )
            .exists()
            .isLength( {min:5} )
            .trim(),
        check( 'director','This director must me 5+ characters long'  )
            .exists()
            .isString().isLength( {min:5} )
            .trim(),
        check( 'character','This character must me 5+ characters long'  )
            .exists()
            .isString()
            .isLength( {min:5} )
            .trim(),
        check( 'national','This national must me 5+ characters long'  )
            .exists()
            .isString()
            .isLength( {min:5} )
            .trim(),
        check( 'producer','This producer must me 5+ characters long'  )
            .exists()
            .isString()
            .isLength( {min:5} )
            .trim()
    ],
    adminController.postAddMovies 
);

router.post( '/delete-movie',adminController.deleteMovie );

router.post( '/search-movie',adminController.searchMovie );


// CRUD EPISODE O MOVIE
router.get( '/:id/get-all-episode',adminController.editEpisode );

router.get( '/:id/add-episode',adminController.getAddEpisode );

router.post( '/:id/add-episode',[
    check( 'movieurl','This Movie Url must me 10+ characters long' )
        .exists()
        .isLength( {min:10,max:500} )
        .trim()
]
,adminController.postAddEpisode );

router.post( '/:id/delete-episode',adminController.postDeleteEpisode );

router.get( '/:idmovie/edit-episode', adminController.getEditEpisode );

router.post( '/:idmovie/edit-episode',[
    check( 'episode','This Episode must is Number' )
        .exists()
        .isNumeric()
        .trim(),
    check( 'movieurl','This Movie Url must me 10+ characters long' )
        .exists()
        .isLength( {min:10,max:500} )
        .trim()
]
,adminController.postEditEpisode );


// CRUD COMMENT OF MOVIE
router.get('/:id/get-all-comment',adminController.getAllComment);
router.post('/:id/delete-comment',adminController.postDeleteComment);
module.exports = router;