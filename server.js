
if (!process.env.PORT) {
    process.env.PORT = 8080;
}

var formidable = require("formidable");

var express = require('express'),
	app = express();

var http = require('http').Server(app);

var pg = require('pg');
var conString = 'pg://postgres:postgres@localhost:5432/postgres'

var client = new pg.Client(conString);
client.connect();

var expressSession = require('express-session');

app.use(express.static('public'));
app.use(
  expressSession({
    secret: '1234567890QWERTY', // Skrivni ključ za podpisovanje piškotkov
    saveUninitialized: true,    // Novo sejo shranimo
    resave: false,              // Ne zahtevamo ponovnega shranjevanja
    cookie: {
      maxAge: 3600000           // Seja poteče po 60min neaktivnosti
    }
  })
);

//__________________________________________________________

app.post('/prijava', function(zahteva, odgovor) {
	//zahteva.send('hi');
	var form = new formidable.IncomingForm();
	form.parse(zahteva, function(error, podatki){
		console.log(podatki.userName);
		console.log(podatki.password);
		client.query("SELECT * FROM expenses.users WHERE username = $1 AND password = $2", [podatki.userName, podatki.password], function(err, rezultat){
				console.log(rezultat);
				if(rezultat.rows.length != 0){
					console.log("prijava id "+ rezultat.rows[0].user_id);
					zahteva.session.ime = rezultat.rows[0].username;
					zahteva.session.geslo = rezultat.rows[0].password;
					zahteva.session.id = rezultat.rows[0].user_id;
	    			odgovor.redirect('/lifeExpenses.html');
				}
				else{
					
					console.log("Napacno ime ali geslo");
					odgovor.redirect('/');
				}
		});
		
	});
});


app.get('/', function(zahteva, odgovor) {
    odgovor.redirect('/index');
})

//___________________________________________________________

http.listen(process.env.PORT, function() {
  console.log("Strežnik posluša na portu " + process.env.PORT + ".");
});


//var query = client.query("INSERT INTO expenses.account(account_id, credit) values(6,'2.20')");
/*var query = client.query("SELECT * FROM expenses.users WHERE user_id=3", function(e,r){
	if(r.rows.length !=0){
		console.log(r.rows);	
	}
		
});

*/