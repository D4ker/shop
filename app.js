let express = require('express');
let app = express();
app.use(express.static('public')); // Подключаем статику (public - папка, где хранится вся статика)

// Задаём шаблонизатор (препроцессор) pug
app.set('view engine', 'pug');

// Подключаем mysql-модуль
let mysql = require('mysql');

app.use(express.json());

const nodemailer = require('nodemailer');

// Настраиваем модуль
let connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'shop'
});

app.listen(3000, function() {
	console.log('node express work on 3000');
}); // Устанавливаем слушатель на 3000 порт

app.get('/', function(req, res) {
	let categories = new Promise(function(resolve, reject) {
		connection.query(
		'SELECT id, name, image FROM category',
		function(error, result) {
			if (error) reject(error);
			resolve(result);
		}
		);
	});
	// Передаём данные в pug
	Promise.all([categories]).then(function(value) {
		console.log(value);
		res.render('main', {
			category: JSON.parse(JSON.stringify(value[0]))
		});
	});
}); // Если через get-запрос обращаются на адрес "/", то...

/*
app.get('/test', function(req, res) {
	res.end('Hello');
});
*/

app.get('/category', function(req, res) {
	console.log(req.query.id);
	let categoryId = req.query.id;

	let currentCategory = new Promise(function(resolve, reject) {
		connection.query(
		'SELECT * FROM category WHERE id = ' + categoryId,
		function(error, result) {
			if (error) reject(error);
			resolve(result);
		}
		);
	});

	let currentGoods = new Promise(function(resolve, reject) {
		connection.query(
		'SELECT * FROM goods WHERE category_id = ' + categoryId,
		function(error, result) {
			if (error) reject(error);
			resolve(result);
		}
		);
	});

	Promise.all([currentCategory, currentGoods]).then(function(value) {
		console.log(value);
		res.render('category', {
			category: JSON.parse(JSON.stringify(value[0])),
			goods: JSON.parse(JSON.stringify(value[1]))
		});
	});
});

app.get('/good', function(req, res) {
	console.log(req.query.id);
	connection.query('SELECT * FROM goods WHERE id = ' + req.query.id, function(error, result, fields) {
		if (error) throw error;
		res.render('good', {
			goods: JSON.parse(JSON.stringify(result))
		});
	});
});

app.get('/order', function(req, res) {
	res.render('order');
});

app.post('/get-category-list', function(req, res) {
	//console.log(req.body);
	connection.query('SELECT id, name FROM category', function(error, result, fields) {
		if (error) throw error;
		console.log(result);
		res.json(result);
	});
});

app.post('/get-goods-info', function(req, res) {
	console.log(req.body.key);
	if (req.body.key.length != 0) {
		connection.query('SELECT id, name, cost FROM goods WHERE id IN (' + req.body.key.join(', ') + ')', function(error, result, fields) {
			if (error) throw error;
			console.log(result);
			let goods = {};
			for (let i = 0; i < result.length; i++) {
				goods[result[i]['id']] = result[i];
			}
			res.json(goods);
		});
	} else {
		res.send('0');
	}
});

app.post('/finish-order', function(req, res) {
	console.log(req.body);
	if (req.body.cart.length != 0) {
		let goodsId = Object.keys(req.body.cart);
		connection.query('SELECT id, name, cost FROM goods WHERE id IN (' + goodsId.join(', ') + ')', function(error, result, fields) {
			if (error) throw error;
			console.log(result);
			sendMail(req.body, result).catch(console.error);
			res.send('1');
		});
	} else {
		res.send('0');
	}
});

async function sendMail(data, result) {
	let res = '<h2>Order in shop</h2>';
	let total = 0;
	for (let i = 0; i < result.length; i++) {
		res += `<p>${result[i]['name']} - ${data.cart[result[i]['id']]} - ${moneyFormat(result[i]['cost'] * data.cart[result[i]['id']])} руб</p>`;
		total += result[i]['cost'] * data.cart[result[i]['id']];
	}
	console.log(res);
	res += `<hr>Итог: ${moneyFormat(total)} руб`;
	res += `<hr>Пользователь: ${data.username}`;
	res += `<hr>Телефон: ${data.phone}`;
	res += `<hr>Email: ${data.email}`;
	res += `<hr>Адрес: ${data.address}`;

	let account = await nodemailer.createTestAccount();

	let transporter = nodemailer.createTransport({
		host: "smtp.ethereal.email",
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: account.user, // generated ethereal user
			pass: account.pass, // generated ethereal password
		},
	});

	let mailOption = {
		from: 'mikot66080@winemails.com',
		to: 'mikot66080@winemails.com, ' + data.email,
		subject: 'Shop order',
		text: 'Hello',
		html: res
	};

	let info = await transporter.sendMail(mailOption);
	console.log("MessageSend: %s", info.messageId);
	console.log("PreviewSend: %s", nodemailer.getTestMessageUrl(info));
	return true;
}

function moneyFormat(money) {
	return (money / 100).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$& ');
}