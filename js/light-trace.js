/*
 * Travelling light: a bright head with a smoothly fading tail that runs round an element's edge.
 *
 * Use: give any element the attribute data-light-trace. Optional settings:
 *   data-light-lap="7"            seconds per lap
 *   data-light-tail="0.3"         tail length, as a share of the whole edge (0.3 = 30%)
 *   data-light-head="#ffffff"     colour at the head
 *   data-light-mid="#b9aedb"      colour partway down the tail
 *   data-light-end="#4a4470"      colour where the tail fades out
 *   data-light-glow="#b9aedb"     colour of the soft glow round the light
 *   data-light-start="0"          where on the edge the light starts (0 to 1)
 * The element's own rounded corners are followed automatically.
 * Nothing runs for visitors whose device asks for reduced motion.
 */
(function () {
	'use strict';
	if (!window.requestAnimationFrame || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;

	var PAD = 26; // room round the element for the glow
	var traces = [];

	var rgb = function (hex) {
		hex = hex.replace('#', '');
		if (hex.length === 3) hex = hex.replace(/(.)/g, '$1$1');
		var n = parseInt(hex, 16);
		return [n >> 16 & 255, n >> 8 & 255, n & 255];
	};
	var mix = function (a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
	var css = function (c, alpha) { return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + alpha.toFixed(3) + ')'; };

	/* Colour and strength of the tail at f, where f is 1 at the head and 0 at the far end of the tail. */
	var colourAt = function (t, f) { return f > 0.5 ? mix(t.mid, t.head, (f - 0.5) * 2) : mix(t.end, t.mid, f * 2); };
	var alphaAt = function (f) { return Math.pow(f, 1.6); };

	/* The edge as a list of pieces: straight lines and quarter-circle corners, clockwise from the top left. */
	var buildEdge = function (t) {
		var w = t.w, h = t.h, r = t.r, pieces = [];
		var line = function (x0, y0, x1, y1) { var len = Math.hypot(x1 - x0, y1 - y0); if (len > 0) pieces.push({ type: 'line', x0: x0, y0: y0, x1: x1, y1: y1, len: len }); };
		var arc = function (cx, cy, a0) { if (r > 0) pieces.push({ type: 'arc', cx: cx, cy: cy, a0: a0, len: Math.PI * r / 2 }); };
		line(r, 0, w - r, 0); arc(w - r, r, -Math.PI / 2);
		line(w, r, w, h - r); arc(w - r, h - r, 0);
		line(w - r, h, r, h); arc(r, h - r, Math.PI / 2);
		line(0, h - r, 0, r); arc(r, r, Math.PI);
		var total = 0;
		pieces.forEach(function (p) { p.start = total; total += p.len; });
		t.pieces = pieces; t.perimeter = total;
	};

	var pointAt = function (t, d) {
		d = ((d % t.perimeter) + t.perimeter) % t.perimeter;
		for (var i = 0; i < t.pieces.length; i++) {
			var p = t.pieces[i];
			if (d <= p.start + p.len || i === t.pieces.length - 1) {
				var k = (d - p.start) / p.len;
				if (p.type === 'line') return [p.x0 + (p.x1 - p.x0) * k, p.y0 + (p.y1 - p.y0) * k];
				var a = p.a0 + k * Math.PI / 2;
				return [p.cx + Math.cos(a) * t.r, p.cy + Math.sin(a) * t.r];
			}
		}
	};

	/* Draw the tail between distances d0 (far end) and d1 (head) with a continuous gradient.
	   Straight stretches get one stroke with a linear gradient laid along them, so the fade has no steps;
	   corners are drawn in fine slices. */
	var drawTail = function (t, ctx, d0, d1, alphaScale, colourFn) {
		var L = d1 - d0;
		var fOf = function (d) { return Math.max(0, Math.min(1, 1 - (d1 - d) / L)); };
		var stroke = function (a, b) {
			var pa = pointAt(t, a), pb = pointAt(t, b);
			var g = ctx.createLinearGradient(pa[0], pa[1], pb[0], pb[1]);
			for (var s = 0; s <= 8; s++) {
				var f = fOf(a + (b - a) * s / 8);
				g.addColorStop(s / 8, css(colourFn(f), alphaAt(f) * alphaScale));
			}
			ctx.strokeStyle = g;
			ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
		};
		// walk along the tail piece by piece, unwrapping round the start of the edge
		var d = d0;
		while (d < d1 - 0.01) {
			var m = ((d % t.perimeter) + t.perimeter) % t.perimeter;
			var p = null;
			for (var i = 0; i < t.pieces.length; i++) { if (m < t.pieces[i].start + t.pieces[i].len - 1e-6) { p = t.pieces[i]; break; } }
			if (!p) p = t.pieces[0];
			var room = p.start + p.len - m;
			if (room <= 1e-6) room = p.len;
			var next = Math.min(d1, d + room);
			if (p.type === 'line') stroke(d, next);
			else for (var a = d; a < next - 1e-6; a += 1.5) stroke(a, Math.min(next, a + 1.6)); // overlap slices slightly so corners have no seams
			d = next;
		}
	};

	var measure = function (t) {
		var rect = t.el.getBoundingClientRect();
		t.w = rect.width; t.h = rect.height;
		t.r = Math.min(parseFloat(getComputedStyle(t.el).borderTopLeftRadius) || 0, t.w / 2, t.h / 2);
		t.dpr = Math.min(window.devicePixelRatio || 1, 2);
		t.canvas.width = Math.round((t.w + PAD * 2) * t.dpr);
		t.canvas.height = Math.round((t.h + PAD * 2) * t.dpr);
		t.canvas.style.width = (t.w + PAD * 2) + 'px';
		t.canvas.style.height = (t.h + PAD * 2) + 'px';
		buildEdge(t);
	};

	var draw = function (t, now) {
		var ctx = t.ctx;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, t.canvas.width, t.canvas.height);
		ctx.setTransform(t.dpr, 0, 0, t.dpr, PAD * t.dpr, PAD * t.dpr);
		ctx.lineCap = 'butt';
		ctx.lineJoin = 'round';
		var head = (((now / t.lap) + t.start) % 1) * t.perimeter;
		var tail = head - t.tail * t.perimeter;
		var glow = function () { return t.glow; };
		// 1. wide soft glow under the tail
		ctx.shadowBlur = 0;
		ctx.lineWidth = 9; drawTail(t, ctx, tail + t.tail * t.perimeter * 0.45, head, 0.22, glow);
		// 2. the tail itself, with a gentle bloom
		ctx.shadowColor = css(t.glow, 0.9); ctx.shadowBlur = 6;
		ctx.lineWidth = 2.6; drawTail(t, ctx, tail, head, 1, function (f) { return colourAt(t, f); });
		ctx.shadowBlur = 0;
		// 3. the head: a white core inside a soft halo
		var p = pointAt(t, head);
		var halo = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 16);
		halo.addColorStop(0, css(t.head, 1));
		halo.addColorStop(0.18, css(t.head, 0.95));
		halo.addColorStop(0.4, css(t.glow, 0.45));
		halo.addColorStop(1, css(t.glow, 0));
		ctx.fillStyle = halo;
		ctx.beginPath(); ctx.arc(p[0], p[1], 16, 0, Math.PI * 2); ctx.fill();
	};

	var setup = function (el) {
		var canvas = document.createElement('canvas');
		canvas.className = 'light-trace';
		canvas.setAttribute('aria-hidden', 'true');
		canvas.style.cssText = 'position:absolute;left:' + -PAD + 'px;top:' + -PAD + 'px;pointer-events:none;z-index:3;';
		if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
		el.appendChild(canvas);
		var ds = el.dataset;
		var t = {
			el: el, canvas: canvas, ctx: canvas.getContext('2d'), visible: true,
			lap: parseFloat(ds.lightLap || 7) * 1000,
			tail: parseFloat(ds.lightTail || 0.3),
			start: parseFloat(ds.lightStart || 0),
			head: rgb(ds.lightHead || '#ffffff'),
			mid: rgb(ds.lightMid || '#b9aedb'),
			end: rgb(ds.lightEnd || '#4a4470'),
			glow: rgb(ds.lightGlow || '#b9aedb')
		};
		measure(t);
		if ('ResizeObserver' in window) new ResizeObserver(function () { measure(t); }).observe(el);
		else window.addEventListener('resize', function () { measure(t); });
		if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { t.visible = e[0].isIntersecting; }).observe(el);
		traces.push(t);
	};

	var loop = function (now) {
		for (var i = 0; i < traces.length; i++) if (traces[i].visible && traces[i].w) draw(traces[i], now);
		window.requestAnimationFrame(loop);
	};

	var start = function () {
		document.querySelectorAll('[data-light-trace]').forEach(setup);
		if (traces.length) window.requestAnimationFrame(loop);
	};
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
