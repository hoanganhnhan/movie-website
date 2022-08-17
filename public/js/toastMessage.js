
  const form_change_infor = document.forms['form-change-myaccount'];
  const btn_change_infor = document.getElementById('btn-update-myaccount');
  const currentPassword = document.getElementById('currentpassword').value;
  const newPassword = document.getElementById('newpassword').value;
  const modeCheckCurrentPassword = document.getElementById('hidden-error').value
//   btn_change_infor.addEventListener('click',checkValidation);

  function checkValidation(){
      if(currentPassword==''|| newPassword==''){
          showErrorToast_0()
      }
      else if(modeCheckCurrentPassword=='false'){
          showErrorToast_1()
      }
  }



  function showErrorToast_0(){
        toast({
          title: "error",
          message: "Các trường phải điền đủ thông tin.",
          type: "error",
          duration: 5000
        });
  }

  function showErrorToast_1(){
        toast({
          title: "error",
          message: "Mật khẩu hiện tại không đúng!",
          type: "error",
          duration: 1000
        });
  }


// Toast function
function toast({ 
title = title, 
message = message, 
type = type, 
duration = 3000 }) {
    const main = document.getElementById("toast-message");
    if (main) {
      const toast = document.createElement("div");
  
      // Auto remove toast
      const autoRemoveId = setTimeout(function () {
        main.removeChild(toast);
      }, duration + 1000);
  
      // Remove toast when clicked
      toast.onclick = function (e) {
        if (e.target.closest(".toast__close")) {
          main.removeChild(toast);
          clearTimeout(autoRemoveId);
        }
      };
      
      const icons = {
        success: "fas fa-check-circle",
        info: "fas fa-info-circle",
        warning: "fas fa-exclamation-circle",
        error: "fas fa-exclamation-circle"
      };
      const icon = icons[type];
      const delay = (duration / 1000).toFixed(2);
      toast.classList.add("toast-message", `toast-message__${title}`);
      toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`;
      
      toast.innerHTML = `
                    <div class="toast-message__icon">
                        <i class="${icon}" style="font-size: 16px;"></i>
                    </div>
                    <div class="toast-message__body">
                        <h3 class="toast-message__title">${title}!!!</h3>
                        <p class="toast-message__msg">${message}</p>
                    </div>
                    <div class="toast-message__close">
                        <i class="fas fa-times"></i>
                    </div>

                  `;
      main.appendChild(toast);
    }
  }
  