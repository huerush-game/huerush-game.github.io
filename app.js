// Scroll reveal, plus a small playable version of the game's core rule.
(function () {
  document.documentElement.classList.add('js');

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('seen');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('seen'); });
  }

  // Same order and values as GameColor: the first four are the most distinct.
  var COLORS = [
    { name: 'RED', c: '#FF4D5E', shade: '#C21F32', on: '#15122B' },
    { name: 'BLUE', c: '#3D8BFF', shade: '#1C5BC2', on: '#15122B' },
    { name: 'GREEN', c: '#2FD37A', shade: '#14964F', on: '#15122B' },
    { name: 'YELLOW', c: '#FFD23F', shade: '#C79A0A', on: '#15122B' },
    { name: 'ORANGE', c: '#FF8A2B', shade: '#C75A06', on: '#15122B' },
    { name: 'PURPLE', c: '#A25BFF', shade: '#6D2CC9', on: '#15122B' },
    { name: 'PINK', c: '#FF5FBF', shade: '#C72B89', on: '#15122B' },
    { name: 'CYAN', c: '#2EE6E6', shade: '#0FA3A3', on: '#15122B' }
  ];

  var el = {
    rule: document.getElementById('rule'),
    streak: document.getElementById('streak'),
    bar: document.getElementById('bar'),
    word: document.getElementById('word'),
    answers: document.getElementById('answers'),
    over: document.getElementById('over'),
    overTitle: document.getElementById('overTitle'),
    overText: document.getElementById('overText'),
    again: document.getElementById('again')
  };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var streak = 0;
  var timer = null;
  var barAnim = null;

  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function stopTimer() {
    clearTimeout(timer);
    if (barAnim) { barAnim.cancel(); barAnim = null; }
  }

  function startTimer(ms, answer) {
    if (!reduceMotion && el.bar.animate) {
      barAnim = el.bar.animate(
        [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
        { duration: ms, fill: 'forwards' }
      );
    }
    timer = setTimeout(function () { finish('Too slow!', answer); }, ms);
  }

  function round() {
    var palette = COLORS.slice(0, streak >= 5 ? COLORS.length : 4);
    var word = pick(palette);
    var ink = pick(palette.filter(function (c) { return c !== word; }));
    // From a streak of 3, some rounds ask for the ink instead of the word.
    var askInk = streak >= 3 && Math.random() < 0.5;
    var answer = askInk ? ink : word;

    el.rule.textContent = askInk ? 'Tap the ink' : 'Tap the word';
    el.word.textContent = word.name;
    el.word.style.color = ink.c;
    el.word.style.setProperty('--shade', ink.shade);
    el.word.classList.remove('pop');
    void el.word.offsetWidth;
    el.word.classList.add('pop');

    var others = shuffle(palette.filter(function (c) { return c !== word && c !== ink; })).slice(0, 2);
    el.answers.textContent = '';
    shuffle([word, ink].concat(others)).forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = c.name;
      b.style.background = c.c;
      b.style.color = c.on;
      b.addEventListener('click', function () {
        stopTimer();
        if (c === answer) {
          streak++;
          el.streak.textContent = streak;
          round();
        } else {
          finish('Tricked!', answer);
        }
      });
      el.answers.appendChild(b);
    });

    // The first round waits for the player; the clock starts after that.
    if (streak > 0) startTimer(Math.max(1400, 3200 - streak * 120), answer);
  }

  function finish(title, answer) {
    stopTimer();
    el.overTitle.textContent = title;
    el.overText.textContent = 'The answer was ' + answer.name + '. Your streak: ' + streak + '.';
    el.over.hidden = false;
    el.again.focus({ preventScroll: true });
  }

  el.again.addEventListener('click', function () {
    streak = 0;
    el.streak.textContent = '0';
    el.over.hidden = true;
    round();
  });

  round();
})();
