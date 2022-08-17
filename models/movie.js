const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema


const movieSchema = new Schema( {
    name:{
        type:String,
        required: true
    },
    director:{
        type: String,
        required: true
    },
    character:{
        type: String,
        required: true
    },
    national: String,
    producer: {
        type: String
    },
    description:{
        type:String,
        required: true
    },
    imageUrl:{
        type: String,
        required: true
    },
    typeFilm: {
        type:String
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    listEpisode:[
        {
            episode:{
                type: Number,
                required: true
            },
            movieUrl:{
                type: String,
                required: true
            }
        }
    ],
    listComment:[
        {
            name:{
                type:String,
                required: true
            },
            content:{
                type:String,
                required: true
            },
            location:{
                type: Number,
                required: true
            }
        }
    ]

} )


movieSchema.methods.addEpisode = function ( movieUrl ) {
    const updateListEpisode = [...this.listEpisode]
    let maxEpisode = -Infinity;
    if( updateListEpisode.length === 0 ) {
        maxEpisode = 0;
    }
    else{
        for( let e of updateListEpisode ) {
            if( e.episode > maxEpisode ) {
                maxEpisode = e.episode;
            }
        } 
    }
    
    updateListEpisode.push( {
        episode: maxEpisode + 1,
        movieUrl:movieUrl
    } )

    this.listEpisode = updateListEpisode
    return this.save()
}

movieSchema.methods.editEpisode = function ( episode, movieUrl,episodeId ) {
    const updateListEpisode = [...this.listEpisode]
    
    function checkIndexEpisode ( episodeId ) {
        for ( let i=0; i< updateListEpisode.length;++i ) {
            if( updateListEpisode[i]._id.toString() === episodeId.toString() ) {
                return i;
            }
        }
    }
    const indexEpisode = checkIndexEpisode( episodeId );
    console.log( indexEpisode );
    updateListEpisode.push( {
        episode: episode,
        movieUrl:movieUrl
    } )

    updateListEpisode.splice( indexEpisode,1 );

    this.listEpisode = updateListEpisode
    return this.save()
}

movieSchema.methods.addComment = function(name,comment){
    const updateComment = [...this.listComment];
    let locationComment = -Infinity;
    if( updateComment.length === 0 ) {
        locationComment = 0;
    }
    else{
        for( let e of updateComment ) {
            if( e.location > locationComment ) {
                locationComment = e.location;
            }
        } 
    }

    updateComment.push({
        name: name,
        content: comment,
        location: locationComment +1
    })
    this.listComment = updateComment;
    this.save();
}

movieSchema.methods.deleteEpisode = function(episode){
    const updateEpisode = [...this.listEpisode];
    const hasRemoveEpisode = updateEpisode.filter(value =>{
        return value.episode.toString()!==episode.toString();
    })

    this.listEpisode= hasRemoveEpisode;
    this.save();
    
}

movieSchema.methods.deleteComment = function(locationComment){
    const updateComment = [...this.listComment];
    const hasRemoveComment = updateComment.filter(value =>{
        return value.location.toString()!==locationComment.toString();
    })

    this.listComment= hasRemoveComment;
    this.save();
    
}

module.exports = mongoose.model( 'Movie',movieSchema );