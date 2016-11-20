
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

var idgoal = 2;

function addgoal(){
	idgoal++;
	var num = document.getElementById("valueMoney").value;
	var date = document.getElementById("valueDate").value;
	
	if(num.length!=0 && date.length!=0){
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