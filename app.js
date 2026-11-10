/* The playable taster on the landing page.
 *
 * Deliberately not a port of the game: it runs one prompt at a time with no
 * clock, so a visitor can feel the Stroop effect in two taps without being
 * asked to learn anything. The real difficulty curve lives in the app.
 */
(function () {
  "use strict";

  var COLORS = [
    { name: "RED", hex: "#FF4D5E", ink: "#15122B" },
    { name: "BLUE", hex: "#3D8BFF", ink: "#FFFFFF" },
    { name: "GREEN", hex: "#2FD37A", ink: "#15122B" },
    { name: "YELLOW", hex: "#FFD23F", ink: "#15122B" },
    { name: "PURPLE", hex: "#A25BFF", ink: "#FFFFFF" },
    { name: "CYAN", hex: "#2EE6E6", ink: "#15122B" }
  ];

  var ruleEl = document.getElementById("rule");
  var wordEl = document.getElementById("word");
  var answersEl = document.getElementById("answers");
  var verdictEl = document.getElementById("verdict");
  if (!ruleEl || !wordEl || !answersEl || !verdictEl) return;

  var streak = 0;
  var best = 0;
  var round = null;

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function shuffled(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = copy[i];
      copy[i] = copy[j];
      copy[j] = t;
    }
    return copy;
  }

  function nextRound() {
    var options = shuffled(COLORS).slice(0, 4);
    var answer = pick(options);
    // An ink round every third prompt or so, which is roughly where the game
    // introduces them.
    var isInk = Math.random() < 0.35;
    var shown;
    if (isInk) {
      // The word names some other colour; the paint is the answer.
      shown = pick(options.filter(function (c) { return c !== answer; }));
      round = { answer: answer, word: shown.name, paint: answer.hex, ink: true };
    } else {
      var paint = Math.random() < 0.6
        ? pick(options.filter(function (c) { return c !== answer; }))
        : answer;
      round = { answer: answer, word: answer.name, paint: paint.hex, ink: false };
    }

    ruleEl.textContent = round.ink ? "TAP THE INK COLOR" : "TAP THE WORD";
    ruleEl.className = round.ink ? "rule ink" : "rule";
    wordEl.textContent = round.word;
    wordEl.style.color = round.paint;

    answersEl.innerHTML = "";
    options.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = c.name;
      b.style.background = c.hex;
      b.style.color = c.ink;
      b.addEventListener("click", function () { answer(c); });
      answersEl.appendChild(b);
    });
  }

  function answer(choice) {
    if (!round) return;
    if (choice === round.answer) {
      streak++;
      if (streak > best) best = streak;
      verdictEl.style.color = "#2FD37A";
      verdictEl.textContent = "Correct · streak " + streak;
    } else {
      streak = 0;
      verdictEl.style.color = "#FF6A7A";
      verdictEl.textContent =
        "That was " + choice.name + ". The answer was " + round.answer.name +
        (best ? " · best streak " + best : "");
    }
    nextRound();
  }

  nextRound();
  verdictEl.textContent = "Streak: 0";
})();
