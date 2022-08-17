
    const socket = io();
    const chatForm = document.getElementById('form-comment');
    const emailUser = document.getElementById('emailUser').value;
    const chatComment = document.getElementById('comment');
    const room = document.getElementById('movieId').value;

    socket.emit('join-room', room);
    chatForm.addEventListener('submit',(e)=>{
        e.preventDefault();
        const comment = chatComment.value;
            socket.emit('comment', room,emailUser, {
            comment: comment,
        });
        chatComment.value = '';
    })

    const comments = document.querySelector('#list-comment');
    socket.on('user-comment', (comment) => {
        const liNameComment = document.createElement('li');
        liNameComment.style.fontSize='14px';
        liNameComment.style.padding='8px 12px';
        liNameComment.innerHTML =`<i class="fa-solid fa-user" style="font-size: 20px; color: rgb(33, 129, 97);"></i> User ${comment.name}:   ${comment.comment}` ;

        comments.appendChild(liNameComment);
    })

