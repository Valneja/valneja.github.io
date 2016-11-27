
 /*
document.getElementById('submit').disabled = true;
alert("disabled");

function checkPassword(){
	
	var p1 = document.getElementById("pass1").value;
	var p2 = document.getElementById("pass2").value;

	

	if(p1 != p2){
		//alert("fff");
		var info = document.getElementById("info");
		info.innerHTML = "Passwords are different!";
		document.getElementById('submit').disabled = true;
		console.log("razlicna "+p1+" "+p2);
	}
	else{
		alert("gg");
		console.log("enaka "+p1+" "+p2);
		info.innerHTML = "Passwords are acceptable";
		//window.location = "login.html";
		
		document.getElementById('submit').disabled = false;
	}

}
*/
var idgoal = 0;


start();

function start(){

	var t = document.getElementById("tvalue");
	var s = document.getElementById("svalue");
	var w = document.getElementById("Wvalue");

	
	
	var oReq = new XMLHttpRequest();
	//oReq.addEventListener("load", goalsJson);
	oReq.addEventListener("load", accsJson);
	//oReq.open("GET", "goals.json");
	oReq.open("GET", "accs.json");
	oReq.responseType = "text";
	oReq.send();
	
	

	
	
	oReq = new XMLHttpRequest();
	oReq.addEventListener("load", goalsJson);

	oReq.open("GET", "goals.json");
	//console.log(oReq);
	oReq.responseType = "text";
	oReq.send();
	
	
}

function goalsJson(event){
	
	goals = JSON.parse(this.responseText);

	for(i in goals.goals){

		idgoal++;
		num = goals.goals[i].save;
		date = goals.goals[i].until;
		document.getElementById("idgoals").innerHTML += '<div id='+idgoal+' class="goal"><h4>Goal</h4><div class="goal-content">Save:<br>'+num+'&euro;<br>Until:<br>'+date+'</div><button onclick="deletethis('+idgoal+')" class="accbtn">Done</button></div>'

	}
}

function accsJson(event) {
	
	values = JSON.parse(this.responseText);

	document.getElementById("tvalue").innerHTML = values["t"]+" &euro;";
	document.getElementById("svalue").innerHTML = values["s"]+" &euro;";
	document.getElementById("wvalue").innerHTML = values["w"]+" &euro;";
}



function addgoal(){
	idgoal++;
	var num = document.getElementById("valueMoney").value;
	var date = document.getElementById("valueDate").value;
	
	if(num.length!=0 && date.length!=0){
		
		var oReq = new XMLHttpRequest();
		
		oReq.open("GET", "goals.json", false);
		oReq.send(null);
		var g = JSON.parse(oReq.responseText);
		//console.log(idgoal);
	
		//var newJson = JSON.stringify(goals.push({save:999,until:2017-1-31}))
		
		g.goals[idgoal-1] = {save:99,date:"2016-12-20"};
		
		JSON.stringify(g);
		//goals.goals[idgoal]["until"] = date;
		//console.log(g);
		document.getElementById("idgoals").innerHTML += '<div id='+idgoal+' class="goal"><h4>Goal</h4><div class="goal-content">Save:<br>'+num+'&euro;<br>Until:<br>'+date+'</div><button onclick="deletethis('+idgoal+')" class="accbtn">Done</button></div>'
	}
	/*else{
		alert("Enter all fields");
	}*/
}
function deletegoal(){
	var element = document.getElementById("goal");
	element.last().remove();
}
function deletethis(idgoal){
	var element = document.getElementById(idgoal);
	element.remove();
}

function hide(){
	var element = document.getElementById("formgoal");
	var goal = document.getElementById("addGoal");
	if(isElementHidden(element)){
		element.style.display = 'inline-block';
		goal.innerHTML = "Hide";
	}
	else{
		element.style.display = 'none';
		goal.innerHTML = "Show";
	}
	

	//element.style.visibility = 'visible'; 
}
 function isElementHidden (element) {
    return window.getComputedStyle(element, null).getPropertyValue('display') === 'none';
  }

  
var podatki = [100,350,260,480,120,1200,1000,400,530,330,100,230];
var max = Math.max.apply(Math, podatki);
function graph(){

 	

 	var canvas = document.getElementById("platno");
 	
 	var context = canvas.getContext("2d");




 	var w = canvas.width-40;
	var h = canvas.height-40;
	//console.log("visina h "+h+" sirina w "+w);

	context.clearRect(0, 0, canvas.width, canvas.height);

	context.strokeStyle = "#000000";

	context.beginPath();

	context.moveTo(20, h+20);
	context.lineTo(w+40, h+20);
	context.moveTo(20, h+20);
	context.lineTo(20, 20);

	var w1 = 17;
	var w2=w1;
	h2=h+20;
	y=0;

	context.font="12px Arial";
	context.fillText("Transaction account credit last 12 months",20 ,10);

	context.font="11px Arial";
	context.fillText("months",w/2 ,h+39);

	context.font="8px Arial";
	

	

	for(var i = 1; i <= 12; i++){
		context.fillText(i, w1, h+30);
		context.fillText(y, w2-15, h2);
		h2-=h/12;
		y+=max/12;
		console.log(y)
		w1+=w/11;
	}

	//context.rotate(-Math.PI/2);
	//context.fillText("money", 20, 20);
	//context.rotate(Math.PI/2);
	context.stroke();

	context.strokeStyle = "#375e7b";
	context.beginPath();

	for(var i=0; i < podatki.length-1; i++){
		//console.log(i);
		//console.log(max);
		context.moveTo(20+(i*w/11), h+20-(h*podatki[i]/max));
		//console.log(h-(h*podatki[i]/max)+" "+(i*w/11));

		i++;
		//console.log(i);
		context.lineTo((20+(i)*w/11), h+20-(h*podatki[i]/max));
		//console.log(h-(h*podatki[i]/max)+" "+((i)*w/11));
		i--;

	}
	
	context.stroke();
 }