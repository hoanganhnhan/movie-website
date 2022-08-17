const path = require( 'path' );

const Movie = require( '../models/movie' );
const User = require('../models/user');
const { move } = require('../routes/home');

const ITEMS_PER_CONTAINER_LIST = 5;

exports.getIndex = async ( req, res) => {
    const page = req.query.page || 1;

    try {
        const listPhimBo = await Movie.find( { typeFilm: 'Phim-Bộ' } )
            .limit( 18 );
        const listPhimLe = await Movie.find( { typeFilm: 'Phim-Lẻ' } )
            .limit( 18 );
        const listChieuRap = await Movie.find( { typeFilm: 'Phim-Chiếu-Rạp' } )
            .limit( 18 );
        const HoatHinh = await Movie.find( { typeFilm: 'Hoạt-Hình' } )
            .limit( 18 );
        const listPhimSapChieu = await Movie.find( { typeFilm: 'Phim-Sắp-Chiếu' } )
            .limit( 6 );

        res.render( 'home/HomePage/index.ejs', {
            listPhimBo: listPhimBo,
            listPhimLe: listPhimLe,
            listChieuRap: listChieuRap,
            HoatHinh: HoatHinh,
            listPhimSapChieu: listPhimSapChieu,
            modeCategory:false,
            pageTitle: 'TRANG CHU',
            path: '/'
        } )
    }
    catch ( error ) {
        console.log( error )
    }
}

exports.getMovieDetail = async( req,res) =>{
    try {

        const listPhimChieuRap = await Movie.find( { typeFilm: 'Phim-Chiếu-Rạp' } )
            .limit( 18 );

        const listPhimSapChieu = await Movie.find( { typeFilm: 'Phim-Sắp-Chiếu' } )
            .limit( 6 );

        const movieDetail = await Movie.findOne( { name: req.params.name } );
        const listComment = movieDetail.listComment.sort( ( a,b ) =>{
            return b.location - a.location;
        } )
        const listEpisode = movieDetail.listEpisode.sort((a,b) =>{
            return a.episode - b.episode;
        })

        const userDetail = await User.findById(req.user._id);
        
        if ( movieDetail === null ) {
            movieDetail = 'Undified';
        }

        if(movieDetail.listEpisode.length===0){
            var modeWatching=false;
        }

        res.render( 'home/MovieDetail/index.ejs', {
            listPhimChieuRap: listPhimChieuRap,
            movie: movieDetail,
            listPhimSapChieu: listPhimSapChieu,
            user: userDetail,
            listcomment: listComment,
            modeWatching: modeWatching,
            listEpisode:listEpisode
            
        } )
    } catch ( error ) {
        console.log( error )
    }
}

exports.getWatchMovie = async ( req, res) => {
    try {
        const movieDetail = await Movie.findOne( { name: req.params.name } );
        const listPhimChieuRap = await Movie.find( { typeFilm: 'Phim-Chiếu-Rạp' } )
            .limit( 18 )
                   
        const listEpisodeitem =await movieDetail.listEpisode.sort( ( a,b ) =>{
            return a.episode - b.episode;
            } )
        const listComment =await movieDetail.listComment.sort( ( a,b ) =>{
            return b.location - a.location;
            } )

        const movieEpisodeDetail = movieDetail.listEpisode.filter(value =>{
                return value.episode.toString()===req.query.episode.toString()
        });
        res.render( 'home/VideoMovie/index.ejs', {
            movie: movieDetail,
            movieEpisodeDetail: movieEpisodeDetail,
            listPhimChieuRap: listPhimChieuRap,
            user: req.user._id,
            listcomment: listComment,
            listEpisode: listEpisodeitem
        } )

    } catch ( error ) {
        console.log( error )
    }
}



exports.getCategory = async( req, res) =>{
    try {
        const getCategory = req.params.category
        const listMove = await Movie.find()

        const listPhimSapChieu = await Movie.find( { typeFilm: 'Phim-Sắp-Chiếu' } )
        .limit( 6 );

        listMovieCategory = listMove.filter((movie) =>{
            return (movie.typeFilm == getCategory || movie.national == getCategory)
        })        
        
        res.render('home/HomePage/index.ejs',{
            listCategory : listMovieCategory,
            listPhimSapChieu:listPhimSapChieu,
            nameCategory: getCategory,
            modeCategory: true
        })
    } catch (error) {
        console.log(error);
    }
}

exports.searchMovie = async(req,res)=>{
    try {
        const keywordSearch = req.body.Search
        const listMovie = await Movie.find();
        const listMovieDetail = listMovie.filter(value =>{
            return (value.name.toUpperCase().includes( keywordSearch.toUpperCase() ) || 
                    value.typeFilm.replace(/-/g,'').toUpperCase().includes(keywordSearch.replace(/\s/g, '').toUpperCase()))
        })

        const listPhimSapChieu = await Movie.find( { typeFilm: 'Phim-Sắp-Chiếu' } )
        .limit( 6 );

        res.render('home/HomePage/index.ejs',{
            listCategory : listMovieDetail,
            listPhimSapChieu:listPhimSapChieu,
            nameCategory: keywordSearch,
            modeCategory: true
        })
    } catch (error) {
        console.log(error);
    }
}

// CHAT ONLINE

exports.postChatOnline = async(req,res,next) =>{
    try {
        const movieId = req.body.movieId;
        const userId = req.user._id
        const comment = req.body.comment;

        const movieDetail = await Movie.findById(movieId);
        const userDetail = await User.findById(userId);


        await movieDetail.addComment(userDetail.email[0],comment);
        res.redirect(`/film/${movieDetail.name}`);
    } catch (error) {
        console.log(error);
    }
}