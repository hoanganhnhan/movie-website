const form_add_to_cart = document.forms['form-add-to-cart'];
const icon_click = document.getElementById('add-to-cart-icon');

icon_click.onclick = function() {
    form_add_to_cart.action = '/auth/cart';
    form_add_to_cart.submit()
}