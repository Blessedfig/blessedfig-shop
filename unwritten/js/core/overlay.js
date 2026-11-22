"use strict";
// ---------- a page over the whole game window (Nov 13): the arcade's frame, reused for the Palace's projector and the law
// library. One bar: back to the town, the page's own title, and an optional link. Esc and arcadeClose() close it. ----------
function pageShow(src, title, link) {
  if (ARCADE) return;
  const w = document.createElement('div'); w.id = 'arcade';
  w.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000;display:flex;flex-direction:column;font:14px system-ui,sans-serif';
  const bar = document.createElement('div'); bar.style.cssText = 'display:flex;align-items:center;gap:10px;padding:6px 10px;background:#1c1e26;color:#e8e8f0';
  const back = document.createElement('button'); back.textContent = '◀ Back to Antigo';
  back.style.cssText = 'font:inherit;min-height:36px;padding:6px 12px;border:0;border-radius:6px;background:#3a6ad0;color:#fff;cursor:pointer';
  const name = document.createElement('span'); name.textContent = title; name.style.cssText = 'flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis';
  bar.append(back, name);
  if (link) { const a = document.createElement('a'); a.textContent = link[0]; a.href = link[1]; a.target = '_blank'; a.rel = 'noopener'; a.style.color = '#9ec8ff'; bar.append(a); }
  const fr = document.createElement('iframe'); fr.src = src; fr.allow = 'autoplay; fullscreen'; fr.style.cssText = 'flex:1;border:0;width:100%;background:#000';
  fr.addEventListener('load', () => { try { fr.contentWindow.focus(); } catch (e) { } });
  w.append(bar, fr); document.body.appendChild(w); ARCADE = w;
  back.onclick = arcadeClose;
  setTimeout(() => { try { fr.focus(); } catch (e) { } }, 300);
}
