"use strict";
// =====================================================================
//  PROBLEM MAKERS: every call is a new problem with its worked steps, so a test is never the same twice and the tutor never runs
//  out of examples. Each returns {q, a, w:[three wrong answers], why, steps:[...], fig}. Wrong answers are the usual slips
//  (a regrouping missed, an operation swapped, a place shifted), so a wrong pick tells the tutor something.
// =====================================================================
(() => {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1)), pick = a => a[Math.floor(Math.random() * a.length)];
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a), lcm = (a, b) => a / gcd(a, b) * b;
  const fr = (n, d) => { const g = gcd(n, d); n /= g; d /= g; if (d < 0) { n = -n; d = -d; } return d === 1 ? String(n) : Math.abs(n) > d ? (n < 0 ? '-' : '') + Math.floor(Math.abs(n) / d) + ' ' + (Math.abs(n) % d) + '/' + d : n + '/' + d; };
  const money = c => '$' + (c / 100).toFixed(2), comma = n => n.toLocaleString('en-US');
  // three different wrong answers from candidates, padded with near misses
  function W(ans, cands, fmt) {
    const f = fmt || String, A = f(ans), out = [];
    for (const c of cands) { const s = f(c); if (s !== A && !out.includes(s) && !(typeof c === 'number' && !isFinite(c))) out.push(s); if (out.length === 3) break; }
    for (let k = 1; out.length < 3 && k < 40; k++) for (const c of (typeof ans === 'number' ? [ans + k, ans - k] : [])) { const s = f(c); if (s !== A && !out.includes(s) && out.length < 3) out.push(s); }
    return out;
  }
  const G = (name, fn) => { EDU_GEN[name] = fn; };
  // ---------------- K-2 ----------------
  G('count_k', () => {
    const t = ri(0, 3);
    if (t === 0) { const n = ri(9, 98); return { q: `What number comes right after **${n}**?`, a: String(n + 1), w: W(n + 1, [n - 1, n + 10, n]), steps: [`Counting up from ${n} is one more.`, `${n} and one more is ${n + 1}.`], fig: ['numline', n - 2, n + 3, 1, [n + 1]] }; }
    if (t === 1) { let a = ri(12, 89), b = Number(String(a).split('').reverse().join('')); if (a === b) b = a + 10; return { q: `Which number is **greater**: ${a} or ${b}?`, a: String(Math.max(a, b)), w: [String(Math.min(a, b)), 'they are the same', String(a + b)], steps: ['Compare the tens first: the digit on the left.', `${Math.max(a, b)} has more tens, so it is greater.`] }; }
    if (t === 2) { const s = ri(1, 5) * 10; return { q: `Count by tens: ${s}, ${s + 10}, ${s + 20}, ___`, a: String(s + 30), w: W(s + 30, [s + 21, s + 40, s + 25]), steps: ['Each number is 10 more than the one before.', `${s + 20} + 10 = ${s + 30}.`] }; }
    const n = ri(2, 9); return { q: `How many **tens** are in ${n * 10}?`, a: String(n), w: W(n, [n * 10, n + 1, 10]), steps: [`${n * 10} is ${n} groups of ten.`], fig: ['blocks', 0, n, 0] };
  });
  G('addsub20', () => {
    const add = Math.random() < 0.5;
    if (add) { const a = ri(4, 9), b = ri(3, 9), s = a + b; const need = 10 - a; return { q: `${a} + ${b} = ?`, a: String(s), w: W(s, [s - 1, s + 1, a - b > 0 ? a - b : s + 2]),
      steps: s > 10 ? [`Make a ten: ${a} needs ${need} more to make 10.`, `Take ${need} from ${b}: ${b} = ${need} + ${b - need}.`, `10 + ${b - need} = ${s}.`] : [`Count on ${b} from ${a}.`, `${a} + ${b} = ${s}.`], fig: ['numline', 0, 20, 2, { [a]: 'start', [s]: '' }] }; }
    const a = ri(11, 18), b = ri(3, 9), d = a - b; return { q: `${a} − ${b} = ?`, a: String(d), w: W(d, [d + 1, d - 1, a + b]), steps: [`Think addition: ${b} + ? = ${a}.`, `${b} + ${d} = ${a}, so ${a} − ${b} = ${d}.`], fig: ['numline', 0, 20, 2, { [a]: 'start', [d]: '' }] };
  });
  G('place', () => {
    const n = ri(102, 987), ds = String(n).split('').map(Number), k = ri(0, 2), names = ['hundreds', 'tens', 'ones'], val = ds[k] * [100, 10, 1][k];
    return { q: `In **${n}**, what is the value of the digit **${ds[k]}**?`, a: String(val), w: W(val, [ds[k], ds[k] * [10, 100, 10][k], ds[k] * [1, 1, 100][k], val * 10]),
      why: `The ${ds[k]} is in the ${names[k]} place.`, steps: [`${n} = ${ds[0]} hundreds, ${ds[1]} tens, ${ds[2]} ones.`, `The ${ds[k]} is in the ${names[k]} place, so it is worth ${val}.`], fig: ['blocks', ds[0], ds[1], ds[2]] };
  });
  G('addsub1000', () => {
    if (Math.random() < 0.5) { const a = ri(125, 689), b = ri(117, 299), s = a + b; return { q: `${a} + ${b} = ?`, a: String(s), w: W(s, [s - 10, s - 100, s + 10, a + b - 1]),
      steps: [`Ones: ${a % 10} + ${b % 10} = ${a % 10 + b % 10}` + (a % 10 + b % 10 >= 10 ? ', write ' + ((a + b) % 10) + ', carry 1 ten.' : '.'), `Tens: ${Math.floor(a / 10) % 10} + ${Math.floor(b / 10) % 10}${a % 10 + b % 10 >= 10 ? ' + 1' : ''} …`, `Hundreds last. The sum is ${s}.`] }; }
    const a = ri(402, 905), b = ri(118, 398), d = a - b; return { q: `${a} − ${b} = ?`, a: String(d), w: W(d, [d + 10, d - 10, d + 100, Math.abs(a - b - 2)]),
      steps: [`Start with the ones. If the top digit is smaller, regroup: borrow 1 ten (10 ones).`, `Work tens, then hundreds, regrouping when needed.`, `Check: ${d} + ${b} = ${a}. So the answer is ${d}.`] };
  });
  G('coins', () => {
    const set = []; const q = ri(0, 3), d = ri(0, 4), nk = ri(0, 3), p = ri(0, 4); for (let i = 0; i < q; i++) set.push('q'); for (let i = 0; i < d; i++) set.push('d'); for (let i = 0; i < nk; i++) set.push('n'); for (let i = 0; i < p; i++) set.push('p');
    if (!set.length) set.push('d', 'p'); const c = set.reduce((s, k) => s + { q: 25, d: 10, n: 5, p: 1 }[k], 0);
    return { q: `How much money is this?`, a: c + '¢', w: W(c, [c + 5, c - 5, set.length, c + 10], v => v + '¢'), steps: ['Start with the biggest coins: quarters are 25¢, dimes 10¢, nickels 5¢, pennies 1¢.', `Count on: ${set.map(k => ({ q: 25, d: 10, n: 5, p: 1 })[k]).join(' + ')} = ${c}¢.`], fig: ['coins', set] };
  });
  G('clock', () => {
    const h = ri(1, 12), m = pick([0, 15, 30, 45, 5, 20, 40, 50]), s = h + ':' + String(m).padStart(2, '0');
    const wr = [((h % 12) + 1) + ':' + String(m).padStart(2, '0'), h + ':' + String((m + 30) % 60).padStart(2, '0'), (m / 5 || 12) + ':' + String(h * 5 % 60).padStart(2, '0')];
    return { q: 'What time does the clock show?', a: s, w: wr.filter(x => x !== s).slice(0, 3), steps: [`The short hand is at or just past ${h}: the hour is ${h}.`, `The long hand counts minutes by fives: it shows ${m}.`, `So it is ${s}.`], fig: ['clock', h, m] };
  });
  G('elapsed', () => {
    const h = ri(8, 14), m = pick([0, 15, 30, 45]), add = pick([30, 45, 75, 90, 105, 120, 135]), t = h * 60 + m + add, f = v => { const H = Math.floor(v / 60), M = v % 60; return ((H - 1) % 12 + 1) + ':' + String(M).padStart(2, '0') + (H >= 12 ? ' PM' : ' AM'); };
    return { q: `A field trip leaves at **${f(h * 60 + m)}** and lasts ${Math.floor(add / 60) ? Math.floor(add / 60) + ' hour' + (add >= 120 ? 's' : '') + (add % 60 ? ' and ' : '') : ''}${add % 60 ? add % 60 + ' minutes' : ''}. When does it end?`, a: f(t), w: W(t, [t - 60, t + 60, t - 15, t + 30], f),
      steps: [`Add the hours first, then the minutes.`, `${f(h * 60 + m)} plus ${add} minutes is ${f(t)}.`] };
  });
  // ---------------- 3-5 ----------------
  G('multfacts', () => { const a = ri(2, 9), b = ri(2, 10), p = a * b; return { q: `${a} × ${b} = ?`, a: String(p), w: W(p, [p + a, p - a, a + b, p + b]), steps: [`${a} × ${b} means ${a} groups of ${b}.`, b > 5 ? `${a} × 5 = ${a * 5}, and ${a} × ${b - 5} = ${a * (b - 5)}. Together: ${p}.` : `Skip count by ${b}: ${Array.from({ length: a }, (_, i) => b * (i + 1)).join(', ')}.`] }; });
  G('divfacts', () => { const b = ri(2, 9), q = ri(2, 10), a = b * q; return { q: `${a} ÷ ${b} = ?`, a: String(q), w: W(q, [q + 1, q - 1, a - b, b]), steps: [`Division undoes multiplication: what times ${b} is ${a}?`, `${b} × ${q} = ${a}, so ${a} ÷ ${b} = ${q}.`] }; });
  G('frac1', () => {
    if (Math.random() < 0.5) { const d = ri(3, 10), a = ri(1, d - 1); let b = ri(1, d - 1); if (a === b) b = a % (d - 1) + 1; const big = Math.max(a, b);
      return { q: `Which fraction is **greater**: ${a}/${d} or ${b}/${d}?`, a: big + '/' + d, w: [Math.min(a, b) + '/' + d, 'they are equal', (a + b) + '/' + d], steps: ['Same size pieces (same bottom number).', `More pieces is more: ${big}/${d} is greater.`], fig: ['fracbars', [[a, d], [b, d]]] }; }
    const x = ri(2, 6); let y = ri(2, 9); if (x === y) y++; return { q: `Which is **greater**: 1/${x} or 1/${y}?`, a: '1/' + Math.min(x, y), w: ['1/' + Math.max(x, y), 'they are equal', '1/' + (x + y)],
      steps: ['One piece each, so compare piece sizes.', `Cutting into fewer pieces makes bigger pieces: 1/${Math.min(x, y)} is greater.`], fig: ['fracbars', [[1, x], [1, y]]] };
  });
  G('area', () => {
    const w = ri(2, 12), h = ri(2, 9), per = Math.random() < 0.5;
    return per ? { q: `A rectangle is ${w} feet by ${h} feet. What is its **perimeter**?`, a: 2 * (w + h) + ' ft', w: W(2 * (w + h), [w * h, w + h, 2 * w + h], v => v + ' ft'), steps: ['Perimeter is the distance all the way around.', `${w} + ${h} + ${w} + ${h} = ${2 * (w + h)} feet.`], fig: ['rect', w, h, 'ft'] }
      : { q: `A rectangle is ${w} feet by ${h} feet. What is its **area**?`, a: w * h + ' sq ft', w: W(w * h, [2 * (w + h), w + h, w * h + w], v => v + ' sq ft'), steps: ['Area counts the squares inside.', `${w} rows of ${h}: ${w} × ${h} = ${w * h} square feet.`], fig: ['rect', w, h, 'ft'] };
  });
  G('multidig', () => {
    const a = ri(12, 89), b = ri(12, 49), p = a * b, at = a - a % 10, ao = a % 10;
    return { q: `${a} × ${b} = ?`, a: comma(p), w: W(p, [p - b * 10, p + a, at * b + ao, a * (b - b % 10)], comma), steps: [`Split ${a} into ${at} and ${ao}.`, `${at} × ${b} = ${at * b}`, `${ao} × ${b} = ${ao * b}`, `Add the parts: ${at * b} + ${ao * b} = ${comma(p)}.`] };
  });
  G('longdiv', () => {
    const d = ri(3, 9), q = ri(24, 140), r = ri(0, d - 1), n = d * q + r, A = q + (r ? ' R' + r : '');
    return { q: `${n} ÷ ${d} = ?`, a: A, w: [(q + 1) + (r ? ' R' + r : ''), q + ' R' + (r + 1), (q - 1) + ' R' + (r + d - 1 >= d ? r : r + 1)].filter(x => x !== A),
      steps: [`How many ${d}s fit in ${n}? Divide, multiply, subtract, bring down, place by place.`, `${d} × ${q} = ${d * q}.`, `${n} − ${d * q} = ${r}${r ? ', the remainder' : ''}.`, `So ${n} ÷ ${d} = ${A}.`] };
  });
  G('fracops', () => {
    const t = ri(0, 2);
    if (t < 2) { const b = pick([2, 3, 4, 5, 6, 8]), d = pick([3, 4, 6, 8, 10, 12].filter(x => x !== b)), a = ri(1, b - 1), c = ri(1, d - 1), L = lcm(b, d), sub = t === 1 && a / b > c / d;
      const N = sub ? a * L / b - c * L / d : a * L / b + c * L / d, ans = fr(N, L);
      const wr = [sub ? (b !== d ? fr(Math.abs(a - c) || 1, Math.abs(b - d)) : fr(N + 2, L)) : fr(a + c, b + d), fr(N + 1, L), fr(N, L * 2), fr(Math.max(1, N - 1), L)];
      return { q: `${a}/${b} ${sub ? '−' : '+'} ${c}/${d} = ?`, a: ans, w: [...new Set(wr)].filter(x => x !== ans).slice(0, 3),
        steps: [`Make the pieces the same size: the least common denominator of ${b} and ${d} is ${L}.`, `${a}/${b} = ${a * L / b}/${L} and ${c}/${d} = ${c * L / d}/${L}.`, `${sub ? 'Subtract' : 'Add'} the tops: ${a * L / b} ${sub ? '−' : '+'} ${c * L / d} = ${N}. So ${N}/${L}` + (fr(N, L) !== N + '/' + L ? ` = ${ans}.` : '.')] }; }
    const a = ri(1, 5), b = ri(a + 1, 9), c = ri(1, 5), d = ri(c + 1, 9), ans = fr(a * c, b * d);
    return { q: `${a}/${b} × ${c}/${d} = ?`, a: ans, w: [fr(a * d, b * c), fr(a + c, b + d), fr(a * c, b + d)].filter(x => x !== ans), steps: ['Multiply tops, multiply bottoms.', `${a} × ${c} = ${a * c} and ${b} × ${d} = ${b * d}: ${a * c}/${b * d}` + (ans !== a * c + '/' + b * d ? `, which simplifies to ${ans}.` : '.')] };
  });
  G('decimals', () => {
    const t = ri(0, 2);
    if (t === 0) { const a = ri(11, 99) / 100, b = ri(1, 9) / 10; return { q: `Which is greater: **${a.toFixed(2)}** or **${b.toFixed(1)}**?`, a: a > b ? a.toFixed(2) : b.toFixed(1), w: [a > b ? b.toFixed(1) : a.toFixed(2), 'they are equal', (a + b).toFixed(2)], steps: [`Line up the places: ${b.toFixed(1)} = ${b.toFixed(2)}.`, `Compare tenths, then hundredths.`] }; }
    if (t === 1) { const a = ri(12, 480) / 10, b = ri(11, 99) / 100, s = +(a + b).toFixed(2); return { q: `${a.toFixed(1)} + ${b.toFixed(2)} = ?`, a: s.toFixed(2), w: W(s, [s + 0.1, s - 0.09, a + b * 10], v => (+v).toFixed(2)), steps: ['Line up the decimal points.', `${a.toFixed(2)} + ${b.toFixed(2)} = ${s.toFixed(2)}.`] }; }
    const v = ri(1001, 9999) / 100; return { q: `Round **${v.toFixed(2)}** to the nearest tenth.`, a: v.toFixed(1), w: W(v, [v + 0.1, v - 0.1, Math.round(v)], x => (+x).toFixed(1)).filter(x => x !== v.toFixed(1)), steps: ['Look at the hundredths digit.', `5 or more rounds up; less than 5 stays. ${v.toFixed(2)} rounds to ${v.toFixed(1)}.`] };
  });
  G('volume', () => { const l = ri(2, 9), w = ri(2, 6), h = ri(2, 7), v = l * w * h; return { q: `A box is ${l} cm long, ${w} cm wide and ${h} cm tall. What is its **volume**?`, a: v + ' cubic cm', w: W(v, [l * w + h, 2 * (l * w + w * h + l * h), l + w + h], x => x + ' cubic cm'), steps: ['Volume = length × width × height.', `${l} × ${w} = ${l * w} cubes in one layer, times ${h} layers = ${v}.`], fig: ['box3', l, w, h] }; });
  G('coordpts', () => { const x = ri(1, 7), y = ri(1, 7); return { q: 'What are the coordinates of the marked point?', a: `(${x}, ${y})`, w: [`(${y}, ${x})`, `(${x}, ${y + 1})`, `(${x + 1}, ${y})`].filter(s => s !== `(${x}, ${y})`), steps: ['Go across first (x), then up (y).', `Across ${x}, up ${y}: (${x}, ${y}).`], fig: ['coord', [[x, y, '?']], 8] }; });
  G('change', () => { const p = ri(105, 1895), paid = p <= 500 ? 500 : p <= 1000 ? 1000 : 2000, c = paid - p; return { q: `A book costs **${money(p)}**. You pay with ${money(paid)}. How much change?`, a: money(c), w: W(c, [c + 100, c - 10, c + 5], money), steps: [`Change = paid − price.`, `${money(paid)} − ${money(p)} = ${money(c)}. Count up to check.`] }; });
  G('mapscale', () => { const k = pick([2, 5, 10, 25]), n = ri(2, 9), d = k * n; return { q: `On a map, 1 inch stands for ${k} miles. Two towns are ${n} inches apart on the map. How far apart are they?`, a: d + ' miles', w: W(d, [k + n, d + k, d / 2], v => v + ' miles'), steps: ['Each inch is the same distance.', `${n} inches × ${k} miles = ${d} miles.`] }; });
  // ---------------- 6-8 ----------------
  G('ratio', () => {
    const t = ri(0, 2);
    if (t === 0) { const u = ri(2, 9), n = ri(3, 12), c = u * n; return { q: `${n} notebooks cost $${c}. What does **one** cost?`, a: '$' + u, w: W(u, [u + 1, c - n, n], v => '$' + v), steps: ['Unit rate: divide the total by the count.', `$${c} ÷ ${n} = $${u} each.`] }; }
    if (t === 1) { const p = pick([10, 20, 25, 40, 50, 75, 15, 30]), n = pick([40, 60, 80, 120, 200, 240]), v = p * n / 100; return { q: `What is **${p}%** of ${n}?`, a: String(v), w: W(v, [v * 2, n - v, p + n, v / 2]), steps: [`${p}% means ${p} out of 100: ${p}/100.`, `${p}/100 × ${n} = ${v}.`] }; }
    const whole = pick([20, 40, 50, 80, 200]), part = whole * pick([1, 2, 3]) / pick([4, 5, 10]); const pc = part / whole * 100; return { q: `${part} is what percent of ${whole}?`, a: pc + '%', w: W(pc, [pc * 2, 100 - pc, whole / part], v => (+(+v).toFixed(1)) + '%'), steps: ['Percent = part ÷ whole × 100.', `${part} ÷ ${whole} = ${part / whole}, × 100 = ${pc}%.`] };
  });
  G('integers', () => {
    const t = ri(0, 2), a = ri(-12, 12) || 3, b = ri(-12, 12) || -4;
    if (t === 0) { const s = a + b; return { q: `(${a}) + (${b}) = ?`, a: String(s), w: W(s, [a - b, -s, Math.abs(a) + Math.abs(b)]), steps: [a * b < 0 ? 'Different signs: subtract the sizes, keep the sign of the bigger one.' : 'Same signs: add the sizes, keep the sign.', `The answer is ${s}.`], fig: ['numline', -15, 15, 5, { [a]: 'start', [s]: '' }] }; }
    if (t === 1) { const d = a - b; return { q: `(${a}) − (${b}) = ?`, a: String(d), w: W(d, [a + b, -d, b - a]), steps: ['Subtracting is adding the opposite.', `(${a}) + (${-b}) = ${d}.`] }; }
    const p = a * b; return { q: `(${a}) × (${b}) = ?`, a: String(p), w: W(p, [-p, a + b, Math.abs(p) + 1]), steps: ['Same signs give a positive; different signs give a negative.', `${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(p)}, so the answer is ${p}.`] };
  });
  G('expr', () => {
    if (Math.random() < 0.5) { const a = ri(2, 9), b = ri(1, 15), x = ri(2, 9), v = a * x + b; return { q: `What is **${a}x + ${b}** when x = ${x}?`, a: String(v), w: W(v, [a + x + b, a * (x + b), a * x]), steps: [`Put ${x} in for x: ${a} × ${x} + ${b}.`, `Multiply first: ${a * x}, then add ${b}: ${v}.`] }; }
    const x = ri(2, 20), b = ri(3, 30), s = x + b; return { q: `Solve: **x + ${b} = ${s}**`, a: 'x = ' + x, w: W(x, [s + b, b, s], v => 'x = ' + v), steps: ['Undo the + by subtracting from both sides.', `x = ${s} − ${b} = ${x}.`] };
  });
  G('equations', () => { const a = ri(2, 9), x = ri(-6, 12), b = ri(-15, 20), c = a * x + b; return { q: `Solve: **${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${c}**`, a: 'x = ' + x, w: W(x, [(c + b) / a, c - b, (c - b) / a + 1, -x], v => 'x = ' + (+(+v).toFixed(2))).filter(s => s !== 'x = ' + x), steps: [`${b < 0 ? 'Add ' + Math.abs(b) + ' to' : 'Subtract ' + b + ' from'} both sides: ${a}x = ${c - b}.`, `Divide both sides by ${a}: x = ${x}.`, `Check: ${a}(${x}) ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${c}. ✓`] }; });
  G('stats', () => {
    const vals = Array.from({ length: 5 }, () => ri(2, 30)), s = vals.slice().sort((a, b) => a - b), t = ri(0, 2);
    if (t === 0) { const sum = vals.reduce((a, b) => a + b, 0); if (sum % 5) vals[0] += 5 - sum % 5; const S2 = vals.reduce((a, b) => a + b, 0), m = S2 / 5; return { q: `Find the **mean** (average) of ${vals.join(', ')}.`, a: String(m), w: W(m, [s[2], S2, Math.max(...vals) - Math.min(...vals)]), steps: [`Add them: ${vals.join(' + ')} = ${S2}.`, `Divide by how many (5): ${S2} ÷ 5 = ${m}.`] }; }
    if (t === 1) return { q: `Find the **median** of ${vals.join(', ')}.`, a: String(s[2]), w: W(s[2], [vals[2], s[1], s[3]]), steps: [`Put them in order: ${s.join(', ')}.`, `The middle one is ${s[2]}.`] };
    return { q: `Find the **range** of ${vals.join(', ')}.`, a: String(s[4] - s[0]), w: W(s[4] - s[0], [s[4], s[2], s[4] + s[0]]), steps: ['Range = biggest − smallest.', `${s[4]} − ${s[0]} = ${s[4] - s[0]}.`] };
  });
  G('geom78', () => {
    const t = ri(0, 3);
    if (t === 0) { const a = ri(30, 80), b = ri(30, 80), c = 180 - a - b; return { q: `A triangle has angles of ${a}° and ${b}°. What is the third angle?`, a: c + '°', w: W(c, [360 - a - b, a + b, 90 - a], v => v + '°'), steps: ['The angles of any triangle add to 180°.', `180 − ${a} − ${b} = ${c}°.`] }; }
    if (t === 1) { const r = ri(2, 10), A = +(3.14 * r * r).toFixed(2); return { q: `A circle has radius ${r} m. What is its **area**? (π ≈ 3.14)`, a: A + ' sq m', w: W(A, [+(2 * 3.14 * r).toFixed(2), +(3.14 * 2 * r * 2 * r).toFixed(2), r * r], v => v + ' sq m'), steps: ['Area = π × r × r.', `3.14 × ${r} × ${r} = ${A} square meters.`], fig: ['circle', r, 'm'] }; }
    if (t === 2) { const r = ri(2, 12), C = +(2 * 3.14 * r).toFixed(2); return { q: `A circle has radius ${r} cm. What is its **circumference**? (π ≈ 3.14)`, a: C + ' cm', w: W(C, [+(3.14 * r * r).toFixed(2), +(3.14 * r).toFixed(2), 2 * r], v => v + ' cm'), steps: ['Circumference = 2 × π × r.', `2 × 3.14 × ${r} = ${C} cm.`], fig: ['circle', r, 'cm'] }; }
    const [a, b, c] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]); return { q: `A right triangle has legs ${a} and ${b}. How long is the **hypotenuse**?`, a: String(c), w: W(c, [a + b, c + 1, b + 1]), steps: ['Pythagorean theorem: a² + b² = c².', `${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}.`, `c = √${c * c} = ${c}.`], fig: ['rtri', a, b, '?'] };
  });
  G('slope', () => {
    const x1 = ri(-4, 3), y1 = ri(-4, 5), m = pick([-3, -2, -1, 1, 2, 3, 1 / 2, -1 / 2]), dx = m % 1 ? 2 * ri(1, 2) : ri(1, 4), x2 = x1 + dx, y2 = y1 + m * dx, ms = Number.isInteger(m) ? String(m) : (m < 0 ? '-' : '') + '1/2';
    if (Math.random() < 0.5) return { q: `What is the **slope** of the line through (${x1}, ${y1}) and (${x2}, ${y2})?`, a: ms, w: [Number.isInteger(m) ? String(-m) : (m < 0 ? '1/2' : '-1/2'), Number.isInteger(m) ? fr(1, m) : String(m * 4), String(y2 - y1)].filter(x => x !== ms), steps: ['Slope = rise ÷ run = (y₂ − y₁) ÷ (x₂ − x₁).', `(${y2} − ${y1}) ÷ (${x2} − ${x1}) = ${y2 - y1} ÷ ${dx} = ${ms}.`] };
    const b = ri(-6, 6), k = ri(-5, 5) || 2; return { q: `In **y = ${k}x ${b < 0 ? '−' : '+'} ${Math.abs(b)}**, what is the y-intercept?`, a: String(b), w: W(b, [k, -b, k + b]), steps: ['In y = mx + b, b is where the line crosses the y-axis (x = 0).', `Here b = ${b}.`] };
  });
  G('expo', () => {
    if (Math.random() < 0.5) { const b = ri(2, 5), e = ri(2, 5), v = Math.pow(b, e); return { q: `${b}^${e} = ?`, a: String(v), w: W(v, [b * e, Math.pow(b, e - 1), Math.pow(e, b)]), steps: [`${b}^${e} means ${b} multiplied by itself ${e} times.`, `${Array(e).fill(b).join(' × ')} = ${v}.`] }; }
    const m = ri(11, 99) / 10, e = ri(3, 7), n = Math.round(m * Math.pow(10, e)); return { q: `Write **${comma(n)}** in scientific notation.`, a: `${m} × 10^${e}`, w: [`${m} × 10^${e + 1}`, `${m * 10} × 10^${e}`, `${m} × 10^${e - 1}`], steps: ['Move the decimal point until one digit is left of it.', `${comma(n)} → ${m}, moving ${e} places: ${m} × 10^${e}.`] };
  });
  // ---------------- high school ----------------
  G('alg1', () => {
    const t = ri(0, 3);
    if (t === 0) { const x = ri(-5, 6), y = ri(-5, 6), a = ri(1, 4), b = ri(1, 4), c1 = x + y, c2 = a * x - b * y; return { q: `Solve the system: **x + y = ${c1}** and **${a}x − ${b}y = ${c2}**`, a: `(${x}, ${y})`, w: [`(${y}, ${x})`, `(${x + 1}, ${y - 1})`, `(${-x}, ${c1 + x})`].filter(s => s !== `(${x}, ${y})`), steps: [`From the first: y = ${c1} − x.`, `Substitute: ${a}x − ${b}(${c1} − x) = ${c2} → ${a + b}x = ${c2 + b * c1} → x = ${x}.`, `Then y = ${c1} − (${x}) = ${y}.`] }; }
    if (t === 1) { const p = ri(-7, 7) || 2, q = ri(-7, 7) || -3, B = p + q, C = p * q; const f = (u, v) => `(x ${u < 0 ? '−' : '+'} ${Math.abs(u)})(x ${v < 0 ? '−' : '+'} ${Math.abs(v)})`;
      return { q: `Factor: **x² ${B < 0 ? '−' : '+'} ${Math.abs(B)}x ${C < 0 ? '−' : '+'} ${Math.abs(C)}**`, a: f(p, q), w: [f(-p, -q), f(p, -q), f(B, 1)].filter(s => s !== f(p, q) && s !== f(q, p)), steps: [`Find two numbers that multiply to ${C} and add to ${B}.`, `${p} and ${q}: ${p} × ${q} = ${C}, ${p} + ${q} = ${B}.`, `So it factors as ${f(p, q)}.`] }; }
    if (t === 2) { const r1 = ri(-6, 6), r2 = ri(-6, 6), B = -(r1 + r2), C = r1 * r2, s = [r1, r2].sort((a, b) => a - b), A = r1 === r2 ? 'x = ' + r1 : `x = ${s[0]} or x = ${s[1]}`;
      return { q: `Solve: **x² ${B < 0 ? '−' : '+'} ${Math.abs(B)}x ${C < 0 ? '−' : '+'} ${Math.abs(C)} = 0**`, a: A, w: [r1 === r2 ? 'x = ' + -r1 : `x = ${-s[1]} or x = ${-s[0]}`, `x = ${C}`, `x = ${B}`].filter(x => x !== A), steps: [`Factor: (x ${-r1 < 0 ? '−' : '+'} ${Math.abs(r1)})(x ${-r2 < 0 ? '−' : '+'} ${Math.abs(r2)}) = 0.`, 'If a product is zero, one of its factors is zero.', `So ${A}.`] }; }
    const a = ri(2, 5), m = ri(2, 6), n = ri(2, 6); return { q: `Simplify: **x^${m} · x^${n}**`, a: `x^${m + n}`, w: [`x^${m * n}`, `2x^${m + n}`, `x^${Math.abs(m - n)}`], steps: ['Multiplying powers with the same base: add the exponents.', `x^${m} · x^${n} = x^${m + n}.`] };
  });
  G('geomhs', () => {
    const t = ri(0, 3);
    if (t === 0) { const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17]]), x1 = ri(-3, 3), y1 = ri(-3, 3); return { q: `What is the distance between (${x1}, ${y1}) and (${x1 + a}, ${y1 + b})?`, a: String(c), w: W(c, [a + b, c * c, c + 1]), steps: ['Distance = √((x₂−x₁)² + (y₂−y₁)²).', `√(${a}² + ${b}²) = √${a * a + b * b} = ${c}.`] }; }
    if (t === 1) { const r = ri(2, 6), h = ri(3, 10), v = +(3.14 * r * r * h).toFixed(1); return { q: `A can has radius ${r} cm and height ${h} cm. What is its volume? (π ≈ 3.14)`, a: v + ' cubic cm', w: W(v, [+(3.14 * r * h).toFixed(1), +(2 * 3.14 * r * h).toFixed(1), +(3.14 * r * r).toFixed(1)], x => x + ' cubic cm'), steps: ['Cylinder volume = π r² h (base area × height).', `3.14 × ${r}² × ${h} = ${v} cubic cm.`] }; }
    if (t === 2) { const k = ri(2, 5), a = ri(3, 8), b = a * k; return { q: `Two similar triangles: a side of ${a} in the small one matches ${b} in the big one. Another small side is ${a + 2}. What is the matching big side?`, a: String((a + 2) * k), w: W((a + 2) * k, [a + 2 + b - a, (a + 2) * k + k, b + 2]), steps: [`Scale factor = ${b} ÷ ${a} = ${k}.`, `${a + 2} × ${k} = ${(a + 2) * k}.`] }; }
    const a = ri(20, 160); return { q: `Two angles form a straight line. One is ${a}°. What is the other?`, a: (180 - a) + '°', w: W(180 - a, [90 - a, 360 - a, a], v => v + '°'), steps: ['Angles on a straight line are supplementary: they add to 180°.', `180 − ${a} = ${180 - a}°.`], fig: ['angle', a] };
  });
  G('alg2', () => {
    const t = ri(0, 3);
    if (t === 0) { const b = pick([2, 3, 5, 10]), e = ri(2, 5), v = Math.pow(b, e); return { q: `log base ${b} of ${comma(v)} = ?`, a: String(e), w: W(e, [v / b, e + 1, b * e]), steps: [`A log asks: ${b} to what power is ${comma(v)}?`, `${b}^${e} = ${comma(v)}, so the log is ${e}.`] }; }
    if (t === 1) { const p0 = pick([100, 200, 500, 1000]), r = pick([2, 3]), n = ri(2, 5), v = p0 * Math.pow(r, n); return { q: `A culture starts with ${p0} cells and ${r === 2 ? 'doubles' : 'triples'} every hour. How many after ${n} hours?`, a: comma(v), w: W(v, [p0 * r * n, p0 + r * n, v / r], comma), steps: ['Exponential growth: start × factor^time.', `${p0} × ${r}^${n} = ${p0} × ${Math.pow(r, n)} = ${comma(v)}.`] }; }
    if (t === 2) { const k = pick([2, 3, 4]); return { q: `i is √−1. What is **i^${k}**?`, a: { 2: '−1', 3: '−i', 4: '1' }[k], w: ['i', '1', '−1', '−i'].filter(x => x !== { 2: '−1', 3: '−i', 4: '1' }[k]).slice(0, 3), steps: ['i² = −1.', k === 2 ? 'So i² = −1.' : k === 3 ? 'i³ = i² · i = −i.' : 'i⁴ = (i²)² = (−1)² = 1.'] }; }
    const a = ri(2, 9), d = ri(2, 7), n = ri(6, 15), v = a + (n - 1) * d; return { q: `An arithmetic sequence starts ${a}, ${a + d}, ${a + 2 * d}, … What is term ${n}?`, a: String(v), w: W(v, [a + n * d, a * n, v - d * 2]), steps: ['aₙ = a₁ + (n − 1)d.', `${a} + (${n} − 1) × ${d} = ${v}.`] };
  });
  G('statshs', () => {
    const t = ri(0, 2);
    if (t === 0) { const r = ri(2, 6), b = ri(2, 6); return { q: `A bag has ${r} red and ${b} blue marbles. You draw one without looking. P(red) = ?`, a: fr(r, r + b), w: [fr(b, r + b), fr(r, b), fr(1, r + b)].filter(x => x !== fr(r, r + b)), steps: ['Probability = ways it can happen ÷ all the ways.', `${r} red of ${r + b} total: ${fr(r, r + b)}.`] }; }
    if (t === 1) { const n = ri(4, 7), k = ri(2, 3); let c = 1; for (let i = 0; i < k; i++) c = c * (n - i) / (i + 1); return { q: `How many ways to choose ${k} books from ${n} (order doesn't matter)?`, a: String(c), w: W(c, [c * (k === 2 ? 2 : 6), n * k, n + k]), steps: ['Combinations: n! ÷ (k! (n − k)!).', `${n}C${k} = ${c}.`] }; }
    const p = pick([0.1, 0.2, 0.25, 0.5]), win = pick([10, 20, 40]), cost = pick([2, 5]), ev = +(p * win - cost).toFixed(2); return { q: `A game costs $${cost}. You win $${win} with probability ${p}. What is the expected value per play?`, a: (ev < 0 ? '−$' : '$') + Math.abs(ev).toFixed(2), w: W(ev, [p * win, win - cost, -cost], v => (v < 0 ? '−$' : '$') + Math.abs(v).toFixed(2)), steps: ['Expected value = (chance × win) − cost.', `${p} × $${win} − $${cost} = ${ev < 0 ? '−' : ''}$${Math.abs(ev).toFixed(2)}. Over many plays, that's what you average.`] };
  });
  G('precalc', () => {
    const t = ri(0, 2);
    if (t === 0) { const [ang, f, v] = pick([[30, 'sin', '1/2'], [60, 'cos', '1/2'], [45, 'sin', '√2/2'], [30, 'cos', '√3/2'], [60, 'sin', '√3/2'], [45, 'tan', '1'], [0, 'cos', '1'], [90, 'sin', '1']]);
      return { q: `What is **${f} ${ang}°**?`, a: v, w: ['1/2', '√3/2', '√2/2', '1', '0'].filter(x => x !== v).slice(0, 3), steps: ['Use the special triangles (30-60-90 and 45-45-90) or the unit circle.', `${f} ${ang}° = ${v}.`] }; }
    if (t === 1) { const RAD = { 30: 'π/6', 45: 'π/4', 60: 'π/3', 90: 'π/2', 120: '2π/3', 180: 'π', 270: '3π/2', 360: '2π' }, d = pick(Object.keys(RAD)), rr = RAD[d];
      return { q: `Convert **${d}°** to radians.`, a: rr, w: eduShuffle(Object.values(RAD).filter(x => x !== rr)).slice(0, 3), steps: ['180° = π radians, so multiply by π/180.', `${d} × π/180 = ${rr}.`] }; }
    const a = ri(1, 5), r = 2, n = ri(3, 6), s = a * (Math.pow(r, n) - 1); return { q: `Add the geometric series ${a} + ${a * 2} + ${a * 4} + … (${n} terms).`, a: String(s), w: W(s, [a * Math.pow(2, n), s - a, a * n * 2]), steps: ['Sum = a(rⁿ − 1)/(r − 1).', `${a}(2^${n} − 1)/(2 − 1) = ${s}.`] };
  });
  G('calc', () => {
    const t = ri(0, 2);
    if (t === 0) { const c = ri(2, 9), n = ri(2, 6); return { q: `What is the derivative of **${c}x^${n}**?`, a: `${c * n}x^${n - 1}`.replace('^1', ''), w: [`${c}x^${n - 1}`, `${c * n}x^${n}`, `${c}x^${n + 1}/${n + 1}`].map(s => s.replace('^1', '')), steps: ['Power rule: d/dx xⁿ = n·xⁿ⁻¹.', `${c} × ${n} = ${c * n}, and the power drops to ${n - 1}.`] }; }
    if (t === 1) { const c = ri(1, 6) * 2, n = ri(1, 4); return { q: `What is ∫ **${c}x^${n}** dx?`, a: `${fr(c, n + 1)}x^${n + 1} + C`, w: [`${c * n}x^${n - 1} + C`, `${c}x^${n + 1} + C`, `${fr(c, n)}x^${n} + C`], steps: ['Reverse the power rule: raise the power by one, divide by the new power.', `${c}x^${n + 1}/${n + 1} + C.`] }; }
    const a = ri(1, 6); return { q: `What is the limit of (x² − ${a * a}) ÷ (x − ${a}) as x → ${a}?`, a: String(2 * a), w: W(2 * a, [a, 0, a * a]), steps: ['Plugging in gives 0/0, so simplify first.', `x² − ${a * a} = (x − ${a})(x + ${a}); cancel (x − ${a}).`, `Left with x + ${a} → ${2 * a}.`] };
  });
  // ---------------- make, money, body, arts ----------------
  G('tape', () => {
    const w = ri(1, 3), k = pick([8, 4, 12, 2, 6, 10, 14, 3, 5, 11, 13, 7, 9, 15]), len = w + k / 16;
    const f = (W2, k16) => k16 <= 0 ? W2 + '"' : k16 >= 16 ? (W2 + 1) + '"' : W2 + ' ' + fr(k16, 16) + '"', A = f(w, k);
    return { q: 'How long is the orange bar on the tape?', a: A, w: [...new Set([f(w, k + 1), f(w, k - 1), f(w + 1, k), f(w, k + 2)])].filter(x => x !== A).slice(0, 3),
      steps: ['Count whole inches at the long numbered lines.', `Past ${w}, count the small marks: each is 1/16". The bar ends ${k} marks past ${w}: ${k}/16 = ${fr(k, 16)}".`], fig: ['tape', len, A] };
  });
  G('boardft', () => { const T = pick([1, 2]), W2 = pick([4, 6, 8, 10, 12]), L = pick([6, 8, 10, 12]), bf = T * W2 * L / 12; return { q: `How many **board feet** in a board ${T}" thick, ${W2}" wide and ${L} feet long?`, a: String(bf), w: W(bf, [T * W2 * L, T * W2 * L / 144, bf * 2]), steps: ['Board feet = thickness (in) × width (in) × length (ft) ÷ 12.', `${T} × ${W2} × ${L} ÷ 12 = ${bf}.`] }; });
  G('ohm', () => { const R2 = pick([2, 3, 4, 5, 6, 10]), I = pick([1, 2, 3, 0.5]), V = R2 * I; return Math.random() < 0.5 ? { q: `A ${V}-volt battery runs a ${R2}-ohm resistor. What is the current?`, a: I + ' A', w: W(I, [V * R2, R2 / V, V + R2], v => v + ' A'), steps: ["Ohm's law: V = I × R, so I = V ÷ R.", `${V} ÷ ${R2} = ${I} amps.`], fig: ['circuit', V, R2] } : { q: `${I} amps flow through a ${R2}-ohm resistor. What is the voltage?`, a: V + ' V', w: W(V, [I / R2, R2 / I, I + R2], v => v + ' V'), steps: ["Ohm's law: V = I × R.", `${I} × ${R2} = ${V} volts.`], fig: ['circuit', V, R2] }; });
  G('code', () => {
    const t = ri(0, 2);
    if (t === 0) { const s = ri(1, 4), k = ri(2, 4), f = pick([2, 3]); let x = s; for (let i = 0; i < k; i++) x *= f; return { q: `x = ${s}\nrepeat ${k} times:\n    x = x × ${f}\nWhat is x at the end?`, a: String(x), w: W(x, [s * f * k, x / f, x * f]), steps: [`Start: x = ${s}.`, ...Array.from({ length: k }, (_, i) => `Pass ${i + 1}: x = ${s * Math.pow(f, i)} × ${f} = ${s * Math.pow(f, i + 1)}.`)] }; }
    if (t === 1) { const n = ri(3, 6); const tot = n * (n + 1) / 2; return { q: `total = 0\nfor i from 1 to ${n}:\n    total = total + i\nWhat is total?`, a: String(tot), w: W(tot, [n, tot - n, n * n]), steps: ['The loop adds each i to total.', `${Array.from({ length: n }, (_, i) => i + 1).join(' + ')} = ${tot}.`] }; }
    const s = ri(1, 20), lim = ri(5, 15); return { q: `score = ${s}\nif score > ${lim}:\n    print "HIGH"\nelse:\n    print "LOW"\nWhat prints?`, a: s > lim ? 'HIGH' : 'LOW', w: [s > lim ? 'LOW' : 'HIGH', 'both', 'nothing'], steps: [`Is ${s} > ${lim}? ${s > lim ? 'Yes' : 'No'}.`, `So it prints ${s > lim ? 'HIGH' : 'LOW'}.`] };
  });
  G('budget', () => {
    const t = ri(0, 1), pay = pick([1600, 2000, 2400, 3000, 3200]);
    if (t === 0) { const rent = pick([0.25, 0.3, 0.4, 0.5]) * pay; const pc = rent / pay * 100; return { q: `You take home $${comma(pay)} a month. Rent is $${comma(rent)}. What percent of your pay is rent?`, a: pc + '%', w: W(pc, [pc / 2, 100 - pc, pc + 10], v => v + '%'), steps: ['Percent = part ÷ whole × 100.', `${rent} ÷ ${pay} × 100 = ${pc}%. A common rule of thumb keeps housing near 30% or less.`] }; }
    const save = pick([0.1, 0.15, 0.2]), s = save * pay; return { q: `You save ${save * 100}% of $${comma(pay)} each month. How much is that in a year?`, a: '$' + comma(s * 12), w: W(s * 12, [s, s * 10, pay * 12], v => '$' + comma(v)), steps: [`${save * 100}% of $${comma(pay)} = $${comma(s)} a month.`, `× 12 months = $${comma(s * 12)}.`] };
  });
  G('interest', () => {
    const t = ri(0, 2);
    if (t === 0) { const P = pick([100, 500, 1000, 2000]), r = pick([2, 4, 5, 10]), y = ri(2, 3); const A = +(P * Math.pow(1 + r / 100, y)).toFixed(2); return { q: `$${comma(P)} earns ${r}% a year, compounded yearly. How much after ${y} years?`, a: '$' + A.toFixed(2), w: W(A, [P + P * r / 100 * y, P * (1 + r / 100), A + P * r / 100], v => '$' + (+v).toFixed(2)), steps: ['Compound interest: A = P(1 + r)ᵗ, interest earns interest.', `${P} × ${(1 + r / 100).toFixed(2)}^${y} = $${A.toFixed(2)}.`] }; }
    if (t === 1) { const P = pick([500, 1000, 2000]), r = pick([3, 5, 6]), y = ri(2, 5), I = P * r / 100 * y; return { q: `Simple interest: $${comma(P)} at ${r}% a year for ${y} years. How much interest?`, a: '$' + comma(I), w: W(I, [P * r / 100, I + P, P * Math.pow(1 + r / 100, y) - P], v => '$' + comma(+(+v).toFixed(2))), steps: ['Simple interest = principal × rate × time.', `${P} × ${r / 100} × ${y} = $${comma(I)}.`] }; }
    const B = pick([500, 1000, 1500, 3000]), apr = pick([18, 24, 27]), m = +(B * apr / 100 / 12).toFixed(2); return { q: `A credit card balance of $${comma(B)} has a ${apr}% APR. About how much interest builds in one month?`, a: '$' + m.toFixed(2), w: W(m, [B * apr / 100, B * apr / 100 / 52, m * 2], v => '$' + (+v).toFixed(2)), steps: ['Monthly rate ≈ APR ÷ 12.', `${apr}% ÷ 12 = ${(apr / 12).toFixed(2)}% of $${comma(B)} ≈ $${m.toFixed(2)}.`, 'Paying only the minimum lets that pile up.'] };
  });
  G('heartrate', () => { const s = pick([10, 15, 20, 30]), b = ri(14, 40) * (s / 10) | 0, bpm = b * 60 / s; return { q: `You count **${b} beats in ${s} seconds**. What is your heart rate in beats per minute?`, a: String(bpm), w: W(bpm, [b * s, b + 60, bpm / 2]), steps: [`A minute has ${60 / s} spans of ${s} seconds.`, `${b} × ${60 / s} = ${bpm} beats per minute.`] }; });
  G('rhythm', () => { const V = { whole: 4, half: 2, quarter: 1, eighth: 0.5 }, ns = Array.from({ length: ri(2, 4) }, () => pick(Object.keys(V))), tot = ns.reduce((s, k) => s + V[k], 0);
    return { q: `In 4/4 time, how many beats are: ${ns.map(n => 'a ' + n + ' note').join(' + ')}?`, a: String(tot), w: W(tot, [ns.length, tot * 2, tot + 1], v => String(+(+v).toFixed(1))), steps: ['In 4/4: whole = 4 beats, half = 2, quarter = 1, eighth = ½.', `${ns.map(k => V[k]).join(' + ')} = ${tot}.`] }; });
  G('punnett', () => {
    const [p1, p2] = pick([['Bb', 'Bb'], ['Bb', 'bb'], ['BB', 'bb'], ['BB', 'Bb']]), kids = []; for (const a of p1) for (const b of p2) kids.push(a + b);
    const rec = kids.filter(k => k === 'bb').length, dom = 4 - rec, ask = Math.random() < 0.5;
    const A = ask ? rec * 25 + '%' : dom * 25 + '%';
    return { q: `B (brown eyes) is dominant over b (blue). Parents are **${p1}** and **${p2}**. What is the chance a child has **${ask ? 'blue' : 'brown'}** eyes?`, a: A, w: ['0%', '25%', '50%', '75%', '100%'].filter(x => x !== A).slice(0, 3), steps: ['Fill the Punnett square: one letter from each parent in each box.', `Boxes: ${kids.map(k => k[0] === 'b' && k[1] === 'B' ? 'Bb' : k).join(', ')}.`, `Blue needs bb: ${rec} of 4 boxes. So ${ask ? 'blue' : 'brown'} = ${A}.`], fig: ['punnett', p1, p2] };
  });
})();
