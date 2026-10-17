/* Halloween Puzzle Party — 3x3 image jigsaw
   Splits the page image into 9 equal tiles, shuffles them,
   and lets the player reassemble it by dragging or clicking two tiles to swap.
   When solved, a Halloween confetti burst plays. */
(function () {
  var N = 3;
  var TOTAL = N * N;

  // background-position for a given piece index (0..8) in a 3x3 layout
  function posFor(p) {
    var r = Math.floor(p / N), c = p % N;
    return (c * 50) + '% ' + (r * 50) + '%';
  }

  function shuffled() {
    var a = [];
    for (var i = 0; i < TOTAL; i++) a.push(i);
    for (var j = a.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var t = a[j]; a[j] = a[k]; a[k] = t;
    }
    return a;
  }

  function isSolved(a) {
    for (var i = 0; i < TOTAL; i++) if (a[i] !== i) return false;
    return true;
  }

  /* ---- celebration: emoji confetti + shockwave rings + flash ---- */
  function celebrate(box) {
    var rect = box.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;

    box.classList.add('flash');
    setTimeout(function () { box.classList.remove('flash'); }, 950);

    var canvas = document.createElement('canvas');
    canvas.className = 'fx';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;

    function size() {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();

    var emojis = ['🎃', '👻', '🦇', '🍬', '🕸️', '⭐', '✨', '🍭', '💀'];
    var sparks = ['#ffb347', '#ff8a3d', '#a45cff', '#ffd98a', '#f3ebff'];
    var parts = [];
    var COUNT = 110;
    for (var i = 0; i < COUNT; i++) {
      var ang = Math.random() * Math.PI * 2;
      var spd = 3 + Math.random() * 11;
      var isEmoji = Math.random() < 0.45;
      parts.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + (Math.random() - 0.5) * 60,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 3.5,
        g: 0.22 + Math.random() * 0.14,
        life: 1,
        decay: 0.007 + Math.random() * 0.011,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.35,
        size: isEmoji ? (18 + Math.random() * 24) : (2.5 + Math.random() * 4.5),
        emoji: isEmoji ? emojis[(Math.random() * emojis.length) | 0] : null,
        color: isEmoji ? null : sparks[(Math.random() * sparks.length) | 0]
      });
    }

    var rings = [{ r: 0, life: 1, delay: 0 }, { r: 0, life: 1, delay: 9 }];
    var t = 0;

    function frame() {
      t++;
      ctx.clearRect(0, 0, w, h);

      rings.forEach(function (rg) {
        if (t < rg.delay) return;
        rg.r += 15;
        rg.life -= 0.028;
        if (rg.life > 0) {
          ctx.beginPath();
          ctx.arc(cx, cy, rg.r, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,170,80,' + Math.max(0, rg.life * 0.75) + ')';
          ctx.lineWidth = 7 * rg.life + 1;
          ctx.shadowBlur = 26;
          ctx.shadowColor = 'rgba(255,150,60,.9)';
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      });

      var alive = 0;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (p.life <= 0) continue;
        alive++;
        p.vy += p.g;
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
        if (p.emoji) {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = p.size + 'px -apple-system,"Apple Color Emoji","Segoe UI Emoji",sans-serif';
          ctx.fillText(p.emoji, 0, 0);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 14;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.restore();
      }

      var ringsAlive = rings.some(function (rg) { return t >= rg.delay && rg.life > 0; });
      if (alive > 0 || ringsAlive || t < 45) {
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(frame);
  }

  function build(box) {
    var img = box.getAttribute('data-img');
    if (!img) return;
    if (box.querySelector('.tile')) return;   // already built (don't double-build)

    // pieces[slot] = which image piece sits in that slot
    var pieces = shuffled();
    var guard = 0;
    while (isSolved(pieces) && guard++ < 30) pieces = shuffled();

    var tiles = [];
    for (var s = 0; s < TOTAL; s++) {
      var t = document.createElement('div');
      t.className = 'tile';
      t.dataset.slot = s;
      t.style.backgroundImage = 'url("' + img + '")';
      t.style.backgroundSize = (N * 100) + '% ' + (N * 100) + '%';
      tiles.push(t);
      box.appendChild(t);
    }

    var selected = null;
    var wasSolved = false;

    function render() {
      for (var s = 0; s < TOTAL; s++) {
        tiles[s].style.backgroundPosition = posFor(pieces[s]);
      }
      box.dataset.pieces = pieces.join(',');
      var solved = isSolved(pieces);
      box.classList.toggle('solved', solved);
      if (solved && !wasSolved) celebrate(box);
      wasSolved = solved;
    }

    function swap(a, b) {
      if (a === b || a == null || b == null) return;
      var tmp = pieces[a]; pieces[a] = pieces[b]; pieces[b] = tmp;
      render();
    }

    function clearSel() {
      if (selected != null && tiles[selected]) tiles[selected].classList.remove('sel');
      selected = null;
    }

    tiles.forEach(function (t) {
      var slot = +t.dataset.slot;

      // click / tap: pick one, then another, to swap
      t.addEventListener('click', function () {
        if (box.classList.contains('solved')) return;
        if (selected === null) {
          selected = slot;
          t.classList.add('sel');
        } else if (selected === slot) {
          clearSel();
        } else {
          var a = selected;
          clearSel();
          swap(a, slot);
        }
      });

      // drag & drop: drop onto another tile to swap
      t.setAttribute('draggable', 'true');
      t.addEventListener('dragstart', function (e) {
        if (box.classList.contains('solved')) { e.preventDefault(); return; }
        e.dataTransfer.setData('text/plain', String(slot));
        e.dataTransfer.effectAllowed = 'move';
        t.classList.add('dragging');
        clearSel();
      });
      t.addEventListener('dragend', function () { t.classList.remove('dragging'); });
      t.addEventListener('dragover', function (e) { e.preventDefault(); t.classList.add('over'); });
      t.addEventListener('dragleave', function () { t.classList.remove('over'); });
      t.addEventListener('drop', function (e) {
        e.preventDefault();
        t.classList.remove('over');
        var from = parseInt(e.dataTransfer.getData('text/plain'), 10);
        swap(from, slot);
      });
    });

    render();
  }

  function init() {
    var boxes = document.querySelectorAll('.puzzle[data-img]');
    for (var i = 0; i < boxes.length; i++) build(boxes[i]);
  }

  // exposed so soft navigation (nav.js) can rebuild puzzles without reloading
  window.__hppInitPuzzle = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
