/* Halloween Puzzle Party — ambient background
   Adds twinkling stars, rising embers, flying bats, floating ghosts
   and a hanging spider to every party page. Purely decorative
   (pointer-events:none) so it never blocks clicks or dragging. */
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    /* ---- canvas: stars + embers ---- */
    var canvas = document.createElement('canvas');
    canvas.className = 'amb';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, stars = [], embers = [];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      var ns = Math.min(130, Math.floor(w / 12));
      stars = [];
      for (var i = 0; i < ns; i++) {
        stars.push({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 1.3 + 0.3, a: Math.random(),
          s: Math.random() * 0.02 + 0.004
        });
      }
      embers = [];
      for (var j = 0; j < 20; j++) {
        embers.push({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 2.2 + 0.8,
          vy: -(Math.random() * 0.42 + 0.18),
          vx: (Math.random() - 0.5) * 0.3,
          a: Math.random() * 0.4 + 0.25
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.a += s.s; if (s.a > 1 || s.a < 0.2) s.s *= -1;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283);
        ctx.fillStyle = 'rgba(255,245,225,' + (s.a * 0.8) + ')';
        ctx.fill();
      }
      for (var k = 0; k < embers.length; k++) {
        var e = embers[k];
        e.y += e.vy; e.x += e.vx;
        if (e.y < -10) { e.y = h + 10; e.x = Math.random() * w; }
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, 6.283);
        ctx.fillStyle = 'rgba(255,168,80,' + e.a + ')';
        ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(255,150,60,.9)';
        ctx.fill(); ctx.shadowBlur = 0;
      }
      requestAnimationFrame(draw);
    }

    resize(); draw();
    window.addEventListener('resize', resize);

    /* ---- flying bats ---- */
    for (var b = 0; b < 3; b++) {
      var bat = document.createElement('div');
      bat.className = 'amb-bat';
      bat.textContent = '🦇';
      bat.style.top = (6 + Math.random() * 46) + 'vh';
      bat.style.fontSize = (14 + Math.random() * 12) + 'px';
      bat.style.animationDuration = (18 + Math.random() * 16) + 's';
      bat.style.animationDelay = (-Math.random() * 22) + 's';
      document.body.appendChild(bat);
    }

    /* ---- floating ghosts ---- */
    var ghosts = [
      { top: '20vh', left: '6vw',  size: '26px' },
      { top: '74vh', left: '88vw', size: '30px' }
    ];
    ghosts.forEach(function (g, i) {
      var el = document.createElement('div');
      el.className = 'amb-ghost';
      el.textContent = '👻';
      el.style.top = g.top; el.style.left = g.left;
      el.style.fontSize = g.size;
      el.style.animationDelay = (-i * 2.5) + 's';
      document.body.appendChild(el);
    });

    /* ---- hanging spider ---- */
    var spider = document.createElement('div');
    spider.className = 'amb-spider';
    spider.innerHTML = '<div class="thread"></div><span>🕷️</span>';
    document.body.appendChild(spider);

    /* ---- two dancing pumpkins (bottom corners) ---- */
    ['left', 'right'].forEach(function (side) {
      var pk = document.createElement('div');
      pk.className = 'amb-pumpkin ' + side;
      pk.textContent = '🎃';
      document.body.appendChild(pk);
    });
  });
})();
