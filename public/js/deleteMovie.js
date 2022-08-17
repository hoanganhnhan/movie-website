const deleteForm = document.forms['delete-form-objectId']

// Exect DELETE MOVIE
const btnDeleteMovieId = document.getElementById( 'DeleteMovieId' );

document.addEventListener( 'DOMContentLoaded' , () =>{
    $( '#delete-user' ).on( 'show.bs.modal', function ( event ) {
        const button = $( event.relatedTarget ) 
        objectId = button.data( 'id' )  
        csrf = button.data( 'csrf' )  
        console.log( objectId,csrf )     
    } )
} )

btnDeleteMovieId.onclick = () =>{
    deleteForm.action = '/admin/delete-movie';

    const hidden_objectId = document.getElementById( 'hiddent-objectId' );
    // const hidden_csrf = document.getElementById( 'hidden-csrf' );

    hidden_objectId.value = objectId;
    // hidden_csrf.value = csrf;
    deleteForm.submit();
}