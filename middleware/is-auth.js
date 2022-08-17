module.exports = ( req,res,next ) =>{
    res.setHeader( 'Content-Type', 'text/html' );
    if( !req.session.isLoggedIn ) {
        res.redirect( '/auth/login' )
    }
    else{

        next()
    }
}