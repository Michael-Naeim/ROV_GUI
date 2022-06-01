// 1st range
const slider = document.querySelector(".range_for_slide");
const value1 = document.querySelector("#value_micro");

let status = 'Stopped';
let seconds = 0;
let minutes = 0;
let hours = 0;

let displaySeconds = 0;
let displayMinutes = 0;
let displayHours =  0;

let interval = '';

value1.textContent = slider.value;
slider.oninput = function() {
    if(value1.textContent < 0){
        value1.style.color = "Red";
    }else if (value1.textContent  > 0){
        value1.style.color = "Green";
    }
    value1.textContent = this.value;
}
    

// 2nd slider
const slider2 = document.querySelector(".v2");
const value2 = document.querySelector(".v2-3");

value2.textContent = slider2.value;
slider2.oninput = function() {
    
    if(value2.textContent<0){
        value2.textContent = this.value;
        value2.style.color = 'Red';
    }else if (value2.textContent>0){
        value2.textContent = this.value;
        value2.style.color = 'Green';
    }else if(value2.textContent == 0){
        value2.textContent = this.value;
    }
}

// 3rd slider in the first column
const slider3 = document.querySelector("#third_range");
const value3 = document.querySelector("#third_value");

value3.textContent = slider2.value;
slider3.oninput = function() {
    
    if(value3.textContent<0){
        value3.textContent = this.value;
        value3.style.color = 'Red';
    }else if (value3.textContent>0){
        value3.textContent = this.value;
        value3.style.color = 'Green';
    }else if(value3.textContent == 0){
        value3.textContent = this.value;
    }
}

// 4th row
const slider4 = document.querySelector("#s3-1");
const value4 = document.querySelector("#s3-v1");

value4.textContent = slider2.value;
slider4.oninput = function() {
    
    if(value4.textContent<0){
        value4.textContent = this.value;
        value4.style.color = 'Red';
    }else if (value4.textContent>0){
        value4.textContent = this.value;
        value4.style.color = 'Green';
    }else if(value4.textContent == 0){
        value4.textContent = this.value;
    }
}

// 5th item
const slider5 = document.querySelector("#s3-2");
const value5 = document.querySelector("#s3-v2");

value5.textContent = slider2.value;
slider5.oninput = function() {
    
    if(value5.textContent<0){
        value5.textContent = this.value;
        value5.style.color = 'Red';
    }else if (value5.textContent>0){
        value5.textContent = this.value;
        value5.style.color = 'Green';
    }else if(value5.textContent == 0){
        value5.textContent = this.value;
    }
}

// 6th item
const slider6 = document.querySelector("#s3-3");
const value6 = document.querySelector("#s3-v3");

value6.textContent = slider2.value;
slider6.oninput = function() {
    
    if(value6.textContent<0){
        value6.textContent = this.value;
        value6.style.color = 'Red';
    }else if (value6.textContent>0){
        value6.textContent = this.value;
        value6.style.color = 'Green';
    }else if(value6.textContent == 0){
        value6.textContent = this.value;
    }
}

// 7th item
const slider7 = document.querySelector("#s3-4");
const value7 = document.querySelector("#s3-v4");

value7.textContent = slider2.value;
slider7.oninput = function() {
    
    if(value7.textContent<0){
        value7.textContent = this.value;
        value7.style.color = 'Red';
    }else if (value7.textContent>0){
        value7.textContent = this.value;
        value7.style.color = 'Green';
    }else if(value7.textContent == 0){
        value7.textContent = this.value;
    }
}


// 8th item
const slider8 = document.querySelector("#s3-5");
const value8 = document.querySelector("#s3-v5");

value8.textContent = slider2.value;
slider8.oninput = function() {
    
    if(value8.textContent<0){
        value8.textContent = this.value;
        value8.style.color = 'Red';
    }else if (value8.textContent>0){
        value8.textContent = this.value;
        value8.style.color = 'Green';
    }else if(value8.textContent == 0){
        value8.textContent = this.value;
    }
}

// 9th item
const slider9 = document.querySelector("#s3-6");
const value9 = document.querySelector("#s3-v6");

value9.textContent = slider2.value;
slider9.oninput = function() {
    
    if(value9.textContent<0){
        value9.textContent = this.value;
        value9.style.color = 'Red';
    }else if (value9.textContent>0){
        value9.textContent = this.value;
        value9.style.color = 'Green';
    }else if(value9.textContent == 0){
        value9.textContent = this.value;
    }
}

// currently not used

// // add and subtract

//     var box = document.getElementById('numy')
//     var next = document.querySelector('.next')
//     var prev = document.querySelector('.prev')

//     box.textContent = 0;
//     next.onclick = function(){
//         box.textContent++;
//         box.style.color = "#c24d2c";
//     }
//     prev.onclick = function(){
//         box.textContent--;
//     }

// //second element

//     var box2 = document.getElementById('numy2')
//     var next2 = document.querySelector('.next-1')
//     var prev2= document.querySelector('.prev-1')

//     box2.textContent = 0;
//     next2.onclick = function(){
//         box2.textContent++;
//         box2.style.color = "#c24d2c";
//     }
//     prev2.onclick = function(){
//         box2.textContent--;
//     }



// identify first-second and third show to show item when click a button (related to controls including PID Factors and that stuff)
const PID_FACTORS = document.getElementById("PID_FACTORS");
const Buttons = document.getElementById("Buttons");

// items that we will make it appear when clicking on a specific buttons
PID_FACTORS.addEventListener('click', (e)=>{
    // show only first
    document.getElementById("first_show").classList.toggle("show");

    document.getElementById("first_show").classList.toggle("hide");

    document.getElementById("second_show").classList.remove("show");
    document.getElementById("second_show").classList.add("hide");

    if(document.getElementById("bluring").classList.contains("blur")){
        document.getElementById("bluring").classList.remove("blur")
    }else{
        document.getElementById("bluring").classList.add("blur")
    }

})


Buttons.addEventListener('click', (e)=>{
    // show only second
    document.getElementById("first_show").classList.remove("show");
    document.getElementById("first_show").classList.add("hide");

    document.getElementById("second_show").classList.toggle("show");
    document.getElementById("second_show").classList.toggle("hide");

    // some blur in the background 
    if(document.getElementById("second_show").classList.contains("show")){
        document.getElementById("bluring").classList.add("blur")
    }else{
        document.getElementById("bluring").classList.remove("blur")
    }
    
})

// un blur the background of the GUI

if(document.getElementById("first_show").classList.contains("hide") && document.getElementById("second_show").classList.contains("hide") ){
    document.getElementById("bluring").classList.remove("blur")
}



// add and subtract in the PID FACTOR
var el1_ne0 = document.querySelector('.el1_ne0')
var el1_ne1 = document.querySelector('.el1_ne1')
var el1_ne2 = document.getElementById('el1_ne2')

el1_ne2.textContent = 0;
el1_ne0.onclick = function(){
    el1_ne2.textContent++;
    el1_ne2.style.color = "#c24d2c";
}
el1_ne1.onclick = function(){
    el1_ne2.textContent--;
}

// second element
var el2_ne0 = document.querySelector('.el2_ne0')
var el2_ne1 = document.querySelector('.el2_ne1')
var el2_ne2 = document.getElementById('el2_ne2')

el2_ne2.textContent = 0;
el2_ne0.onclick = function(){
    el2_ne2.textContent++;
    el2_ne2.style.color = "#c24d2c";
}
el2_ne1.onclick = function(){
    el2_ne2.textContent--;
}

// timer


function StartWatch()
{
	seconds++;

	if(seconds/60 === 1)
	{
		seconds=0;
		minutes++;

		if(minutes/60 === 1)
		{
			minutes=0;
			hours++;
		}
	}

	if(seconds < 10 )
	{
		displaySeconds = '0' + seconds.toString();
	}
	else
	{
		displaySeconds = seconds;
	}

	if(minutes < 10 )
	{
		displayMinutes = '0' + minutes.toString();
	}
	else
	{
		displayMinutes = minutes;
	}

	if(hours < 10 )
	{
		displayHours = '0' + hours.toString();
	}
	else
	{
		displayHours = hours;
	}

	document.getElementById('display').innerHTML = displayHours + ":" + displayMinutes + ":" + displaySeconds;
}

function startStop()
{
	if(status == 'Stopped')
	{
		interval = window.setInterval(StartWatch,1000);
		document.getElementById('handler').innerHTML = 'Stop';
		status = 'Started';
	} 
	else if(status == 'Started')
	{
		window.clearInterval(interval);
		document.getElementById('handler').innerHTML = 'Start';
		status = 'Stopped';
	}
}

function Reset()
{
	seconds = 0;
	hours = 0;
	minutes = 0;
	window.clearInterval(interval);
	document.getElementById('display').innerHTML = '00:00:00';
	document.getElementById('handler').innerHTML = 'Start';
	status = 'Stopped';
}

// stopwatch - countdown colors
const stopwatch = document.getElementById("stopwatch");
stopwatch.addEventListener('click', ()=>{
    document.getElementById("stopwatch_1").classList.add("show");
    document.getElementById("stopwatch_2").classList.add("show");
    document.getElementById("stopwatch_3").classList.add("show");
   
    document.getElementById("stopwatch_4").style.display="flex !important";
    // remove hide
    document.getElementById("stopwatch_1").classList.remove("hide");
    document.getElementById("stopwatch_2").classList.remove("hide");
    document.getElementById("stopwatch_3").classList.remove("hide");
    document.getElementById("stopwatch_4").classList.remove("hide");
    document.querySelector(".StopwatchORCountdown").classList.add("hide");

})


// Count_Down
const start_btn = document.getElementById("handler_2");



// start
start_btn.addEventListener('click', (e)=>{
    
    let  displayMinutes2 = parseInt(document.querySelector(".range_1_value").value);
    let displaySeconds2 = parseInt(document.querySelector(".range_2_value").value);
    
    var time = setInterval(function (){
        document.querySelector(".range_1_value").style.border = "3px solid #f4fbff";
        document.querySelector(".range_2_value").style.border = "3px solid #f4fbff";
        displaySeconds2= displaySeconds2 -1;

        if(displaySeconds2 == -1){
            displayMinutes2--;
            displaySeconds2= 59;
        }
    
        if(displayMinutes2 == -1){
            displaySeconds2 =0;
            displayMinutes2= 0;
        }
        document.getElementById('no_1').textContent =  displayMinutes2;
        document.getElementById('no_2').textContent =  displaySeconds2;}, 1000);

    document.getElementById("reset_2").addEventListener("click", ()=>{
        clearInterval(time)
        document.getElementById('no_1').textContent =  00;
        document.getElementById('no_2').textContent =  00;
        
    })
})


// function timer(){
    
    
// }

// CountDown show
document.getElementById("Countdown").addEventListener("click", ()=>{
    document.querySelector(".countdown").classList.add("show");
    document.querySelector(".countdown").classList.remove("hide");
    document.querySelector(".StopwatchORCountdown").classList.add("hide");
    document.querySelector(".StopwatchORCountdown").classList.remove("show");
})

// switch to stopwatch
document.getElementById("stopwatch_switch").addEventListener("click",()=>{
    document.querySelector(".countdown").classList.remove("show");
    document.querySelector(".countdown").classList.add("hide");
    // show actual stopwatch
    document.getElementById("stopwatch_1").classList.add("show");
    document.getElementById("stopwatch_2").classList.add("show");
    document.getElementById("stopwatch_3").classList.add("show");


   
    document.getElementById("stopwatch_4").style.display="flex !important";
    // remove hide
    document.getElementById("stopwatch_1").classList.remove("hide");
    document.getElementById("stopwatch_2").classList.remove("hide");
    document.getElementById("stopwatch_3").classList.remove("hide");
    document.getElementById("stopwatch_4").classList.remove("hide");
})


document.getElementById("countDown_switch").addEventListener("click",()=>{
    document.querySelector(".countdown").classList.add("show");
    document.querySelector(".countdown").classList.remove("hide");
    // show actual stopwatch
    document.getElementById("stopwatch_1").classList.remove("show");
    document.getElementById("stopwatch_2").classList.remove("show");
    document.getElementById("stopwatch_3").classList.remove("show");
   
    // remove hide
    document.getElementById("stopwatch_1").classList.add("hide");
    document.getElementById("stopwatch_2").classList.add("hide");
    document.getElementById("stopwatch_3").classList.add("hide");
    document.getElementById("stopwatch_4").classList.add("hide");
})
// Our calculation for the fish section
document.getElementById("calculate").addEventListener("click", ()=>{
    document.getElementById("claculated_num").textContent = document.getElementById("first_n").value * document.getElementById("fourth_n").value * Math.pow(document.getElementById("third_n").value, document.getElementById("second_n").value) 
})



// replacing speed + and  - with    --> Slider
const slider100 = document.getElementById("i_100");
const value100 = document.getElementById("v_100");

value100.textContent = slider100.value;
slider100.oninput = function() {
    
    if(value100.textContent<0){
        value100.textContent = this.value;
        value100.style.color = 'Red';
    }else if (value100.textContent>0){
        value100.textContent = this.value;
        value100.style.color = 'Green';
    }else if(value100.textContent == 0){
        value100.textContent = this.value;
    }
}

// second slider
const slider200 = document.getElementById("i_200");
const value200 = document.getElementById("v_200");

value200.textContent = slider200.value;
slider200.oninput = function() {
    
    if(value200.textContent<0){
        value200.textContent = this.value;
        value200.style.color = 'Red';
    }else if (value200.textContent>0){
        value200.textContent = this.value;
        value200.style.color = 'Green';
    }else if(value200.textContent == 0){
        value200.textContent = this.value;
    }
}