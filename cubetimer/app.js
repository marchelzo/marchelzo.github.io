"use strict";

function randomTurn() {
  var faces = ['F', 'R', 'U', 'L', 'D', 'B'];
  var face = faces[Math.floor(Math.random() * faces.length)];
  if (randomTurn.previous && face === randomTurn.previous) return randomTurn();
  
  if (randomTurn.both) {
    switch (randomTurn.both) {
      case 'U':
        if (face == 'U' || face == 'D') return randomTurn();
        break;
      case 'R':
        if (face == 'R' || face == 'L') return randomTurn();
        break;
      case 'F':
        if (face == 'F' || face == 'B') return randomTurn();
        break;
    }
  }
  
  if      (face == 'U' && randomTurn.previous == 'D') randomTurn.both = 'U';
  else if (face == 'D' && randomTurn.previous == 'U') randomTurn.both = 'U';
  else if (face == 'R' && randomTurn.previous == 'L') randomTurn.both = 'R';
  else if (face == 'L' && randomTurn.previous == 'R') randomTurn.both = 'R';
  else if (face == 'F' && randomTurn.previous == 'B') randomTurn.both = 'F';
  else if (face == 'B' && randomTurn.previous == 'F') randomTurn.both = 'F';
  else                                                randomTurn.both = undefined;
 
  randomTurn.previous = face;
  
  if (Math.random() > 0.5) {
    if (Math.random() > 0.5)
      face += '\'';
    else
      face += '2';
  }
  return face;
}
randomTurn.previous = null;

function randomScramble() {
  var scramble = randomTurn();
  for (var i = 0; i < 24; ++i)
    scramble += ' ' + randomTurn();
  return scramble;
}

function Timer() {
  this.start = +new Date();
  
  this.elapsed = function () {
    return new Date() - this.start;
  };
  
  this.reset = function () {
    this.start = +new Date();
  };
}

function Scoreboard() {
  this.scores = [];

  this.max = arguments[0] || 5;

  this.render = function (list) {

    // remove old entries
    while (list.firstChild) list.removeChild(list.firstChild);

    // the top entry is the mean solve time
    var meanEntry = document.createElement("li");
    var meanTime = this.scores.reduce(function(a,b){return a+b;}, 0) / this.scores.length;
    if (meanTime === meanTime)
      meanEntry.innerHTML = "Mean solve: " + meanTime.toFixed(3) + "s";
    else
      meanEntry.innerHTML = "Mean solve: No solves";
    list.appendChild(meanEntry);


    var fastest, fastestTime;
    for (var i = this.scores.length - 1; i >= 0; --i) {
      if (this.scores.length - i == this.max) break;
      var score = document.createElement("li");
      score.setAttribute("data-idx", i);
      score.innerHTML = this.scores[i].toFixed(3) + "s";
      list.appendChild(score);

      // keep track of the fastest time (for styling)
      if (!fastestTime || this.scores[i] < fastestTime) {
        fastestTime = this.scores[i];
        fastest = score;
      }

      // add on-click event to remove from score list
      var _this = this;
      score.addEventListener("click", function () {
        _this.scores.splice(this.getAttribute("data-idx"), 1);
      });
    }

    // identify the fastest entry (for styling)
    if (fastest)
      fastest.setAttribute("class", "fastest");

  }

  this.add = function (score) {
    this.scores.push(score);
  }

  this.reset = function () {
    this.scores = [];
  }

  this.removeLast = function () {
    this.scores.pop();
  }

  this.lastScore = function () {
    if (this.scores.length == 0)
      return 0.0;
    else
      return this.scores[this.scores.length - 1];
  }
}

var running = false;
var recentlyStopped = false;
var timer = new Timer();
var time = document.getElementById("time");
var scores = document.getElementById("solves").children[0];
var scoreboard = new Scoreboard(100);

window.addEventListener("keyup", function (e) {
  if (recentlyStopped) {
    recentlyStopped = false;
    scramble.innerHTML = randomScramble();
    return;
  }
  if (e.which == 32) {
    timer.reset();
    running = true;
  }
});

time.addEventListener("touchend", function () {
  if (recentlyStopped) {
    recentlyStopped = false;
    scramble.innerHTML = randomScramble();
    return;
  }
  timer.reset();
  running = true;
});

time.addEventListener("touchstart", function () {
  if (running) {
    running = false;
    recentlyStopped = true;
    scoreboard.add(parseFloat(time.innerHTML));
    scoreboard.render(scores);
  }
});

window.addEventListener("keydown", function (e) {
  if (e.which == 32 && running) {
    running = false;
    recentlyStopped = true;
    scoreboard.add(parseFloat(time.innerHTML));
    scoreboard.render(scores);
  } else if (e.which == "R".charCodeAt(0)) {
    scoreboard.reset();
    scoreboard.render(scores);
    time.innerHTML = "0.0s";
  } else if (e.which == "X".charCodeAt(0)) {
    scoreboard.removeLast();
    scoreboard.render(scores);
    time.innerHTML = scoreboard.lastScore().toFixed(3) + "s";
  }
}); 

window.setInterval(function () {
  if (!running) return;
  time.innerHTML = (timer.elapsed() / 1000).toFixed(3) + "s";
}, 10);

scramble.innerHTML = randomScramble();
scoreboard.render(scores);

// re-render the score-list on click
scores.addEventListener("click", function () {
  scoreboard.render(scores);
  time.innerHTML = scoreboard.lastScore().toFixed(3) + "s";
});
