const path = require( 'path' )
const crypto = require( 'crypto' )
const bcrypt = require( 'bcryptjs' );
const User = require( '../models/user' );
const nodemailer = require( 'nodemailer' );
const sendgridTransport = require( 'nodemailer-sendgrid-transport' )
const { validationResult } = require( 'express-validator' );
const flash = require( 'express-flash' );
const Movie = require( '../models/movie' );
const sgMail = require('@sendgrid/mail');

// sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const transporter = nodemailer.createTransport(
    sendgridTransport( {
        auth: {
            api_key: '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'
        }
    } )
)

exports.getLogin = async( req,res ) =>{
    let message = flash( 'error' );
    if( message.length >0 ) {
        message = message[0]
    }
    else{
        message = null
    }
    res.render( 'auth/login',{
        path:'/login',
        pageTitle: 'Login',
        errorMeassage : message,
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    } )
}

exports.postLogin = async( req,res,next ) =>{
    const email = req.body.email;
    const password = req.body.password;

    const erros = validationResult( req );

    if( !erros.isEmpty() ) {
        return res.status( 422 ).render( 'auth/login' ,{
            path: 'login',
            pageTitle:'Login',
            errorMeassage: erros.array()[0].msg,

            oldInput:{
                email:email,
                password:password
            },
            validationErrors: erros.array()
        } )
    }

    try {
        const userLogin = await User.findOne( {email: email} );
        if( !userLogin ) {
            return res.status( 422 ).render( 'auth/login', {
                path: '/login',
                pageTitle: 'Login',
                errorMeassage: 'Invalid email or password.',
                oldInput: {
                    email: email,
                    password: password
                },
                validationErrors: [ ]
            } )
        }

        const checkPassword = await bcrypt.compare( password, userLogin.password )

        if ( checkPassword ) {
            req.session.isLoggedIn = true
            req.session.user = userLogin
            await req.session.save()
            res.redirect( '/' )
        } else {
            res.status( 422 ).render( 'auth/login', {
                path: '/login',
                pageTitle: 'Login',
                errorMeassage: 'Invalid email or password.',
                oldInput: {
                    email: email,
                    password: password
                },
                validationErrors: []
            } )
        }

    } catch ( error ) {
        console.log( error )
    }
}

exports.getRegister = async( req,res ) =>{
    let message = validationResult( req );
    if ( message.length > 0 ) {
        message = message[0]
    } else {
        message = null
    }
    res.render( 'auth/register', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMeassage: null,
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: []
    } )
}

exports.postRegister = async ( req,res ) =>{
    const email = req.body.email
    const password = req.body.password

    const errors = validationResult( req )
    if ( !errors.isEmpty() ) {
        return res.status( 422 ).render( 'auth/register', {
            path: '/auth/register',
            pageTitle: 'Signup',
            errorMeassage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password,
                confirmPassword: req.body.confirmPassword,
                roleUser: req.body.roleUser
            },
            validationErrors: errors.array()
        } )
    }

    try {
        const bcryptPassword = await bcrypt.hash( password, 12 )
        const user = new User( {
            email: email,
            password: bcryptPassword,
            role: 'user',
            cart: { items: [] }
        } )

        await user.save()
        res.redirect( '/auth/login' )

    } catch ( error ) {
        console.log( error )
    }
}

exports.getReset = async( req,res ) =>{

    try {
        res.render( 'auth/reset', {
            path: '/reset',
            pageTitle: 'Reset Password',
            errorMeassage: null,
            oldInput:{
                email: ''
            },
            type:'none'
        } )
    } catch ( error ) {
        console.log( error )
    }

}

exports.postReset = async( req,res ) =>{
    const email = req.body.email;
    const error = validationResult( req );
    if(!error.isEmpty()){
        return res.status(422).render('auth/reset',{
            errorMeassage: error.array()[0].msg,
            type:'error',
            oldInput:{
                email: email
            }
        })
    }

    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then((user) => {
                if (!user) {
                    return res.status(422).render('auth/reset',{
                        errorMeassage: `Can't find email detail !!!`,
                        type:'error',
                        oldInput:{
                            email: email
                        }
                    })
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then((result) => {
                const msg = {
                    to: email, 
                    subject: 'Password reset',
                    text: 'and easy to do anywhere, even with Node.js',
                    html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:8000/auth/new-password/${result.resetToken}">link</a> to set a new password.</p>
                    `,
                }
                let sentEmail = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'n19dcat016@student.ptithcm.edu.vn',
                        pass: 'n19dcat016#081100'
                    }
                });
        
                sentEmail.sendMail(msg,
                    (err, data) => {
                        if (err) {
                            console.log('error');
                        }
                        else {
                            console.log('Send email success!!!');
                            res.status(422).render('auth/reset',{
                                email: email,
                                errorMeassage: `Send Email success. Please check email to change password...`,
                                type:'success',
                                oldInput:{
                                    email: email
                                }
                            })
                        }
                    })
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    });

}

exports.getNewPassword = async ( req, res, next ) => {
    const token = req.params.token
    console.log(token);
    try {
        const userDetail = await User.findOne( {
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        } )
        if(!userDetail){
            return res.send('Permission denied!!!')
        }
        res.render( 'auth/newpassword', {
            path: '/new-password',
            pageTitle: 'New Password',
            errorMeassage: null,
            oldInput:{
                currentpassword: '',
                confirmPassword: ''
            },
            userId: userDetail._id.toString(),
            passwordToken: token
        } )
    } catch ( error ) {
        console.log( error )
    }
}

exports.postNewPassword = async ( req, res, next ) => {
    const newPassword = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render(`auth/newpassword`,{
            oldInput:{
                password: newPassword,
                confirmPassword: confirmPassword
            },
            errorMeassage: errors.array()[0].msg,
            userId: userId,
            passwordToken: passwordToken
        })
    }

    try {
        const userDetail = await User.findOne( {
            resetToken: passwordToken,
            resetTokenExpiration: { $gt: Date.now() },
            _id: userId
        } )

        const hashedPassword = await bcrypt.hash( newPassword, 12 )

        userDetail.password = hashedPassword
        userDetail.resetToken = undefined
        userDetail.resetTokenExpiration = undefined
        await userDetail.save()
        res.redirect( '/auth/login' )
    } catch ( error ) {
        console.log( error )
    }
}

exports.logOut = ( req,res ) =>{
    req.session.destroy( function( err ) {
        if( err ) {
            console.log( err );
        }
        res.redirect( '/' )
    } )
}

exports.getCart = async( req,res ) =>{
    const movieId = req.user._id
    
    try {
        const getAllCart =await req.user
            .populate( 'cart.items.movieId' )

        const listMovie = getAllCart.cart.items

        res.render( 'home/CartUser/index.ejs',{
            path:'/auth/cart',
            pageTitle:'Cart',
            listMovie: listMovie,
            modeEditUser: 0
        } )

        
    } catch ( error ) {
        console.log( error )
    }
}

exports.postCart = async( req,res ) =>{
    const movieId = req.body.objectId;

    try {
        const movieDetail = await Movie.findById( movieId );
        const addMovietoCart = await req.user.addToCart( movieDetail );

        res.redirect( `/film/${movieDetail.name}` )
    } catch ( error ) {
        console.log( error )
    }
}

exports.postDeleteMovieCart = async( req,res,next ) =>{
    const movieId = req.body.movieId;

    try {
        await req.user.removeFromCart( movieId );

        res.redirect( '/auth/cart' );
        console.log( 'Deleted movie in Cart' )
    } catch ( error ) {
        console.log( error )    
    }
}

// INFRO ACCOUNT USER
exports.getInforUser = async(req,res,next) =>{
    try {
        const emailUser = req.user.email
        const userDetail = await User.findOne({email: emailUser});
        const listPhimSapChieu = await Movie.find( { typeFilm: 'Phim-Sắp-Chiếu' } )
        .limit( 6 );

        res.render('home/CartUser/index.ejs',{
            pageTitle:'My ACCOUNT',
            user: userDetail,
            listPhimSapChieu: listPhimSapChieu,
            modeEditUser: 1,
        })
    } catch (error) {
        console.log(error);
    }
}

exports.getChangeMyAccount = async(req,res,next) =>{
    try {
        const userId = req.user._id
        const listPhimSapChieu = await Movie.find( { typeFilm: 'Phim-Sắp-Chiếu' } )
        .limit( 6 );
        const userDetail = await User.findById(userId)
        
        let message = flash( 'error' );
        if( message.length >0 ) {
            message = message[0]
        }
        else{
            message = null
        }

        res.render('home/CartUser/index.ejs',{
            pageTitle:'CHANGE MY ACCOUNT',
            user: userDetail,
            oldInput:{
                currentpassword:'',
                newpassword:''
            },

            listPhimSapChieu: listPhimSapChieu,
            modeEditUser: 2,
            errorMeassage:message,
            validationErrors:[],
        })
    } catch (error) {
        console.log(error);
    }
}

exports.putChangeMyAccount = async(req,res,next) =>{
    try {
        const currentPassword = req.body.currentpassword;
        const newPassword = req.body.newpassword;
        const userId = req.user._id;
        const listPhimSapChieu = await Movie.find( { typeFilm: 'Phim-Sắp-Chiếu' } )
        .limit( 6 );
        const userDetail = await User.findById(userId);
        const checkCurrentPassword =await bcrypt.compare(currentPassword,req.user.password)

        const errors = validationResult(req);

        if(!errors.isEmpty()){
            res.status(422).render('home/CartUser/index.ejs',{
                    pageTitle:'CHANGE MY ACCOUNT',
                    oldInput:{
                        currentpassword:req.body.currentpassword,
                        newpassword:req.body.newpassword
                    },
                    user: userDetail,
                    listPhimSapChieu: listPhimSapChieu,
                    modeEditUser: 2,
                    errorMeassage: errors.array()[0].msg,
                    type: 'error',
                    validationErrors: errors.array()
                })
        }

        else if(!checkCurrentPassword){
            res.status(422).render('home/CartUser/index.ejs',{
                pageTitle:'CHANGE MY ACCOUNT',
                oldInput:{
                    currentpassword:req.body.currentpassword,
                    newpassword:req.body.newpassword
                },
                user: userDetail,
                listPhimSapChieu: listPhimSapChieu,
                modeEditUser: 2,
                errorMeassage: 'Mật khẩu hiện tại không khớp !!!',
                type: 'error',
                validationErrors: []
            })
        }
        else{
            try {
            const bcryptPassword =await bcrypt.hash(newPassword,12)
            await User.updateOne({_id:userId},{email:userDetail.email,password: bcryptPassword})

            console.log(`Update infor of User ${userDetail.email} success!!!`);
            res.status(200).render('home/CartUser/index.ejs',{
                pageTitle:'CHANGE MY ACCOUNT',
                oldInput:{
                    currentpassword:'',
                    newpassword:''
                },
                user: userDetail,
                listPhimSapChieu: listPhimSapChieu,
                modeEditUser: 2,
                errorMeassage: 'Thay đổi thông tin thành công !!!',
                type: 'success',
                validationErrors: []
            })
        } catch (error) {
            console.log(error);
        }
    }
    } catch (error) {
        console.log(error);
    }
}

// END INFOR MY ACCOUNT
