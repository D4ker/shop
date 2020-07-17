document.querySelector('#shop-order').onsubmit = function(event) {
	event.preventDefault();
	let username = document.querySelector('#username').value.trim();
	let phone = document.querySelector('#phone').value.trim();
	let email = document.querySelector('#email').value.trim();
	let address = document.querySelector('#address').value.trim();

	if (!document.querySelector('#rule').checked) {
		Swal.fire({
			icon: 'error',
			title: 'Внимание',
			text: 'Необходимо принять условия перед покупкой',
			confirmButtonText: 'Ок'
		});
		return false;
	}

	if (username == '' || phone == '' || email == '' || address == '') {
		Swal.fire({
			icon: 'error',
			title: 'Внимание',
			text: 'Необходимо заполнить все поля',
			confirmButtonText: 'Ок'
		});
		return false;
	}

	fetch('/finish-order', {
		method: 'POST',
		body: JSON.stringify({
			'username': username,
			'phone': phone,
			'email': email,
			'address': address,
			'cart': JSON.parse(localStorage.getItem('cart'))
		}),
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		}
	}).then(function(response) {
		return response.text();
	}).then(function(body) {
		if (body == 1) {
			Swal.fire({
				icon: 'success',
				title: 'Ваш заказ был успешно оформлен',
				confirmButtonText: 'Ок'
			});
		} else {
			Swal.fire({
				icon: 'error',
				title: 'Внимание',
				text: 'Произошла ошибка',
				confirmButtonText: 'Ок'
			});
		}
	})
}