/* Halloween Puzzle Party — soft navigation
   Loads the next page's content into the current document instead of doing a
   full page reload. This keeps the <audio> element (and the ambient
   decorations) alive, so the background music never stops or stutters when
   you click a number / word / back button.

   Any page can still be opened directly; the URL is kept in sync via the
   History API. If fetching is not possible (e.g. opened from file://), it
   silently falls back to a normal page load. */
(function () {
  if (window.__hppNav) return;
  window.__hppNav = true;

  // nodes that must survive a content swap
  var PERSIST = ['audio', '.music-btn', 'canvas.amb',
                 '.amb-bat', '.amb-ghost', '.amb-spider', '.amb-pumpkin'];
  var SKIP = /^(SCRIPT|STYLE|LINK|META|TITLE|BASE)$/;

  function isInternalLink(a) {
    if (!a || !a.getAttribute) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    var raw = a.getAttribute('href') || '';
    if (!raw || raw.charAt(0) === '#') return false;
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return false;   // http:, mailto:, tel: ...
    if (raw.indexOf('//') === 0) return false;
    if (!/\.html([?#]|$)/i.test(raw)) return false;
    return true;
  }

  function swap(doc) {
    // mark the persistent nodes
    var keep = [];
    PERSIST.forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        el.__hppKeep = true;
        keep.push(el);
      });
    });
    // drop the old page content
    Array.prototype.slice.call(document.body.childNodes).forEach(function (n) {
      if (!n.__hppKeep) document.body.removeChild(n);
    });
    // insert the new page content (its scripts/styles are ignored)
    Array.prototype.slice.call(doc.body.childNodes).forEach(function (n) {
      if (n.nodeType === 1 && SKIP.test(n.tagName)) return;
      if (n.__hppKeep) return;
      document.body.appendChild(document.adoptNode(n));
    });
    if (doc.title) document.title = doc.title;
  }

  function activate() {
    window.scrollTo(0, 0);
    if (typeof window.__hppInitPuzzle === 'function') window.__hppInitPuzzle();
  }

  function load(url, push) {
    fetch(url, { credentials: 'same-origin', cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        swap(doc);
        if (push) {
          try { history.pushState({ hpp: url }, '', url); } catch (e) {}
        }
        activate();
      })
      .catch(function () {
        // file://, offline, or any error -> just navigate normally
        location.href = url;
      });
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!isInternalLink(a)) return;
    var url = a.href;
    if (url === location.href) { e.preventDefault(); return; }
    e.preventDefault();
    load(url, true);
  }, false);

  window.addEventListener('popstate', function () {
    load(location.href, false);
  });
})();
