
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