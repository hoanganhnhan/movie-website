const homeRouter = require( './home' );
const authRouter = require( './auth' );
const adminRouter = require( './admin' );
const isAuth = require( '../middleware/is-auth' );
const checkRole = require( '../middleware/check-Role' )

function route( app ) {
    app.use( '/admin',isAuth,checkRole,adminRouter );

    app.use( '/auth',authRouter );
    
    app.use( '/',homeRouter );
}

module.exports = route;
