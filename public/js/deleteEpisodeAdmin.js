               // Exec form Delete 
                const btndeletemovieId = document.getElementById('deletemovieId')
                const deleteForm = document.forms['delete-form-comment']
                let movieId;
                let Episode;
                document.addEventListener('DOMContentLoaded' , () =>{
                    $('#delete-Episode').on('show.bs.modal', function (event) {
                        const button = $(event.relatedTarget) 
                        movieId = button.data('id') 
                        Episode = button.data('episode') 
                        console.log(movieId)     
                    })
                })

                btndeletemovieId.onclick = () =>{
                    deleteForm.action = `/admin/${movieId}/delete-episode?episode=${Episode}`;

                    const hidden_Prod = document.getElementById('hidden-movieId');

                    hidden_Prod.value = movieId;
                    deleteForm.submit();
                }