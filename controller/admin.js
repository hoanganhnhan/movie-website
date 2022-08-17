const mongoose = require( 'mongoose' )

const { validationResult } = require( 'express-validator' )
const bcrypt = require( 'bcryptjs' );
const path = require( 'path' );
const Movie = require( '../models/movie' )
const User = require( '../models/user' )

// USER
exports.getIndex = async( req,res ) =>{
    try {
        const listUser = await ( await User.find() ).length;
        
        const listMovie = await ( await Movie.find() ).length;
        
        const listCart = await User.find();
        
        let quantityCart =0;
        for ( let cart of listCart ) {
            quantityCart = quantityCart + cart.cart.items.length;
        }

        res.render( 'admin/AdminHome/DashBoardHome/dashboardhome.ejs' ,{
            quantityUser: listUser,
            quantityMovie: listMovie,
            quantityCart: quantityCart
        } )
    } catch ( error ) {
        console.log( error );
    }
}

exports.getAllUser = async( req,res ) =>{
    try {
        const getAllUser = await User.find();
        res.render( 'admin/AdminHome/index.ejs',{
            path:'/admin/get-all-user',
            pageTitle:'U S E R',
            isMoviePage: false,
            users: getAllUser
        } )

    } catch ( error ) {
        console.log( error );
    }
}
exports.getEditUser = async( req,res ) =>{
    try {
        const editMode = req.query.edit;
        if( !editMode ) {
            res.redirect( '/' );
        }

        const userId = req.params.id;
        const userDetail =await User.findById( userId );
        
        if( !userDetail ) {
            res.redirect( '/' );
        }
        res.render( 'admin/EditUserHome/index.ejs',{
            pageTitle:`U S E R : ${userDetail.email}`,
            path:'/admin/get-all-user',
            user: userDetail,
            userId: userDetail._id,
            editing: editMode,
            hashError: false,
            errorMeassage:null,
            oldInput: {
                email: userDetail.email,
                password: ''
            },
            validationErrors: []
        } )
        
    } catch ( error ) {
        console.log( error );
    }
}

exports.postEditUser = async( req,res ) =>{
    const email = req.body.email;
    const password = req.body.password;
    const userId =req.body.userId;
    const error = validationResult( req );

    const userReal = await User.findById( userId );
    const userDetail =await User.findOne( {email: email} );

    if( !error.isEmpty() ) {
        return res.status( 422 ).render( 'admin/EditUserHome/index.ejs' ,{
            user: userDetail,
            userId: userId,
            path: '',
            pageTitle:`U S E R : ${userReal.email}`,
            errorMeassage: error.array()[0].msg,
            editing: true,
            hashError: true,
            oldInput:{
                email:email,
                password:password
            },
            validationErrors: error.array()
        } )
    }

    
    if( !userDetail ) {
        return res.status( 422 ).render( 'admin/EditUserHome/index.ejs', {
            userId: userId,
            path: '',
            pageTitle: `U S E R : ${userReal.email}`,
            errorMeassage: 'Can not find User.',
            editing: true,
            hashError: true,
            oldInput: {
                email: '',
                password: password
            },
            validationErrors: [ ]
        } )
    }

    if( userDetail.email !== userReal.email ) {
        return res.status( 422 ).render( 'admin/EditUserHome/index.ejs', {
            userId: userId,
            path: '',
            pageTitle: `U S E R : ${userReal.email}`,
            errorMeassage: 'E-mail input not match email of this User!',
            editing: true,
            hashError: true,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: [ ]
        } )
    }


    try {
        const bcryptPassword = await bcrypt.hash( password, 12 );

        userDetail.email = email;
        userDetail.password= bcryptPassword;
        await userDetail.save();
        console.log( 'UPDATED USER' );
        res.redirect( '/admin/get-all-user' )
    } catch ( error ) {
        console.log( error );
    }


}

exports.deleteUser = async( req,res ) =>{
    try {
        const userId = req.body.objectId;

        await User.deleteOne( {_id: userId} );
        res.redirect( '/admin/get-all-user' );

        console.log( 'DELETED USER SUCCESS !' )
    } catch ( error ) {
        console.log( error );
    }
}


exports.getAddUser = async( req,res ) =>{


    try {
        res.render( 'admin/EditUserHome/index.ejs' ,{
            pageTitle:'ADD U S E R',
            path:'/add-user',
            errorMeassage:null,
            editing:false,
            hasError: false,
            oldInput:{
                email:'',
                password:'',
                retypepassword: ''
            },
            validationErrors:[]
        } )
    } catch ( error ) {
        console.log( error )
    }
}

exports.postAddUser = async( req,res ) =>{
    const email = req.body.email;
    const password =req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const error = validationResult( req );

    const userDetail = await User.findOne( {email: email} );
    if( !error.isEmpty() ) {
        return res.status( 422 ).render( 'admin/EditUserHome/index.ejs',{
            pageTitle:'ADD U S E R',
            path: '/add-user',
            editing: false,
            hasError: false,
            errorMeassage:error.array()[0].msg,
            oldInput:{
                email: email,
                password: password,
                confirmPassword: confirmPassword
            },
            validationErrors: error.array()
        } )
    }  

    if( userDetail ) {
        return res.status( 422 ).render( 'admin/EditUserHome/index.ejs',{
            pageTitle:'ADD U S E R',
            path: '/add-user',
            editing: false,
            hasError: false,
            errorMeassage:'E-Mail exists already, please pick a different one.',
            oldInput:{
                email: email,
                password: password,
                confirmPassword: confirmPassword
            },
            validationErrors: error.array()
        } )
    }


    try {
        const bcryptPassword = await bcrypt.hash( password,12 );
        const user = new User( {
            email: email,
            password: bcryptPassword
        } )
        await user.save();

        res.redirect( '/admin/get-all-user' );
        console.log( 'CREATED USER SUCCESS !' );
        
    } catch ( error ) {
        console.log( error )
    }

}

exports.searchUser = async( req,res ) =>{
    try {
        const keywordSearch = req.body.keywordSearch;
        const listUser = await User.find();

        const listUserDetail = listUser.filter( value =>{
            return value.email.toUpperCase().includes( keywordSearch.toUpperCase() )
        } )

        res.render( 'admin/AdminHome/index.ejs',{
            isMoviePage: false,
            path:'/admin/search-user',
            pageTitle:'SEARCH U S E R',
            users: listUserDetail
        } )
    } catch ( error ) {
        console.log( error )
    }
}


// MOVIE 

exports.getAllMovie = async( req,res ) =>{
    try {
        const listMovieDetail = await Movie.find();

        res.render( 'admin/AdminHome/index.ejs',{
            pageTitle:'M O V I E S',
            path:'admin/get-all-movie',
            isMoviePage: true,
            movies: listMovieDetail
        } )

    } catch ( error ) {
        console.log( error );
    }
}


exports.searchMovie = async( req,res ) =>{
    
    try {
        const keywordSearch = req.body.keywordSearch;
        const listMovie = await Movie.find();
        const listNameDetail = listMovie.filter( value =>{
            return (value.name.toUpperCase().includes( keywordSearch.toUpperCase() ) || value.typeFilm.toUpperCase().includes( keywordSearch.toUpperCase() ))
        } )
        res.render( 'admin/AdminHome/index.ejs',{
            path:'/admin/search-movie',
            isMoviePage: true,
            pageTitle:'SEARCH M O V I E',
            movies: listNameDetail
        } )
    } catch ( error ) {
        console.log( error );
    }
}

exports.getAddMovies = async ( req,res ) =>{
    res.render( 'admin/EditMovieHome/index.ejs',{
        pageTitle: 'ADD M O V I E',
        path:'/admin/edit-movie',
        editing:false,
        hasError: false,
        isEpisodeHome: false,
        oldInput: {
            name:'',
            description: '',
            director: '',
            character: '',
            national: '',
            producer: '',
            typeFilm: ''
        },
        errorMeassage: null,
        validationErrors:[]
    } );
}

exports.postAddMovies =async ( req,res ) =>{

    const name = req.body.name;
    const images = req.file;
    const description = req.body.description;
    const character = req.body.character;
    const director = req.body.director;
    const national = req.body.national;
    const producer = req.body.producer;
    const typeFilm = req.body.typeFilm;
    
    const typeFilmArray = ['Phim-Bộ',
    'Phim Thuyết Minh',
    'Phim Sắp Chiếu',
    'Hoạt Hình',
    'Phim Lẻ',
    'Cổ Trang-Thần Thoại',
    'Khoa Học-Viễn Tưởng',
    'Thể Thao-Âm Nhạc',
    'Bí Ẩn-Siêu Nhân',
    'Võ Thuật-Kiếm Kiệp',
    'Hình Sự-Chiến Tranh',
    'Thuyết Minh',
    'Phiêu Lưu-Hành Động',
    'Tài Liệu-Hành Động',
    'Gia Đình-Học Đường',
    'Việt Nam',
    'Trung Quốc',
    'Âu Mỹ',
    'Đài Loan',
    'Hàn Quốc',
    'Nhật Bản',
    'Thái Lan',
    'Ấn Độ',
    'Hồng Kong',
    'Canada',
    'Phim Mới',
    'Phim Lẻ',
    'Phim Bộ',
    'TV Show',
    'Phim Chiếu Rạp']
                            
    const checkTypeFilm = typeFilmArray.includes( typeFilm );
    const errors = validationResult( req )


    if( !errors.isEmpty() ) {
        return res.status( 422 ).render( 'admin/EditMovieHome/index.ejs',{
            pageTitle: 'ADD M O V I E ',
            path: 'admin/add-movie',
            editing: false,
            hasError: true,
            isEpisodeHome: false,
            errorMeassage: errors.array()[0].msg,
            oldInput: {
                name:name,
                description: description,
                director: director,
                character: character,
                national: national,
                producer: producer,
                typeFilm: typeFilm
            },
            validationErrors: errors.array()
        } )
    }

    // if( checkTypeFilm === false ) {
    //     return res.status( 422 ).render( 'admin/EditMovieHome/index.ejs',{
    //         pageTitle: 'Add Movie',
    //         path: 'admin/add-movie',
    //         editing: false,
    //         hasError: true,
    //         isEpisodeHome: false,
    //         errorMeassage: 'Type Film không hợp lệ, vd : [Phim-Bộ, Phim-Thuyết-Minh, Phim-Sắp-Chiếu...',
    //         oldInput: {
    //             name:name,
    //             description: description,
    //             director: director,
    //             character: character,
    //             national: national,
    //             producer: producer,
    //             typeFilm: typeFilm
    //         },
    //         validationErrors: errors.array()
    //     } )
    // }

    if( !images ) {
        return res.status( 422 ).render( 'admin/EditMovieHome/index.ejs',{
            pageTitle: 'Add Movie',
            path: 'admin/add-movie',
            editing: false,
            hasError: true,
            isEpisodeHome: false,
            errorMeassage: 'Attached file is not an image.',
            oldInput: {
                name:name,
                description: description,
                director: director,
                character: character,
                national: national,
                producer: producer,
                typeFilm: typeFilm
            },
            validationErrors: errors.array()
        } )
    }

    try {
        const imageUrl = images.path;
        const movie =await new Movie( {
            name: name,
            description: description,
            director: director,
            character: character,
            national: national,
            producer: producer,
            imageUrl:imageUrl,
            typeFilm: typeFilm,
            userId: req.user
        } )
        await movie.save();
        res.redirect( '/admin/get-all-movie' )
        console.log( 'Created Movie success' );

    } catch ( error ) {
        console.log( error )
    }
    
}


exports.getEditMovie = async ( req,res ) =>{
    try {
        const modeEdit = req.query.edit;
        const movieId = req.params.id;
        const movieDetail =await Movie.findById( movieId );

        if( !modeEdit ) {
            res.redirect( '/admin/get-all-movie' );
        }
        if( !movieDetail ) {
            res.redirect( '/admin/get-all-movie' );
        }

        res.render( 'admin/EditMovieHome/index.ejs',{
            pageTitle:`M O V I E: ${movieDetail.name}`,
            path:'/admin/get-all-movie',
            movie: movieDetail,
            movieId: movieDetail._id,
            editing: modeEdit,
            hashError: false,
            isEpisodeHome: false,
            errorMeassage: null,
            oldInput:{
                name:  movieDetail.name,
                director:  movieDetail.director,
                character:  movieDetail.character,
                national:  movieDetail.national,
                producer:  movieDetail.producer,
                description:  movieDetail.description,
                imageUrl:  movieDetail.imageUrl,
                typeFilm:  movieDetail.typeFilm
            },
            validationErrors: []
        } )           
    } catch ( error ) {
        console.log( error );
    }
}

exports.postEditMovie = async( req,res,next ) =>{
    try {
        const name = req.body.name;
        const movieId = req.body.movieId;
        const director = req.body.director;
        const character = req.body.character;
        const national = req.body.national;
        const producer = req.body.producer;
        const description = req.body.description;
        const image = req.file;
        const typeFilm = req.body.typeFilm;

        const error = validationResult( req );

        if( !error.isEmpty() ) {
            return res.status( 422 ).render( 'admin/EditMovieHome/index.ejs' ,{
                movieId: movieId,
                path: '',
                pageTitle:`M O V I E : ${name}`,
                errorMeassage: error.array()[0].msg,
                editing: true,
                hashError: true,
                isEpisodeHome: false,
                oldInput:{
                    name:  name,
                    director:  director,
                    character:  character,
                    national:  national,
                    producer:  producer,
                    description:  description,
                    imageUrl:  image,
                    typeFilm:  typeFilm
                },
                validationErrors: error.array()
            } )
        }

        if( !image ) {
            return res.status( 422 ).render( 'admin/EditMovieHome/index.ejs' ,{
                movieId: movieId,
                path: '',
                pageTitle:`M O V I E : ${name}`,
                errorMeassage: 'Attached file is not an image.',
                editing: true,
                hashError: true,
                isEpisodeHome: false,
                oldInput:{
                    name:  name,
                    director:  director,
                    character:  character,
                    national:  national,
                    producer:  producer,
                    description:  description,
                    imageUrl:  image,
                    typeFilm:  typeFilm
                },
                validationErrors: error.array()
            } )
        }

        try {
            const imageUrl = image.path;
            const newMovie =await new Movie( {
                id: movieId,
                name: name,
                imageUrl:imageUrl,
                director: director,
                character: character,
                national: national,
                producer: producer,
                description: description,
                typeFilm: typeFilm,
                userId: req.user
            } )

            await Movie.updateOne( { _id: movieId } , {
                id: movieId,
                name: name,
                imageUrl:imageUrl,
                director: director,
                character: character,
                national: national,
                producer: producer,
                description: description,
                typeFilm: typeFilm,
                userId: req.user
            });

            res.redirect( '/admin/get-all-movie' );
            console.log( 'EDIT MOVIE SUCCESS !' );
        } catch ( error ) {
            console.log( error );
        }
        
    } catch ( error ) {
        console.log( error );
    }
}

exports.deleteMovie = async( req,res,next ) =>{
    try {
        const movieId = req.body.objectId;

        await Movie.deleteOne( {_id: movieId} );
        res.redirect( '/admin/get-all-movie' );

        console.log( 'DELETED MOIVE SUCCESS !' )
    } catch ( error ) {
        console.log( error );
    }
}

exports.editEpisode = async( req,res,next ) =>{
    try {
        const editMode = req.query.edit;
        const movieId = req.params.id;
        const movieDetail = await Movie.findById( movieId );

        const listEpisode = movieDetail.listEpisode.sort( ( a,b ) =>{
            return a.episode - b.episode;
        } )

        res.render( 'admin/EditMovieHome/index.ejs' ,{
            pageTitle: `MOVIE ${movieDetail.name}`,
            path:'/admin/editEpisode',
            editing: true,
            isEpisodeHome: true,
            listEpisode: listEpisode,
            movie: movieDetail,
            movieId: movieDetail._id
        } );
    } catch ( error ) {
        console.log( error );
    }
}

exports.getAddEpisode = async( req,res,nex ) =>{
    try {
        const movieUrl = req.body.movieUrl;
        
        const movieId = req.params.id;
        const movieDetail = await Movie.findById( movieId );
            
        res.render( 'admin/EditMovieHome/EpisodeHome/EditEpisode/editepisode.ejs',{
            pageTitle:`ADD EPISODE OF MOVIE: ${movieDetail.name}`,
            path:'',
            movie: movieDetail,
            addEpisodeMode: true,
            editing: false,
            errorMeassage:null,
            oldInput:{
                movieUrl: movieDetail.listEpisode.movieUrl
            },
            validationErrors:[]
        } )
        
    } catch ( error ) {
        console.log( error );
    }
}

exports.postAddEpisode =async ( req,res, next ) =>{
    
    
    try {
        const movieUrl = req.body.movieurl;
        const movieId = req.params.id;
        const movieDetail =await Movie.findById( movieId );
    
        const error = validationResult( req );
        if( !error.isEmpty() ) {
            return res.status( 422 ).render( 'admin/EditMovieHome/EpisodeHome/EditEpisode/editepisode.ejs',{
                pageTitle:`ADD EPISODE OF MOVIE: ${movieDetail.name}`,
                path:'',
                movie: movieDetail,
                addEpisodeMode: true,
                editing: false,
                errorMeassage: error.array()[0].msg,
                oldInput:{
                    movieUrl: movieUrl
                },
                validationErrors:error.array()
            } )
        }

        await movieDetail.addEpisode( movieUrl );

        res.redirect( `/admin/${movieDetail._id}/get-all-episode?edit=true` );
        console.log( 'ADD EPISODE SUCCESS !' );

    } catch ( error ) {
        console.log( error );
        
    }
}

exports.getEditEpisode = async( req,res ) =>{
    try {
        const episodeId = req.query.edit;
        const movieId = req.params.idmovie;
        const listMovie = await Movie.find();
        
        const movieDetail = await Movie.findById( movieId );
        const listEpisode = movieDetail.listEpisode;
        
        const episodeDetail = listEpisode.filter( ( valude,index ) =>{
            return valude._id.toString() === episodeId.toString()
        } )[0];

        
        res.render( 'admin/EditMovieHome/EpisodeHome/EditEpisode/editepisode.ejs',{
            pageTitle:`MOVIE ${movieDetail.name} - EPISODE ${episodeDetail.episode}`,
            path:'',
            episodeId: episodeId,
            movie: movieDetail,
            editing: true,
            addEpisodeMode: false,
            errorMeassage:null,
            oldInput:{
                episode: episodeDetail.episode,
                movieUrl: episodeDetail.movieUrl
            },
            validationErrors:[]
        } );
    } catch ( error ) {
        console.log( error );
    }
}

exports.postEditEpisode = async( req,res,next ) =>{
    try {
        const episode =req.body.episode;
        const movieUrl = req.body.movieurl;

        const episodeId = req.body.episodeId;
        const movieId = req.params.idmovie;

        const movieDetail = await Movie.findById( movieId );
        const listEpisode = movieDetail.listEpisode;

        const error = validationResult( req );

        const episodeDetail = listEpisode.filter( ( valude,index ) =>{
            return {
                value: valude._id.toString() === episodeId.toString()
            }
        } )[0];


        if( !error.isEmpty() ) {
            res.status( 422 ).render( 'admin/EditMovieHome/EpisodeHome/EditEpisode/editepisode.ejs',{
                pageTitle:'EDIT EPISODE TAP',
                path:'',
                episodeId: episodeId,
                movie: movieDetail,
                editing: true,
                addEpisodeMode: false,
                errorMeassage: error.array()[0].msg,
                oldInput:{
                    episode: episode,
                    movieUrl: movieUrl
                },
                validationErrors: error.array()
            } )
        }


        await movieDetail.editEpisode( episode,movieUrl,episodeId );

        console.log( `UPDATE EPISODE ${episode} SUCCESS!` );
        res.redirect( `/admin/${movieDetail._id}/get-all-episode` );

    } catch ( error ) {
        console.log( error );
    }
}

exports.postDeleteEpisode = async(req,res,next) =>{
    try {
        const paramEpisode = req.query.episode;
        const movieId = req.params.id;
        
        const movieDetail = await Movie.findById(movieId);
        await movieDetail.deleteEpisode(paramEpisode);
        res.redirect(`/admin/${movieId}/get-all-episode?edit=true`)
        console.log(`DELETE EPISODE OF ${movieDetail.name} SUCCESS !!!`);
    } catch (error) {
        console.log(error);
    }
}


// CRUD COMMENT OF MOVIE
exports.getAllComment = async(req,res,next) =>{
    try {
        const movieId = req.params.id;
        const movieDetail = await Movie.findById(movieId);
        const listComment = movieDetail.listComment.sort((a,b)=>{
            a.location - b.location
        })
        res.render('admin/EditMovieHome/ChatOnlineHome/index.ejs',{
            pageTitle:'EDIT COMMENT',
            listComment : movieDetail.listComment,
            movie: movieDetail
        })
    } catch (error) {
        console.log(error);
    }
}

exports.postDeleteComment = async(req,res,next) =>{
    try {
        const locationComment = req.query.comment;
        const movieId = req.params.id;
        const movieDetail = await Movie.findById(movieId);

        if(!movieDetail){
            res.send('Can not found');

        }
        else{
            await movieDetail.deleteComment(locationComment);
            console.log(`DELETE COMMENT OF LOCATION ${locationComment} SUCCESS!!!`);
        }
        res.redirect(`/admin/${movieId}/get-all-comment?edit=true`);
    } catch (error) {
        console.log(error);
    }
}