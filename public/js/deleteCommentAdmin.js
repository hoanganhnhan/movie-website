               // Exec form Delete 
               const btndeletemovieId = document.getElementById('deletemovieId')
               const deleteForm = document.forms['delete-form-comment']
               let movieId;
               let locationComment;
               document.addEventListener('DOMContentLoaded' , () =>{
                   $('#delete-comment').on('show.bs.modal', function (event) {
                       const button = $(event.relatedTarget) 
                       movieId = button.data('id') ;
                       locationComment = button.data('location') ;
                       console.log(movieId)     
                   })
               })

               btndeletemovieId.onclick = () =>{
                   deleteForm.action = `/admin/${movieId}/delete-comment?comment=${locationComment}`;

                   const hidden_Prod = document.getElementById('hidden-movieId');

                   hidden_Prod.value = movieId;
                   deleteForm.submit();
               }