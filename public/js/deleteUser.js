const deleteForm = document.forms['delete-form-objectId']
// Exec form Delete 
const btnDeleteUserId = document.getElementById( 'DeleteUserId' )
let objectId;
let csrf;

document.addEventListener( 'DOMContentLoaded' , () =>{
    $( '#delete-user' ).on( 'show.bs.modal', function ( event ) {
        const button = $( event.relatedTarget ) 
        objectId = button.data( 'id' )  
        csrf = button.data( 'csrf' )  
        console.log( objectId,csrf )     
    } )
} )

btnDeleteUserId.onclick = function() {
    deleteForm.action = '/admin/delete-user';

    const hidden_objectId = document.getElementById( 'hiddent-objectId' );
    // const hidden_csrf = document.getElementById( 'hidden-csrf' );

    hidden_objectId.value = objectId;
    // hidden_csrf.value = csrf;
    deleteForm.submit();
}