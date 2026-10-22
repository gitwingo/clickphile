// Procedural scenic backgrounds. Every call makes a different landscape, all offline.
// Clickphile.generate(seed?) -> { svg, name }
(function (g) {
  'use strict';
  const W = 1920, H = 1080;

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hex2rgb = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  function mix(a, b, t) {
    const A = hex2rgb(a), B = hex2rgb(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  function makeNoise(rand) {
    const t = Array.from({ length: 512 }, () => rand());
    return (x) => {
      const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
      const a = t[i & 511], b = t[(i + 1) & 511];
      return a + (b - a) * u;
    };
  }

  // sky: 4 stops (top -> horizon). ridges: far -> near.
  const PALETTES = [
    { name: 'dawn', sky: ['#1b2a5e', '#6a4c93', '#f4a261', '#ffd6a5'], orb: '#fff1c9', orbR: 46, glow: 0.55,
      ridges: ['#8e6fa8', '#6b5190', '#4a3a78', '#2f2a5a', '#1c1a3d'], style: 'peaks' },
    { name: 'sunset', sky: ['#0f2a4a', '#7b2d6b', '#ff6b4a', '#ffc27a'], orb: '#ffe2a8', orbR: 58, glow: 0.6,
      ridges: ['#a3446b', '#7a3568', '#512a5c', '#341f48', '#1d1530'], style: 'peaks' },
    { name: 'night', sky: ['#050b1f', '#0b1e4a', '#1d3a78', '#3b6aa8'], orb: '#f2f4ff', orbR: 34, glow: 0.35, stars: true,
      ridges: ['#27457a', '#1d3566', '#14264f', '#0c1838', '#060d22'], style: 'peaks' },
    { name: 'alpine', sky: ['#2a6fb0', '#5fa3d8', '#a9d6ee', '#e8f4f8'], orb: '#fffbe0', orbR: 38, glow: 0.5,
      ridges: ['#9db8d0', '#7a9bb8', '#587d9a', '#3a5f7a', '#244559'], style: 'peaks' },
    { name: 'lagoon', sky: ['#04121f', '#0a3b4c', '#137a7a', '#6fd1b4'], orb: '#e8fff6', orbR: 36, glow: 0.4, stars: true,
      ridges: ['#1f6a72', '#175560', '#10404d', '#0a2e3a', '#061c26'], style: 'hills' },
    { name: 'desert', sky: ['#3d1c4f', '#b0455a', '#f08a4b', '#ffd08a'], orb: '#fff0c4', orbR: 52, glow: 0.6,
      ridges: ['#c8704f', '#a5563f', '#7d3f35', '#522a2b', '#2e1a20'], style: 'dunes' },
    { name: 'meadow', sky: ['#35508f', '#7c8fc4', '#f0b7a0', '#ffe3c2'], orb: '#fff6dc', orbR: 44, glow: 0.5,
      ridges: ['#7f9a94', '#5f8379', '#45695f', '#2f4f48', '#1b3430'], style: 'hills' },
  ];

  function generate(seed) {
    if (seed == null) seed = Math.floor(Math.random() * 4294967296);
    const rand = rng(seed);
    const P = PALETTES[Math.floor(rand() * PALETTES.length)];
    const noise = makeNoise(rand);
    const haze = P.sky[3];
    const N = P.ridges.length;
    const octaves = P.style === 'peaks' ? 5 : P.style === 'hills' ? 3 : 2;
    const ampScale = P.style === 'dunes' ? 0.62 : P.style === 'hills' ? 0.8 : 1;

    function ridgeHeight(x, layer) {
      const f = (P.style === 'dunes' ? 0.0011 : 0.0016) + layer * 0.0005;
      let sum = 0, amp = 1, freq = f, norm = 0;
      for (let o = 0; o < octaves; o++) {
        const n = noise(x * freq + layer * 37.3 + o * 11.7);
        const v = P.style === 'peaks' ? 1 - Math.abs(2 * n - 1) : n;
        sum += v * amp; norm += amp; amp *= 0.5; freq *= 2.05;
      }
      let v = sum / norm;
      if (P.style !== 'peaks') {
        const t = Math.min(1, Math.max(0, (v - 0.2) / 0.6));
        v = t * t * (3 - 2 * t) * 0.85 + t * 0.15; // smoothstep blend: no flat plateaus
      }
      return v;
    }

    const defs = [];
    const body = [];

    // sky
    defs.push(`<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0" stop-color="${P.sky[0]}"/><stop offset=".28" stop-color="${P.sky[1]}"/>` +
      `<stop offset=".5" stop-color="${P.sky[2]}"/><stop offset=".64" stop-color="${P.sky[3]}"/></linearGradient>`);
    body.push(`<rect width="${W}" height="${H}" fill="url(#sky)"/>`);

    // stars
    if (P.stars) {
      let s = '';
      for (let i = 0; i < 170; i++) {
        const y = rand() * H * 0.5;
        const fade = 1 - y / (H * 0.5);
        s += `<circle cx="${(rand() * W).toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.5 + rand() * 1.1).toFixed(2)}" ` +
          `fill="#fff" opacity="${(0.25 + rand() * 0.6 * fade).toFixed(2)}"/>`;
      }
      body.push(s);
    }

    // sun / moon with glow
    const ox = W * (0.18 + 0.64 * rand());
    const oy = H * (0.28 + 0.2 * rand());
    defs.push(`<radialGradient id="glow"><stop offset="0" stop-color="${P.orb}" stop-opacity="${P.glow}"/>` +
      `<stop offset=".35" stop-color="${P.orb}" stop-opacity="${(P.glow * 0.3).toFixed(2)}"/>` +
      `<stop offset="1" stop-color="${P.orb}" stop-opacity="0"/></radialGradient>`);
    body.push(`<circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="720" fill="url(#glow)"/>`);
    body.push(`<circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="${P.orbR}" fill="${P.orb}"/>`);

    // soft clouds
    defs.push(`<filter id="blur" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation="16"/></filter>`);
    const cloudColor = mix(P.sky[2], '#ffffff', 0.4);
    let clouds = '';
    const cloudCount = 3 + Math.floor(rand() * 3);
    for (let c = 0; c < cloudCount; c++) {
      const cx = rand() * W, cy = H * (0.1 + rand() * 0.3);
      for (let k = 0; k < 3; k++) {
        clouds += `<ellipse cx="${(cx + (k - 1) * 120 * rand()).toFixed(0)}" cy="${(cy + k * 6).toFixed(0)}" ` +
          `rx="${(150 + rand() * 230).toFixed(0)}" ry="${(14 + rand() * 18).toFixed(0)}" ` +
          `fill="${cloudColor}" opacity="${(0.1 + rand() * 0.14).toFixed(2)}"/>`;
      }
    }
    body.push(`<g filter="url(#blur)">${clouds}</g>`);

    // layered ridges, far -> near
    for (let i = 0; i < N; i++) {
      const baseY = H * (0.5 + i * 0.09);
      const amp = H * (0.26 - i * 0.035) * ampScale;
      const color = P.ridges[i];
      let d = `M0,${H}`;
      for (let x = 0; x <= W + 16; x += 16) {
        d += ` L${x},${(baseY - amp * ridgeHeight(x, i)).toFixed(1)}`;
      }
      d += ` L${W},${H} Z`;
      defs.push(`<linearGradient id="r${i}" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="${color}"/>` +
        `<stop offset="1" stop-color="${mix(color, haze, Math.max(0.05, 0.6 - i * 0.14))}"/></linearGradient>`);
      const rim = i < 3 ? ` stroke="${P.orb}" stroke-opacity="${(0.3 - i * 0.09).toFixed(2)}" stroke-width="1.6"` : '';
      body.push(`<path d="${d}" fill="url(#r${i})"${rim}/>`);
    }

    return {
      name: P.name,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ` +
        `preserveAspectRatio="xMidYMid slice"><defs>${defs.join('')}</defs>${body.join('')}</svg>`,
    };
  }

  function toDataUri(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  g.ClickphileScenes = { generate, toDataUri };
})(globalThis);
