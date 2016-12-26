
if (!process.env.PORT) {
    process.env.PORT = 8080;
}

var formidable = require("formidable");
var path = require('path');
var express = require('express'),
	app = express();

var http = require('http').Server(app);

var pg = require('pg');
var conString = 'pg://postgres:postgres@localhost:5432/postgres'

var client = new pg.Client(conString);
client.connect();

var expressSession = require('express-session');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static('views'));
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
		//console.log(podatki.userName);
		//console.log(podatki.password);
		client.query("SELECT * FROM expenses.users WHERE username = $1 AND password = $2", [podatki.userName, podatki.password], function(err, rezultat){
				//console.log(rezultat);
				if(rezultat.rows.length != 0){
					console.log("prijava id "+ rezultat.rows[0].user_id);
					
					zahteva.session.id1 = rezultat.rows[0].user_id;
	    			odgovor.redirect('/lifeExpenses');
				}
				else{
					
					console.log("Wrong username or password!");
					odgovor.redirect('/');
				}
		});
		
	});
});
app.get('/register',function(zahteva,odgovor){
	odgovor.render('register');

})

app.post('/registracija', function(zahteva, odgovor){
	var form = new formidable.IncomingForm();
	var obstaja = 0;
	form.parse(zahteva, function(error, podatki){
		//console.log(podatki.userName);
		//console.log(podatki.pass);
		//console.log(podatki.pass2);
		if(podatki.pass2 == podatki.pass){		
			client.query("INSERT INTO expenses.users (username, password, email) VALUES ($1,$2,$3)", [podatki.userName, podatki.pass, podatki.email], function(zahteva, podatki){
					//console.log("zahteva: "+zahteva);
					//console.log("odgovor: "+odgovor);
					if(zahteva){
						console.log("User already exists");
						
						odgovor.redirect('/register');
					}
					else{
						console.log("Uspesna registracija!");
						
						odgovor.redirect('/');
					}
			});
		}
		else{
			console.log("Passwords do not match!");
		}
		
	});
})

app.post('/goal', function(zahteva,odgovor){
	var form = new formidable.IncomingForm();
	form.parse(zahteva, function(error, podatki){

		client.query("INSERT INTO expenses.goal (amount, date, user_id) VALUES ($1,$2,$3)", [podatki.value, podatki.date, zahteva.session.id1], function(err, podatki){
					if(err){
						console.log("napaka: "+ err);
					}
					else{
						//console.log("odgovor: "+odgovor);
					
						odgovor.redirect('/lifeExpenses');
					}
					
					
			});
	});
});

app.post('/deleteGoal', function(zahteva, odgovor){
	var form = new formidable.IncomingForm();
	form.parse(zahteva, function(error, podatki){

		client.query("DELETE FROM expenses.goal WHERE goal_id = $1", [podatki.id], function(err, podatki){
					if(err){
						console.log("napaka: "+ err);
					}
					else{
						//console.log("odgovor: "+odgovor);
						
					
						odgovor.redirect('/lifeExpenses');
					}
					
					
			});
	});
});

app.get('/odjava', function(zahteva, odgovor){

	zahteva.session.id1 = null;
	console.log("odjava");
	odgovor.redirect('/');
})

app.get('/lifeExpenses', function(zahteva,odgovor){

	//console.log("prijavljen z id "+ zahteva.session.id);
	//console.log("prijavljen z id1 "+ zahteva.session.id1);
	if(zahteva.session.id1 == null){
		console.log("ni uporabnika");
		odgovor.redirect('/');
	}
	else{
		console.log("zbiram podatke");
		client.query("SELECT * FROM expenses.goal WHERE user_id = $1", [zahteva.session.id1], function(err, cilji){
			
			//console.log(cilji.rows);
			client.query("SELECT * FROM expenses.account WHERE user_id = $1", [zahteva.session.id1], function(err, racuni){
				
				//console.log(racuni.rows);

				odgovor.render('lifeExpenses', {cilji: cilji.rows, racuni: racuni.rows});	
			});
			//odgovor.render('lifeExpenses', {cilji: rezultat.rows});	
		});
	}
});




app.get('/', function(zahteva, odgovor) {
	
	//console.log("session id "+ zahteva.session.id1);
    odgovor.render('index');
});

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