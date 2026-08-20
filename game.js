(function () {
  'use strict';

  var canvas = document.getElementById('c');
  var ctx = canvas.getContext('2d');
  var W = 600;
  var H = 220;
  var GROUND_Y = H - 12;
  var BIRD_X = 90;
  var isTouch = 'ontouchstart' in window;

  var G = {
    ' ': [0, 0, 0, 0, 0, 0, 0],
    'A': [14, 17, 17, 31, 17, 17, 17],
    'B': [30, 17, 17, 30, 17, 17, 30],
    'C': [14, 17, 16, 16, 16, 17, 14],
    'D': [30, 17, 17, 17, 17, 17, 30],
    'E': [31, 16, 16, 30, 16, 16, 31],
    'F': [31, 16, 16, 30, 16, 16, 16],
    'G': [14, 17, 16, 23, 17, 17, 15],
    'H': [17, 17, 17, 31, 17, 17, 17],
    'I': [14, 4, 4, 4, 4, 4, 14],
    'J': [7, 2, 2, 2, 18, 18, 12],
    'K': [17, 18, 20, 24, 20, 18, 17],
    'L': [16, 16, 16, 16, 16, 16, 31],
    'M': [17, 27, 21, 21, 17, 17, 17],
    'N': [17, 25, 21, 19, 17, 17, 17],
    'O': [14, 17, 17, 17, 17, 17, 14],
    'P': [30, 17, 17, 30, 16, 16, 16],
    'Q': [14, 17, 17, 17, 21, 18, 13],
    'R': [30, 17, 17, 30, 20, 18, 17],
    'S': [15, 16, 16, 14, 1, 1, 30],
    'T': [31, 4, 4, 4, 4, 4, 4],
    'U': [17, 17, 17, 17, 17, 17, 14],
    'V': [17, 17, 17, 17, 10, 10, 4],
    'W': [17, 17, 17, 21, 21, 27, 17],
    'X': [17, 17, 10, 4, 10, 17, 17],
    'Y': [17, 17, 10, 4, 4, 4, 4],
    'Z': [31, 1, 2, 4, 8, 16, 31],
    '0': [14, 17, 19, 21, 25, 17, 14],
    '1': [4, 12, 4, 4, 4, 4, 14],
    '2': [14, 17, 1, 6, 8, 16, 31],
    '3': [31, 2, 4, 14, 1, 17, 14],
    '4': [2, 6, 10, 18, 31, 2, 2],
    '5': [31, 16, 30, 1, 1, 17, 14],
    '6': [6, 8, 16, 30, 17, 17, 14],
    '7': [31, 1, 2, 4, 8, 8, 8],
    '8': [14, 17, 17, 14, 17, 17, 14],
    '9': [14, 17, 17, 15, 1, 2, 12]
  };

  var BIRD_A = [
    '........1111....',
    '.......111111...',
    '..1111..11111111',
    '..1111..111.1111',
    '...111.1111111111',
    '..1111.1111111111',
    '.11111.1111111111',
    '.11111111111111..',
    '..111111111111..',
    '...11111111111..',
    '.....1111111.....',
    '.......11........'
  ];
  var BIRD_B = [
    '........1111....',
    '.......111111...',
    '......11111111..',
    '......111.1111..',
    '...111.1111111111',
    '..1111.1111111111',
    '.11111.1111111111',
    '.11111111111111..',
    '..111111111111..',
    '...11111111111..',
    '.....1111111.....',
    '.......11........'
  ];

  var PTERO_A = [
    '.11...........11',
    '1111.........111',
    '111111.......11.',
    '.111111.....11..',
    '..11111....11...',
    '...1111...11....',
    '....111..11.....',
    '....111111......',
    '.....1111.......',
    '.....11.11......',
    '.......1.1......',
    '................'
  ];
  var PTERO_B = [
    '................',
    '................',
    '.11111.....11111',
    '1111111...111111',
    '11111111.111111.',
    '111111111111111.',
    '.1111111111111..',
    '..11111111111...',
    '...11111111.....',
    '....1111.1......',
    '.....11.1.......',
    '................'
  ];

  var state = 'title';
  var score = 0;
  var prevScore = 0;
  var blinkT = 0;
  var toneOsc = null;
  var toneGain = null;
  var dist = 0;
  var held = false;
  var hi = 0;
  try { hi = parseInt(localStorage.getItem('flappyDinoHi') || '0', 10) || 0; } catch (e) {}
  var playTime = 0;
  var t = 0;
  var deathT = 0;
  var birdY = GROUND_Y - 12;
  var vy = 0;
  var pipes = [];
  var pteros = [];
  var lastOb = null;
  var lastCenter = 110;
  var clouds = [];
  var cloudT = 0;
  var groundOff = 0;
  var trail = [];
  var trailT = 0;
  var dashes = [];
  var dashT = 0;
  var newBestT = 0;
  var newBestShown = false;
  var startHi = 0;

  var isExt = location.protocol === 'chrome-extension:';

  function lerp(a, b, k) { return a + (b - a) * k; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pad3(n) { return n < 1000 ? ('000' + n).slice(-3) : String(n); }

  function difficulty() {
    return playTime / 90 + score / 45;
  }
  function speed() {
    var d = difficulty();
    var peak = 140 + 160 * (1 - Math.exp(-d / 2.5));
    var ease = d > 8 ? 1 - 0.25 * Math.min(1, (d - 8) / 4) : 1;
    return peak * ease;
  }
  function gapH() { return Math.max(34, Math.round(68 - difficulty() * 2.2 + rand(-4, 4))); }
  function spacing() { return Math.max(190, 380 - difficulty() * 8 + rand(-40, 40)); }

  function drawMap(map, x, y, sc) {
    for (var r = 0; r < map.length; r++) {
      var row = map[r];
      for (var c = 0; c < row.length; c++) {
        if (row.charAt(c) === '1') {
          ctx.fillRect(x + c * sc, y + r * sc, sc, sc);
        }
      }
    }
  }

  function textWidth(str, sc) { return str.length * 6 * sc; }

  function drawText(str, x, y, sc, color) {
    ctx.fillStyle = color || '#fff';
    var cx = x;
    for (var i = 0; i < str.length; i++) {
      var ch = str.charAt(i).toUpperCase();
      var g = G[ch] || G[' '];
      for (var r = 0; r < 7; r++) {
        for (var c = 0; c < 5; c++) {
          if (g[r] & (1 << (4 - c))) ctx.fillRect(cx + c * sc, y + r * sc, sc, sc);
        }
      }
      cx += 6 * sc;
    }
  }

  var actx = null;
  function audio() {
    if (!actx) {
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    if (actx && actx.state === 'suspended') actx.resume();
    return actx;
  }
  function beep(freq, dur, type, vol, slide) {
    var a = audio();
    if (!a) return;
    var o = a.createOscillator();
    var g = a.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, a.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(1, freq + slide), a.currentTime + dur);
    g.gain.setValueAtTime(vol || 0.12, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.connect(g);
    g.connect(a.destination);
    o.start();
    o.stop(a.currentTime + dur);
  }
  function sndDie() {
    var a = audio();
    if (!a) return;
    var o = a.createOscillator();
    var g = a.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(320, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(60, a.currentTime + 0.35);
    g.gain.setValueAtTime(0.2, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.35);
    o.connect(g);
    g.connect(a.destination);
    o.start();
    o.stop(a.currentTime + 0.35);
  }
  function startTone() {
    var a = audio();
    if (!a || toneOsc) return;
    toneOsc = a.createOscillator();
    toneGain = a.createGain();
    toneOsc.type = 'triangle';
    toneOsc.frequency.value = 220;
    toneGain.gain.value = 0;
    toneOsc.connect(toneGain);
    toneGain.connect(a.destination);
    toneOsc.start();
  }
  function tone(freq, vol) {
    var a = audio();
    if (!a || !toneOsc) return;
    var t = a.currentTime;
    toneOsc.frequency.setTargetAtTime(freq, t, 0.03);
    toneGain.gain.setTargetAtTime(vol, t, 0.02);
  }

  function makePipe(x) {
    var lo = gapH() / 2 + 14;
    var hiGap = GROUND_Y - 14 - gapH() / 2;
    var c = Math.max(lo, Math.min(hiGap, lastCenter + rand(-85, 85)));
    lastCenter = c;
    var top = c - gapH() / 2;
    var bottom = c + gapH() / 2;
    var moving = score >= 30 && Math.random() < 0.45;
    return { x: x, gapTop: top, gapBottom: bottom, baseTop: top, baseBottom: bottom, drift: 0, dir: 1, moving: moving };
  }

  function start() {
    score = 0;
    prevScore = 0;
    dist = 0;
    playTime = 0;
    pipes = [];
    pteros = [];
    trail = [];
    dashes = [];
    startHi = hi;
    newBestShown = false;
    lastCenter = rand(70, 145);
    vy = 0;
    birdY = 28;
    state = 'playing';
    var first = makePipe(W + 40);
    pipes.push(first);
    lastOb = first;
  }

  function spawnObstacle() {
    var r = Math.random();
    var x = W + 40;
    if (score >= 50 && r < 0.4) {
      var p = { x: x, oy: rand(40, GROUND_Y - 70), phase: rand(0, 6.28) };
      pteros.push(p);
      lastOb = p;
    } else {
      var np = makePipe(x);
      pipes.push(np);
      lastOb = np;
    }
  }

  function flap() {
    vy = Math.max(-60, vy - 100);
  }

  function die() {
    state = 'dead';
    deathT = t;
    sndDie();
    if (score > hi) {
      hi = score;
      try { localStorage.setItem('flappyDinoHi', String(hi)); } catch (e) {}
    }
  }

  function pause() { if (state === 'playing') state = 'paused'; }
  function unpause() { if (state === 'paused') state = 'playing'; }

  function press() {
    audio();
    startTone();
    if (state === 'title') start();
    else if (state === 'paused') unpause();
    else if (state === 'playing') flap();
    else if (state === 'dead' && t - deathT > 0.45) start();
  }

  window.addEventListener('keydown', function (e) {
    var k = e.code;
    if (k === 'Space' || k === 'ArrowUp' || k === 'KeyW') {
      e.preventDefault();
      if (e.repeat) return;
      held = true;
      press();
    } else if (k === 'Escape' || k === 'KeyP') {
      if (state === 'paused') unpause(); else pause();
    }
  });

  window.addEventListener('keyup', function (e) {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') held = false;
  });

  canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    held = true;
    press();
  });
  window.addEventListener('pointerup', function () { held = false; });
  window.addEventListener('pointercancel', function () { held = false; });
  canvas.addEventListener('pointerleave', function () { held = false; });

  window.addEventListener('blur', function () { held = false; pause(); });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pause();
  });

  function update(dt) {
    if (state === 'paused') {
      tone(220, 0);
      return;
    }
    t += dt;
    if (blinkT > 0) blinkT -= dt;
    if (newBestT > 0) newBestT -= dt;
    if (state === 'playing') playTime += dt;

    var spd = state === 'playing' ? speed() : 40;
    groundOff += spd * dt;

    cloudT -= dt;
    if (cloudT <= 0) {
      cloudT = rand(1.2, 2.6);
      clouds.push({ x: W + 20, y: rand(15, GROUND_Y - 80), w: rand(24, 52) });
    }
    for (var i = clouds.length - 1; i >= 0; i--) {
      var cl = clouds[i];
      cl.x -= spd * 0.22 * dt;
      if (cl.x < -cl.w - 10) clouds.splice(i, 1);
    }

    if (state === 'playing') {
      if (held) {
        vy += (-45 - vy) * Math.min(1, 4 * dt);
      } else {
        vy = Math.min(vy + 220 * dt, 75);
      }
      birdY += vy * dt;
      if (birdY < 6) {
        birdY = 6;
        vy = 0;
        die();
      }
      if (vy < 0) {
        tone(220 + (1 - Math.min(1, Math.max(0, birdY / (GROUND_Y - 6)))) * 460, 0.055);
      } else {
        tone(220, 0);
      }
      trailT -= dt;
      if (trailT <= 0) {
        trailT = 0.045;
        trail.push({ x: BIRD_X - 15 + rand(0, 5), y: birdY + rand(-10, 10), life: 1 });
      }
      for (var tr = trail.length - 1; tr >= 0; tr--) {
        trail[tr].life -= dt * 2.2;
        if (trail[tr].life <= 0) trail.splice(tr, 1);
      }
      if (spd > 220) {
        dashT -= dt;
        if (dashT <= 0) {
          dashT = 0.12;
          dashes.push({ x: W + 20, y: rand(8, GROUND_Y - 40), len: rand(8, 16) });
        }
      }
      for (var ds = dashes.length - 1; ds >= 0; ds--) {
        dashes[ds].x -= spd * 1.6 * dt;
        if (dashes[ds].x < -30) dashes.splice(ds, 1);
      }

      var lastP = lastOb;
      if (lastP.x <= W - spacing()) {
        spawnObstacle();
      }
      for (var j = pipes.length - 1; j >= 0; j--) {
        var p = pipes[j];
        p.x -= spd * dt;
        if (p.moving) {
          p.drift += p.dir * 16 * (1 + difficulty() * 0.35) * dt;
          if (p.drift > 16) { p.drift = 16; p.dir = -1; }
          if (p.drift < -16) { p.drift = -16; p.dir = 1; }
          p.gapTop = p.baseTop + p.drift;
          p.gapBottom = p.baseBottom + p.drift;
          if (p.gapTop < 6) { p.gapTop = 6; p.dir = 1; }
          if (p.gapBottom > GROUND_Y - 6) { p.gapBottom = GROUND_Y - 6; p.dir = -1; }
        }
        if (p.x < -30) pipes.splice(j, 1);
      }
      for (var m = pteros.length - 1; m >= 0; m--) {
        var pt = pteros[m];
        pt.x -= spd * 1.05 * dt;
        if (pt.x < -40) pteros.splice(m, 1);
      }
      dist += spd * dt;
      score = Math.floor(dist / 100);
      if (score !== prevScore) {
        prevScore = score;
        blinkT = 0.6;
        if (!newBestShown && score > startHi && score > 0) {
          newBestShown = true;
          newBestT = 2.5;
        }
      }
      if (score > hi) {
        hi = score;
        try { localStorage.setItem('flappyDinoHi', String(hi)); } catch (e2) {}
      }

      var bx = BIRD_X - 10, by = birdY - 11, bw = 20, bh = 22;
      if (by + bh >= GROUND_Y) {
        birdY = GROUND_Y - 11;
        vy = 0;
        die();
      }
      if (state === 'playing') {
        for (var k = 0; k < pipes.length; k++) {
          var q = pipes[k];
          if (bx + bw > q.x && bx < q.x + 14 + spd * dt && (by < q.gapTop || by + bh > q.gapBottom)) {
            die();
            break;
          }
        }
      }
      if (state === 'playing') {
        for (var a = 0; a < pteros.length; a++) {
          var pt = pteros[a];
          var pty = pt.oy + Math.sin(pt.phase + t * 3) * 5;
          if (bx + bw > pt.x + 4 && bx < pt.x + 28 + spd * 1.05 * dt && by + bh > pty + 4 && by < pty + 24) {
            die();
            break;
          }
        }
      }
    } else if (state === 'dead') {
      vy = Math.min(vy + 220 * dt, 75);
      birdY += vy * dt;
      if (birdY > GROUND_Y - 11) { birdY = GROUND_Y - 11; vy = 0; }
    } else if (state === 'title') {
      birdY = 32 + Math.sin(t * 2.4) * 3;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawText('FLAABY', (W - textWidth('FLAABY', 1)) / 2, 2, 1, 'rgba(255,255,255,0.7)');
    drawText('FLAPPY DINO', (W - textWidth('FLAPPY DINO', 2)) / 2, 12, 2, '#fff');

    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    for (var d2 = 0; d2 < dashes.length; d2++) {
      var dd = dashes[d2];
      ctx.fillRect(dd.x, dd.y, dd.len, 2);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (var i = 0; i < clouds.length; i++) {
      var cl = clouds[i];
      ctx.fillRect(cl.x, cl.y + 4, cl.w, 3);
      ctx.fillRect(cl.x + 2, cl.y + 2, cl.w - 4, 3);
      ctx.fillRect(cl.x + cl.w / 2 - 3, cl.y, 6, 3);
    }

    ctx.fillStyle = '#fff';
    for (var j = 0; j < pipes.length; j++) {
      var p = pipes[j];
      ctx.fillRect(p.x, -4, 14, p.gapTop + 4);
      ctx.fillRect(p.x - 2, p.gapTop - 4, 18, 4);
      ctx.fillRect(p.x, p.gapBottom, 14, GROUND_Y - p.gapBottom + 4);
      ctx.fillRect(p.x - 2, p.gapBottom, 18, 4);
    }
    for (var m3 = 0; m3 < pteros.length; m3++) {
      var pt3 = pteros[m3];
      var py3 = pt3.oy + Math.sin(pt3.phase + t * 3) * 5;
      var pf = Math.floor(t * 10) % 2 === 0 ? PTERO_A : PTERO_B;
      drawMap(pf, pt3.x, py3, 2);
    }

    ctx.fillRect(0, GROUND_Y, W, 12);
    var off = -(groundOff % 24);
    for (var gx = off; gx < W; gx += 24) {
      ctx.fillRect(gx, GROUND_Y - 3, 4, 3);
    }

    for (var tr2 = 0; tr2 < trail.length; tr2++) {
      var tp = trail[tr2];
      ctx.fillStyle = 'rgba(255,255,255,' + (tp.life * 0.3).toFixed(3) + ')';
      ctx.fillRect(tp.x, tp.y, 2, 2);
    }

    var frame = Math.floor(t * 14) % 2 === 0 ? BIRD_A : BIRD_B;
    var ang = 0;
    if (state === 'playing') {
      ang = Math.max(-0.25, Math.min(0.45, vy / 75 * 0.45));
    } else if (state === 'dead') {
      ang = -Math.min(1.5, 0.4 + Math.max(0, GROUND_Y - 12 - birdY) * 0.05);
    }

    ctx.save();
    ctx.translate(BIRD_X, birdY);
    ctx.rotate(ang);
    ctx.translate(-8, -6);
    drawMap(frame, 0, 0, 2);
    ctx.restore();

    if (state === 'playing' || state === 'paused' || state === 'dead' || state === 'title') {
      var hiS = 'HI ' + pad3(hi);
      var curS = pad3(score);
      var hx = W - 8 - textWidth(hiS, 1) - 8 - textWidth(curS, 1);
      drawText(hiS, hx, 8, 1, 'rgba(255,255,255,0.5)');
      drawText(curS, hx + textWidth(hiS, 1) + 8, 8, 1, '#fff');
      if (blinkT > 0 && Math.floor(blinkT * 12) % 2 === 0) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(hx - 10, 11, 5, 5);
      }
      if (newBestT > 0 && Math.floor(newBestT * 8) % 2 === 0) {
        drawText('NEW BEST', hx - 8 - textWidth('NEW BEST', 1), 8, 1, '#fff');
      }
    }

    if (state === 'title') {
      var hintTxt = isTouch ? 'TAP TO PLAY' : 'PRESS SPACE TO PLAY';
      drawText(hintTxt, (W - textWidth(hintTxt, 1)) / 2, 96, 1, 'rgba(255,255,255,0.85)');
    } else if (state === 'paused') {
      drawText('PAUSED', (W - textWidth('PAUSED', 2)) / 2, 96, 2, '#fff');
    } else if (state === 'dead') {
      drawText('GAME OVER', (W - textWidth('GAME OVER', 2)) / 2, 60, 2, '#fff');
      var st = 'SCORE ' + pad3(score) + '  BEST ' + pad3(hi);
      drawText(st, (W - textWidth(st, 1)) / 2, 90, 1, 'rgba(255,255,255,0.9)');
      if (t - deathT > 0.45) {
        var rt = isTouch ? 'TAP TO RESTART' : 'PRESS SPACE TO RESTART';
        drawText(rt, (W - textWidth(rt, 1)) / 2, 112, 1, 'rgba(255,255,255,0.85)');
      }
    }
  }

  var last = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
