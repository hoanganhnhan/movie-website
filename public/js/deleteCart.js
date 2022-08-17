               // Exec form Delete 
               const btndeletemovieId = document.getElementById('deletemovieId')
                const deleteForm = document.forms['delete-form-movieId']
                let movieId;
                document.addEventListener('DOMContentLoaded' , () =>{
                    $('#delete-movieId').on('show.bs.modal', function (event) {
                        const button = $(event.relatedTarget) 
                        movieId = button.data('id')  
                        csrf = button.data('csrf')  
                        console.log(movieId)     
                    })
                })

                btndeletemovieId.onclick = () =>{
                    deleteForm.action = '/auth/cart-delete';

                    const hidden_Prod = document.getElementById('hidden-movieId');

                    hidden_Prod.value = movieId;
                    deleteForm.submit();
                }