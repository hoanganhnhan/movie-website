
const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const userSchema = new Schema( {
    email: {
    type: String,
        required: true
    },
    password:{
        type : String,
        required: true
    },
    role: String,
    resetToken: String,
    resetTokenExpiration: Date,
    cart:{
        items:[
            {
                movieId:{
                    type:Schema.Types.ObjectId,
                    ref:'Movie',
                    required: true
                },
            }
        ]
    }
} )

userSchema.methods.addToCart = function ( movie ) {
    const updateCartItems = [...this.cart.items]
    
    const listIdFromCart = updateCartItems.map(value =>{
        return value.movieId.toString()
    })

    const checkNewMovie_inCart = listIdFromCart.includes(movie._id.toString())   
    if(!checkNewMovie_inCart){
        updateCartItems.push( {
            movieId: movie._id,
        } )
        const updateCart = {
            items:updateCartItems
        }
        
        this.cart = updateCart
        return this.save()
    }
    else{
        return 0
    }
}

userSchema.methods.removeFromCart = function ( movieId ) {
    const updateCartItems = this.cart.items.filter( item =>{
        return item.movieId.toString() !== movieId.toString()

    } )

    this.cart.items = updateCartItems;
    return this.save()
}

userSchema.methods.clearCart = function () {
    this.cart = { items: [] }
    return this.save()

}

module.exports = mongoose.model( 'User',userSchema );