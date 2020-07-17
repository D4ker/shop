let cart = {};
document.querySelectorAll('.add-to-cart').forEach(function(element) {
	element.onclick = addToCart;
});

if (localStorage.getItem('cart')) {
	cart = JSON.parse(localStorage.getItem('cart'));
	ajaxGetGoodsInfo();
}

function addToCart() {
	let goodId = this.dataset.good_id;
	if (cart[goodId]) {
		cart[goodId]++;
	} else {
		cart[goodId] = 1;
	}
	console.log(cart);
	ajaxGetGoodsInfo();
}

function ajaxGetGoodsInfo() {
	updateLocalStorageCart();
	fetch('/get-goods-info', {
		method: 'POST',
		body: JSON.stringify({key: Object.keys(cart)}),
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	}).then(function(response) {
		return response.text();
	}).then(function(body) {
		console.log(body);
		showCart(JSON.parse(body));
	});
}

function showCart(data) {
	let out = "<table class='table table-striped table-cart'><tbody>";
	let total = 0;
	for (let key in cart) {
		out += `<tr><td colspan='5'><a href='/good?id=${key}'>${data[key]['name']}</tr>`;
		out += `<tr><td><i class='fa fa-minus-square cart-minus' data-good_id='${key}'></i></td>`;
		out += `<td>${cart[key]}</td>`;
		out += `<td><i class='fa fa-plus-square cart-plus' data-good_id='${key}'></i></td>`;
		out += `<td>${moneyFormat(data[key]['cost'] * cart[key])} руб </td>`;
		out += `<td><i class='fa fa-times cart-delete' data-good_id='${key}'></i></td>`;
		out += '</tr>';
		total += cart[key] * data[key]['cost'];
	}
	out += `<tr><td colspan='3'>Общая сумма: </td><td>${moneyFormat(total)} руб</td></tr>`
	out += '</tbody></table>';
	document.querySelector('#cart-nav').innerHTML = out;
	document.querySelectorAll('.cart-plus').forEach(function(element) {
		element.onclick = cartPlus;
	});
	document.querySelectorAll('.cart-minus').forEach(function(element) {
		element.onclick = cartMinus;
	});
	document.querySelectorAll('.cart-delete').forEach(function(element) {
		element.onclick = cartDelete;
	});
}

function moneyFormat(money) {
	return (money / 100).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ');
}

function cartPlus() {
	let goodId = this.dataset.good_id;
	cart[goodId]++;
	ajaxGetGoodsInfo();
}

function cartMinus() {
	let goodId = this.dataset.good_id;
	if (cart[goodId] > 1) {
		cart[goodId]--;
	}
	ajaxGetGoodsInfo();
}

function cartDelete() {
	let goodId = this.dataset.good_id;
	delete(cart[goodId]);
	ajaxGetGoodsInfo();
}

function updateLocalStorageCart() {
	localStorage.setItem('cart', JSON.stringify(cart));
}