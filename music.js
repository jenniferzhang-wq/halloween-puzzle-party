/* Halloween Puzzle Party — background music
   Loops "865678__qubodup__128bpm-ai-generated-fun-halloween-music-loop-for-wider-audiences"
   (music.ogg + music.m4a fallback) on every page.

   Notes:
   - Browsers block audio-with-sound until the visitor interacts, so we try to
     autoplay and otherwise start on the first click / tap / key press.
   - Playback position and mute state are kept in sessionStorage, so the loop
     keeps flowing seamlessly as you move between pages.
   - A small speaker button (bottom-right) lets you mute / unmute.               */
(function () {
  // If an audio element already exists and is ours, never create a second one.
  // (Soft navigation keeps the original element alive so the loop never breaks.)
  if (window.__hppMusic || document.getElementById('hpp-bgm')) return;
  window.__hppMusic = true;

  var KEY_TIME  = 'hpp_bgm_time';
  var KEY_MUTED = 'hpp_bgm_muted';
  var VOLUME    = 0.5;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    /* ---- inject button styles (works on every page, incl. self-contained ones) ---- */
    var css = document.createElement('style');
    css.textContent = [
      '.music-btn{position:fixed;right:18px;bottom:18px;z-index:60;',
      'width:48px;height:48px;border-radius:50%;display:flex;align-items:center;',
      'justify-content:center;font-size:20px;line-height:1;cursor:pointer;color:#f3ebff;',
      'background:rgba(29,16,54,.8);border:1px solid rgba(255,255,255,.15);',
      'box-shadow:0 10px 26px rgba(0,0,0,.45);-webkit-backdrop-filter:blur(8px);',
      'backdrop-filter:blur(8px);transition:transform .2s,border-color .2s,box-shadow .2s;}',
      '.music-btn:hover{transform:translateY(-2px) scale(1.06);border-color:rgba(255,138,61,.6);',
      'box-shadow:0 14px 32px rgba(0,0,0,.5),0 0 24px rgba(255,138,61,.35);}',
      '.music-btn.playing{animation:musicPulse 2.4s ease-in-out infinite;}',
      '@keyframes musicPulse{0%,100%{box-shadow:0 10px 26px rgba(0,0,0,.45);}',
      '50%{box-shadow:0 10px 26px rgba(0,0,0,.45),0 0 22px rgba(255,138,61,.5);}}',
      '@media (prefers-reduced-motion: reduce){.music-btn.playing{animation:none;}}'
    ].join('');
    document.head.appendChild(css);

    /* ---- audio element with both formats ---- */
    var audio = document.createElement('audio');
    audio.id = 'hpp-bgm';
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = VOLUME;

    var srcOgg = document.createElement('source');
    srcOgg.src = 'music.ogg';
    srcOgg.type = 'audio/ogg';
    var srcM4a = document.createElement('source');
    srcM4a.src = 'music.m4a';
    srcM4a.type = 'audio/mp4';
    audio.appendChild(srcOgg);
    audio.appendChild(srcM4a);
    document.body.appendChild(audio);

    var muted = sessionStorage.getItem(KEY_MUTED) === '1';

    /* ---- resume the loop where the previous page left off ---- */
    var saved = parseFloat(sessionStorage.getItem(KEY_TIME) || '0');
    function applyResume() {
      if (!isFinite(saved) || saved <= 0) return;
      var d = audio.duration;
      if (isFinite(d) && d > 0 && saved < d - 0.25) {
        try { audio.currentTime = saved; } catch (e) {}
      }
    }
    audio.addEventListener('loadedmetadata', applyResume);
    if (audio.readyState >= 1) applyResume();

    function saveTime() {
      try { sessionStorage.setItem(KEY_TIME, String(audio.currentTime || 0)); } catch (e) {}
    }
    setInterval(saveTime, 500);
    window.addEventListener('pagehide', saveTime);
    window.addEventListener('beforeunload', saveTime);

    /* ---- button ---- */
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'music-btn';
    document.body.appendChild(btn);

    function tryPlay() {
      if (muted) return;
      var p = audio.play();
      if (p && p.catch) p.catch(function () { /* blocked until user gesture */ });
    }

    function refreshBtn() {
      btn.textContent = muted ? '🔇' : '🔊';
      btn.setAttribute('aria-label', muted ? 'Unmute music' : 'Mute music');
      btn.title = muted ? 'Unmute music' : 'Mute music';
      btn.classList.toggle('playing', !muted && !audio.paused);
    }

    function setMuted(v) {
      muted = v;
      audio.muted = muted;
      try { sessionStorage.setItem(KEY_MUTED, muted ? '1' : '0'); } catch (e) {}
      refreshBtn();
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setMuted(!muted);
      if (!muted) tryPlay();
      refreshBtn();
    });

    audio.addEventListener('play', refreshBtn);
    audio.addEventListener('pause', refreshBtn);

    setMuted(muted);

    /* ---- unlock on the first real user gesture (anywhere but the button) ---- */
    function unlock(e) {
      if (e && e.target && e.target.closest && e.target.closest('.music-btn')) return;
      tryPlay();
      window.removeEventListener('pointerdown', unlock, true);
      window.removeEventListener('keydown', unlock, true);
      window.removeEventListener('touchstart', unlock, true);
    }
    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);
    window.addEventListener('touchstart', unlock, true);

    /* ---- optimistic autoplay attempt on load ---- */
    tryPlay();
  });
})();
