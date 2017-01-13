
if (!process.env.PORT) {
    process.env.PORT = 8080;
}

var bcrypt = require('bcrypt-nodejs');

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


var bodyParser = require('body-parser');

// parse application/json
app.use(bodyParser.json())


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
//for goals
var sporocilo = "";

//logging
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
	    new (winston.transports.Console)(),
	    new (winston.transports.File)({ filename: 'info.log' })
    ]
});

// log in 
app.post('/prijava', function(zahteva, odgovor) {
	
	var form = new formidable.IncomingForm();
	form.parse(zahteva, function(error, podatki){
		client.query("SELECT * FROM expenses.users WHERE username = $1", [podatki.userName], function(err, rezultat){
			if(rezultat.rows.length != 0 && bcrypt.compareSync(podatki.password, rezultat.rows[0].password)){
				//session
				zahteva.session.id1 = rezultat.rows[0].user_id;
				zahteva.session.role = rezultat.rows[0].pro;
				
    			odgovor.redirect('/lifeExpenses');
			}
			else{
				logger.info('Wrong username or password!');
				odgovor.redirect('/');
			}
			
		});
		
	});
});

//register 
app.get('/register',function(zahteva,odgovor){
	odgovor.render('register');
})

app.post('/registracija', function(zahteva, odgovor){
	var form = new formidable.IncomingForm();
	var obstaja = 0;
	form.parse(zahteva, function(error, podatki){
		var userName= podatki.userName;
		if(podatki.pass2 == podatki.pass){	
			var cryptedPass = bcrypt.hashSync(podatki.pass);	
			client.query("INSERT INTO expenses.users (username, password, email, pro) VALUES ($1,$2,$3,$4)", [podatki.userName, cryptedPass, podatki.email, "false"], function(zahteva, podatki){
				client.query("SELECT * FROM expenses.users WHERE username = $1", [userName], function(e,r){
					
					client.query("INSERT INTO expenses.account (user_id, name, credit, id) VALUES ($1,$2,$3,$4)", [r.rows[0].user_id, "transaction", 0, 1], function(e1,r1){
						client.query("INSERT INTO expenses.account (user_id, name, credit, id) VALUES ($1,$2,$3,$4)", [r.rows[0].user_id, "savings", 0, 2], function(e2,r2){
							client.query("INSERT INTO expenses.account (user_id, name, credit, id) VALUES ($1,$2,$3,$4)", [r.rows[0].user_id, "wallet", 0, 3], function(e3,r3){
								if(zahteva){
									logger.info('User already exists');
									odgovor.redirect('/register');
								}
								if(e1||e2||e3){
									logger.error("error "+e1+" "+e2+" "+e3);
								}
								else{
									odgovor.redirect('/');
								}
							});
						});
					});
				})
			});
		}
		else{
			console.log("Passwords do not match!");
		}
		
	});
})

//adds goal
app.post('/goal', function(zahteva,odgovor){
	var form = new formidable.IncomingForm();
	form.parse(zahteva, function(error, podatki){
		client.query("SELECT * FROM expenses.goal WHERE user_id = $1", [zahteva.session.id1], function(e, cilji){
			//just a Pro user can add more than 3 goals
			if(cilji.rows.length < 3){
				client.query("INSERT INTO expenses.goal (amount, date, user_id) VALUES ($1,$2,$3)", [podatki.value, podatki.date, zahteva.session.id1], function(err, podatki){
					if(err){
						
						logger.error("napaka: "+ err);
					}
					else{
						
					
						odgovor.redirect('/lifeExpenses');
					}				
				});
			}	
			else if(zahteva.session.role == true){
				client.query("INSERT INTO expenses.goal (amount, date, user_id) VALUES ($1,$2,$3)", [podatki.value, podatki.date, zahteva.session.id1], function(err, podatki){
					if(err){
						
						logger.error("napaka: "+ err);
					}
					else{
						
					
						odgovor.redirect('/lifeExpenses');
					}				
				});
			}
			else{
				sporocilo = "Upgrade to Pro";
				odgovor.redirect('/lifeExpenses');
			}
		});
	});
});

//delete choosen goal
app.post('/deleteGoal', function(zahteva, odgovor){
	var form = new formidable.IncomingForm();
	form.parse(zahteva, function(error, podatki){
		client.query("DELETE FROM expenses.goal WHERE goal_id = $1", [podatki.id], function(err, podatki){
			if(err){
				logger.error("napaka: "+ err);
				
			}
			else{
				
				odgovor.redirect('/lifeExpenses');
			}	
		});
	});
});

//log out
app.get('/odjava', function(zahteva, odgovor){

	zahteva.session.id1 = null;
	zahteva.session.role = null;
	logger.info("Log out. User id: "+zahteva.session.id1)
	odgovor.redirect('/');
})

//main page
app.get('/lifeExpenses', function(zahteva,odgovor){

	if(zahteva.session.id1 == null){
		logger.info("You need to log in!");
		odgovor.redirect('/');
	}
	else{
		
		client.query("SELECT * FROM expenses.goal WHERE user_id = $1", [zahteva.session.id1], function(err, cilji){
		
			client.query("SELECT * FROM expenses.account WHERE user_id = $1 ORDER BY id ASC", [zahteva.session.id1], function(err, racuni){
				client.query("SELECT value FROM expenses.action WHERE account_id = 1 AND user_id = $1 AND effect = -1 ORDER by action_id DESC LIMIT 12", [zahteva.session.id1], function(e, p){
					client.query("SELECT value FROM expenses.action WHERE account_id = 1 AND user_id = $1 AND effect = 1 ORDER by action_id DESC LIMIT 12", [zahteva.session.id1], function(e1, p1){
						//arrays for graph
						var tab = [0,0,0,0,0,0,0,0,0,0,0,0];
						var tab2 = [0,0,0,0,0,0,0,0,0,0,0,0];
						for(var i = 0; i < p.rows.length; i++){
							tab[i] = p.rows[i].value;
						}

						for(var i = 0; i < p1.rows.length; i++){
							tab2[i] = p1.rows[i].value;
						}

						odgovor.render('lifeExpenses', {cilji: cilji.rows, racuni: racuni.rows, tab1: tab, tab2: tab2, sporocilo: sporocilo});
						sporocilo = "";
					});
				});	
			});
		});
	}
});

app.post('/transaction', function(zahteva,odgovor){
	odgovor.redirect("/transactionAcc");
});

app.post('/savings', function(zahteva,odgovor){
	odgovor.redirect("/savingsAcc");
});
app.post('/wallet', function(zahteva,odgovor){
	odgovor.redirect("/wallet");
});

//accounts
app.get('/transactionAcc', function(zahteva,odgovor){
	client.query("SELECT * FROM expenses.account WHERE id = 1 AND user_id = $1", [zahteva.session.id1], function(err, podatki){
		client.query("SELECT * FROM expenses.action WHERE account_id = 1 AND user_id = $1 ORDER by action_id DESC LIMIT 10", [zahteva.session.id1], function(e, p){
			odgovor.render('transactionAcc', {credit: podatki.rows[0].credit, actions: p.rows});
		})
		
	});
});

app.get('/savingsAcc', function(zahteva,odgovor){
	client.query("SELECT * FROM expenses.account WHERE id = 2 AND user_id = $1", [zahteva.session.id1], function(err, podatki){
		client.query("SELECT * FROM expenses.action WHERE account_id = 2 AND user_id = $1 ORDER by action_id DESC LIMIT 10", [zahteva.session.id1], function(e, p){
			odgovor.render('savingsAcc', {credit: podatki.rows[0].credit, actions: p.rows});
		})
	});
});

app.get('/wallet', function(zahteva,odgovor){
	client.query("SELECT * FROM expenses.account WHERE id = 3 AND user_id = $1", [zahteva.session.id1], function(err, podatki){
		client.query("SELECT * FROM expenses.action WHERE account_id = 3 AND user_id = $1 ORDER by action_id DESC LIMIT 10", [zahteva.session.id1], function(e, p){
			odgovor.render('wallet', {credit: podatki.rows[0].credit, actions: p.rows});
		})
	});
});

//transfer money from one account to another
app.post('/transfer', function(zahteva,odgovor){
	var form = new formidable.IncomingForm();
	form.parse(zahteva, function(error, podatki){
		var idFrom = podatki.accid;
		var imeFrom = podatki.accName;
		var vrednost = podatki.amount;
		var idTo = 0;
		var imeTo = podatki.to;
		
		if(podatki.to == "transaction"){
			idTo = 1;
		}
		else if(podatki.to == "savings"){
			idTo = 2;
		}
		else if(podatki.to == "wallet"){
			idTo = 3;
		}
		var d = new Date();
		client.query("UPDATE expenses.account SET credit=credit-$1 WHERE id = $2 AND user_id = $3", [vrednost,idFrom,zahteva.session.id1], function(err1,rezultat){
			client.query("UPDATE expenses.account SET credit=credit+$1 WHERE id = $2 AND user_id = $3", [vrednost,idTo,zahteva.session.id1], function(err,rezultat){
				console.log(zahteva.session.id1);
				client.query("INSERT INTO expenses.action (name,type,date,effect,value,account_id, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7)", [imeFrom, "transaction", d, 1, vrednost, idTo, zahteva.session.id1], function(e,r){
					client.query("INSERT INTO expenses.action (name,type,date,effect,value,account_id, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7)", [imeTo, "transaction", d, -1, vrednost, idFrom, zahteva.session.id1], function(e1,r1){
						if(err ){
							logger.error("Napaka pri transakciji "+err);
						}
						if(e){
							logger.error("Napaka pri transakciji "+e);
						}
						if(e1){
							logger.error("Napaka pri transakciji "+e1);
						}
						if(err1){
							logger.error("Napaka pri transakciji "+err1);
						}
						else{
							logger.info("Uspesno");
						}	
						
						if(idFrom == 1){
							odgovor.redirect("/transactionAcc");
						}
						if(idFrom == 2){
							odgovor.redirect("/savingsAcc");
						}
						if(idFrom == 3){
							odgovor.redirect("/wallet");
						}
					});
				});
				
			});
		});
	});
});


//add action to choosen account
app.post('/addAction', function(zahteva, odgovor){
	var form = new formidable.IncomingForm();
    
	form.parse(zahteva, function(error, podatki){
		var vrednost = podatki.amount;
		var id = podatki.accid;
		var income = -1;
		var type = podatki.tip;
		if(podatki.radioAction == "income")
			income=1;
		client.query("INSERT INTO expenses.action (name,type,date,effect,value,account_id,user_id) VALUES ($1,$2,$3,$4,$5,$6,$7)", [podatki.name, type, podatki.date, income, podatki.amount, podatki.accid, zahteva.session.id1], function(err, podatki){
			
			if(income == 1 && err == null){ //income
				client.query("UPDATE expenses.account SET credit = credit+$1 WHERE account_id = $2", [vrednost, id], function(napaka, vsebina){
					if (napaka) {
						logger.error("Napaka pri posodabljanju stanja na racunu: "+ napaka);
					}
					switch (id){
						case 1:
							odgovor.redirect('/transactionAcc');
							break;
						case 2:
							odgovor.redirect('/savingsAcc');
							break;
						case 3:
							odgovor.redirect('/wallet');
							break;
					}
				});
			}
			else if(income == -1 && err == null){ //outcome
				client.query("UPDATE expenses.account SET credit = credit-$1 WHERE account_id = $2", [vrednost, id], function(napaka, vsebina){
					if (napaka) {
						console.log("Napaka pri posodabljanju stanja na racunu: "+ napaka);
						logger.error("Napaka pri posodabljanju stanja na racunu: "+ napaka);
					}
					if(id == 1){
						odgovor.redirect('/transactionAcc');
					}
						
						
					if(id == 2){
						odgovor.redirect('/savingsAcc');
					}
						
					if(id == 3){
						odgovor.redirect('/wallet');
					}	
				});
			}	
		});
	});
});



//log in
app.get('/', function(zahteva, odgovor) {
    odgovor.render('index');
});

//___________________________________________________________

http.listen(process.env.PORT, function() {
  logger.info("Strežnik posluša na portu " + process.env.PORT + ".");
});

