Math.Inf = parseFloat('Infinity');

function return_nothing() {
}
function return_self(x) {
	return x;
}
function range(e, b, d, fn) {
	var ls = [];
	for (var i = b||0, k = d||1; i < e; i += k) {
		ls.push(fn ? fn(i) : i);
	}
	return ls;
}
function array(n, fn) {
	return range(n, 0, 1, fn);
}
function ieach(ls, fn, d) {
	var n = ls.length, r = undefined;
	for (var i = 0; i < n && r === undefined; i ++) {
		r = fn(i, ls[i], d);
	}
	return r === undefined ? d : r;
}
function keach(ls, fn, d) {
	for (var i in ls) {
		var r = fn(i, ls[i], d);
		if (r !== undefined)
			return r;
	}
	return d;
}
function each(ls, fn, d) {
	return (ls.length>=0 ? ieach : keach)(ls, fn, d);
}
function reduce(ls, fn, r) {
	return each(ls, function(i, v, d) {
		d.$ = fn(i, v, d.$);
	}, {$:r}).$;
}
function dictflip(a) {
	return each(a, function(i, v, d) {
		d[v] = i;
	}, {});
}
function keys(d) {
	return each(d, function(k, v, ls) {
		ls.push(k);
	}, []);
}
function keyfind(d, i) {
	return each(d, function(k, v) {
		if (v == i) return k;
	});
}
function extend(c) {
	function ext(d, s) {
		return keach(s || {}, function(k, v, d) {
			d[k] = v;
		}, d || {});
	}
	return reduce(arguments, function(i, v, r) {
		return i == 0 ? r : ext(r, v);
	}, c);
}
function fill(c) {
	function fil(d, s) {
		return keach(s || {}, function(k, v, d) {
			if (d[k] === undefined) d[k] = v;
		}, d || {});
	}
	return reduce(arguments, function(i, v, r) {
		return i == 0 ? r : fil(r, v);
	}, c);
}
function arrcat() {
	return ieach(arguments, function(i, v, d) {
		each(v, function(j, u, d) {
			d.push(u);
		}, d);
	}, []);
}
function sum(ls) {
	return reduce(ls, function(i, v, r) {
		return v + r;
	}, 0);
}
function random(b, e) {
	var d = (e || 0) - b;
	return b + Math.random()*d;
}
function randin(ls) {
	var ks = keys(ls),
		i = Math.floor(random(ks.length)),
		k = ks[i];
	return ls[k];
}
function limit_between(x, min, max) {
	if (x > max) x = max;
	if (x < min) x = min;
	return x;
}
function interp(x0, x1, f) {
	return x0 * (1-f) + x1 * f;
}
function squa_sum(x, y) {
	return x*x + y*y;
}
function sqrt_sum(x, y) {
	return Math.sqrt(squa_sum(x, y));
}
function rect_intersect(rt1, rt2) {
	return !(rt1.l > rt2.r || rt1.r < rt2.l ||
		rt1.t > rt2.b || rt1.b < rt2.t);
}
function circle_intersect(cr1, cr2) {
	return squa_sum(cr1.x - cr2.x, cr1.y - cr2.y) < 
		squa_sum(cr1.r + cr2.r, 0)
}
function line_circle_intersect(ln, cr) {
	var dx = ln.dx, dy = ln.dy,
		dx1 = cr.x - ln.x, dy1 = cr.y - ln.y, t1 = dx1*dx + dy1*dy,
		dx2 = dx1 - dx, dy2 = dy1 - dy, t2 = dx2*dx + dy2*dy,
		ret = { x:0, y:0, vx:0, vy:0, r:ln.r, mass:1e3 };
	if (((t1 > 0 && t2 < 0) || (t1 < 0 && t2 > 0)) &&
			squa_sum(dy*dx1 - dx*dy1, 0) / squa_sum(dx, dy) < squa_sum(cr.r+ln.r, 0)) {
		var dxq = dx*dx, dyq = dy*dy, dxy = dx*dy;
		ret.x = (dyq*ln.x+dxq*cr.x + dxy*(cr.y-ln.y)) / (dxq + dyq);
		ret.y = (dxq*ln.y+dyq*cr.y + dxy*(cr.x-ln.x)) / (dxq + dyq);
		return ret;
	}
	else if (t1 <= 0 && squa_sum(dx1, dy1) < squa_sum(cr.r+ln.r, 0)) {
		ret.x = ln.x;
		ret.y = ln.y;
		return ret;
	}
	else if (t2 >= 0 && squa_sum(dx2, dy2) < squa_sum(cr.r+ln.r, 0)) {
		ret.x = ln.x + dx;
		ret.y = ln.y + dy;
		return ret;
	}
}
function circles_hit(cr1, cr2) {
	var r = sqrt_sum(cr1.x - cr2.x, cr1.y - cr2.y),
		sin = (cr1.y - cr2.y) / r,
		cos = (cr1.x - cr2.x) / r,
		md = cr1.mass,
		me = cr2.mass,
		vd = sqrt_sum(cr1.vx, cr1.vy),
		ve = sqrt_sum(cr2.vx, cr2.vy),
		vdn = cr1.vx*cos + cr1.vy*sin, vdr = cr1.vx*sin - cr1.vy*cos,
		ven = cr2.vx*cos + cr2.vy*sin, ver = cr2.vx*sin - cr2.vy*cos;
	var vdn2 = (vdn*(md - me)+2*me*ven)/(md+me),
		ven2 = (ven*(me - md)+2*md*vdn)/(md+me);
	cr1.vx = vdn2*cos + vdr*sin; cr1.vy = vdn2*sin - vdr*cos;
	cr2.vx = ven2*cos + ver*sin; cr2.vy = ven2*sin - ver*cos;
	var cx = (cr1.x*cr2.r+cr2.x*cr1.r)/(cr1.r+cr2.r),
		cy = (cr1.y*cr2.r+cr2.y*cr1.r)/(cr1.r+cr2.r),
		f = 1.01;
	cr1.x = cx + cr1.r*cos*f; cr1.y = cy + cr1.r*sin*f;
	cr2.x = cx - cr2.r*cos*f; cr2.y = cy - cr2.r*sin*f;
}

function $(s, p) {
	return (p || document).querySelectorAll(s);
}
function $e(id) {
	return document.getElementById(id);
}
function $attr(e, a) {
	var attr = e && e.attributes[a];
	return attr && attr.textContent;
}

function newCounter() {
	var t0 = Date.now();
	return function() {
		var t = Date.now(),
			dt = t - t0;
		t0 = t;
		return dt;
	}
}
function newFPSCounter() {
	var idx = 0,
		len = 100,
		arr = Array(len);
	return function(t) {
		var dt = (t - arr[idx]) / len;
		arr[idx] = t;
		idx = (idx + 1) % len;
		return 1000.0 / dt;
	}
}
function newTicker(t, f, d) {
	var _t = {
		t: t,
		c: 0,
		d: d,
		f: f,
		run: function(dt) {
			for (_t.c += dt; _t.c >= _t.t; _t.c -= _t.t)
				_t.f(_t.d);
		},
	}
	return _t;
}
function newAnimateList() {
	var _t = [], unused = [];
	var cleaner = newTicker(1000, function() {
		var len = unused.length;
		if (len > 100 || (len > 30 && unused.last_len > 30))
			_t.clean();
		unused.last_len = len;
	});

	_t.clean = function() {
		var ls = _t.filter(return_self);
		_t.length = unused.length = 0;
		_t.push.apply(_t, ls);
	};
	_t.add = function(t) { // t should be object returned from newTicker()
		t.finished = false;
		_t[unused.length ? unused.pop() : _t.length] = t;
	};
	_t.run = function(dt) {
		for (var i = 0, n = _t.length; i < n; i ++) {
			var t = _t[i];
			if (t) {
				if (t.finished) {
					_t[i] = undefined;
					unused.push(i);
				}
				else
					t.run(dt);
			}
		}
		cleaner.run(dt);
	}
	return _t;
}
function newStateMachine(stes) {
	var _t = {
		n: undefined,
		s: undefined, // object like { run:fn(dt,d), [init:fn(d)], [quit:fn(d,n)] }
		d: {},
		stes: stes,
		run: function(dt) {
			if (_t.s) {
				var n = _t.s.run(dt, _t.d);
				if (n !== undefined) _t.set(n);
			}
		},
		set: function(n) {
			_t.n = n;
			if (_t.s && _t.s.quit)
				_t.s.quit(_t.d, n)
			_t.s = _t.stes[n];
			_t.d = _t.s && _t.s.data || {};
			if (_t.s && _t.s.init)
				_t.s.init(_t.d);
		}
	}
	return _t;
}

var DC = (function(canv) {
	var _t = canv.getContext('2d');
	_t.canv = canv;
	_t.clear = function() {
		_t.clearRect(0, 0, canv.width, canv.height);
	}
	_t.drawImageInt = function(i, sx, sy, sw, sh, dx, dy, dw, dh) {
		var f = Math.floor;
		sx = f(sx);
		sy = f(sy);
		sw = f(sw);
		sh = f(sh);
		dx = f(dx);
		dy = f(dy);
		dw = f(dw);
		dh = f(dh);
		if (sw > 0 && sh > 0)
			_t.drawImage(i, sx, sy, sw, sh, dx, dy, dw, dh);
	}
	_t.font = '20px Arial';
	_t.textAlign = 'center';
	_t.strokeStyle = 'rgba(255,128,0,0.5)';
	_t.fillStyle = 'white';
	_t.lineWidth = 3;
	return _t;
})($e('canv'));

var RES = (function(res) {
	var _t = {};
	_t.process = 0;
	function getSrc(from) {
		var st = from.split(' '),
			im = $e(st[0]);
		if (st.length == 5) return {
			s: im,
			x: parseInt(st[1]),
			y: parseInt(st[2]),
			w: parseInt(st[3]),
			h: parseInt(st[4]),
		}
		else return {
			s: im,
			x: 0,
			y: 0,
			w: im.naturalWidth,
			h: im.naturalHeight,
		}
	}
	function getTrans(trans) {
		var st = trans ? trans.split(';') : [];
		return ieach(st, function(i, s, d) {
			var k = s.substr(0, s.indexOf(':')),
				v = s.substr(k.length + 1);
			v = v.replace(/{{([^{}]+)}}/gm, function(match, name) {
				var r = eval(name);
				return r.join ? r.join(',') : r;
			});
			ieach(v.split(','), function(i, v) {
				d.push({ k:k, v:v });
			});
		}, []);
	}
	function updateCanvas(canv, from, trans) {
		var sc = getSrc(from),
			ts = getTrans(trans),
			dc = canv.getContext('2d');
		canv.width = sc.w * ts.length;
		canv.height = sc.h;
		ieach(ts, function(i, t) {
			dc.save();
			if (t.k == 'mirror') {
				if (t.v == 'x') {
					dc.translate(canv.width, 0);
					dc.scale(-1, 1);
				}
				else if (t.v == 'y') {
					dc.translate(0, canv.height);
					dc.scale(1, -1);
				}
				dc.drawImage(sc.s, sc.x, sc.y, sc.w, sc.h,
					0, 0, sc.w, sc.h);
			}
			else if (t.k == 'rotate') {
				dc.translate(sc.w*i + sc.w/2, sc.h/2);
				dc.rotate(parseInt(t.v)*Math.PI/180);
				dc.drawImage(sc.s, sc.x, sc.y, sc.w, sc.h,
					-sc.w/2, -sc.h/2, sc.w, sc.h);
			}
			dc.restore();
		});
	}
	function loaded() {
		ieach(res.children, function(i, v, d) {
			if (v.tagName == 'CANVAS') {
				var from = $attr(v, 'from'),
					trans = $attr(v, 'transform');
				if (from)
					updateCanvas(v, from, trans);
				d[v.id] = v;
			}
			else if (v.tagName == 'IMG') {
				d[v.id] = v;
			}
			else if (v.tagName == 'SCRIPT') {
				d[v.id] = eval(v.innerHTML)(_t);
			}
		}, _t);
	}
	_t.check = function check(fn) {
		var ls = ieach(res.children, function(i, v, d) {
			if (v.tagName == 'IMG')
				d.push(v.complete ? 1 : 0);
		}, []);
		_t.process = sum(ls) / ls.length;
		if (_t.process == 1) {
			loaded();
			fn();
		}
		else setTimeout(function() {
			check(fn);
		}, 500);
	};
	return _t;
})($e('res'));

var SPRITE = (function() {
	function getIndex(ls, deadOrAlive) {
		var n = ls.length;
		for (var i = 0; i < n; i ++)
			if (!ls[i].isAlive != !deadOrAlive) return i;
		return n;
	}
	function insertToList(ls, v) {
		var i = getIndex(ls, true);
		ls[i] = v;
		return i;
	}
	function loop(ls, fn) {
		var a = 0,
			n = ls.length;
		for (var i = 0; i < n; i ++) {
			var v = ls[i];
			if (v.isAlive) {
				fn(i, v);
				a ++;
			}
		}
		// no one alive? clear the array then
		if (a == 0 && n > 0)
			ls.length = 0;
	}
	function addToLayer(obj) {
		var layer = _t.layer[obj.layer];
		if (!layer) {
			layer = _t.layer[obj.layer] = [];
			_t.layer_sort = keys(_t.layer).sort();
		}
		return insertToList(layer, obj);
	}
	var _t = {
		objs: {},
		layer: {},
		init: {},
		proto: {},
		objs_sort: [],
		layer_sort: [],
	};
	_t.newCls = function(c, proto, init) {
		var from = proto.from ? new _t.init[proto.from]() : {};
		proto = extend(from, proto);
		proto.clsName = c;

		if (!_t.objs[c]) {
			_t.objs[c] = [];
			_t.objs_sort = keys(_t.objs).sort();
		}
		_t.init[c] = init;
		_t.proto[c] = init.prototype = proto;

		return proto;
	};
	_t.newObj = function(c, data) {
		var obj = new _t.init[c](data);
		obj.obj_idx = insertToList(_t.objs[c], obj);
		obj.layer_idx = addToLayer(obj);
		return obj;
	};
	_t.eachObj = function(fn, c) {
		if (c)
			loop(_t.objs[c], fn);
		else ieach(_t.objs_sort, function(i, c) {
			loop(_t.objs[c], fn);
		});
	};
	_t.eachLayerObj = function(fn, c) {
		if (c)
			loop(_t.layer[c], fn);
		else ieach(_t.layer_sort, function(i, c) {
			loop(_t.layer[c], fn);
		});
	}
	_t.each2Obj = function(fn, c1, c2) {
		loop(_t.objs[c1], function(i, v1) {
			loop(_t.objs[c2], function(j, v2) {
				if (c1 != c2 || j < i)
					fn(v1, v2);
			});
		});
	};
	_t.clrObj = function(c) {
		_t.eachObj(function(i, v) {
			v.isAlive = false;
		}, c);
	};
	_t.moveToLayer = function(obj, layer) {
		if (obj.layer != layer) {
			if (_t.layer[obj.layer][obj.layer_idx] == obj)
				_t.layer[obj.layer][obj.layer_idx] = { isAlive:false };
			obj.layer = layer;
			obj.layer_idx = addToLayer(obj);
		}
	}
	_t.getAliveOne = function(c) {
		var ls = _t.objs[c],
			i = getIndex(ls, false);
		return ls[i];
	};
	return _t;
})();

var STORY = (function() {
	var _t = [];
	_t.events = dictflip([
		'STORY_LOAD',
		'GAME_INPUT',
		'OBJECT_OUT',
		'PLAYER_HIT',
		'PLAYER_DYING',
		'PLAYER_DEAD',
		'PLAYER_AUTOCOLLECT',
		'PLAYER_GETDROP',
		'PLAYER_GRAZE',
		'PLAYER_FIRE',
		'PLAYER_BOMB',
		'PLAYER_BOMBEND',
		'DROP_COLLECTED',
		'BULLET_HIT',
		'ENEMY_KILL'
	]);
	_t.state = _t.anim = _t.hook = {};
	_t.load = function(tl, hook) {
		_t.state = newStateMachine(tl);
		_t.anim = newAnimateList();
		_t.hook = extend({
			init: undefined,
			quit: undefined,
			before_run: undefined,
			after_run: undefined,
			before_on: undefined,
			after_on: undefined,
		}, hook);
		_t.on(_t.events.STORY_LOAD)
	}
	_t.timeout = function(f, t, d, n) {
		var s = _t.state.s;
		n = (n >= 0) ? n : 1;
		_t.anim.add(newTicker(t, function(d) {
			this.finished = _t.state.s != s || f(d, --n) || n <= 0;
		}, d));
	}
	_t.run = function(dt) {
		if (_t.hook.before_run)
			_t.hook.before_run(dt, _t.state.d, _t.state.s);
		_t.state.run(dt);
		if (_t.hook.after_run)
			_t.hook.after_run(dt, _t.state.d, _t.state.s);

		_t.anim.run(dt);
	};
	_t.on = function(e, v) {
		var sm = _t.state;
		if (_t.hook.before_on)
			_t.hook.before_on(e, v, sm.d, sm.s);
		if (sm.s && sm.s.on)
			sm.s.on(e, v, sm.d);
		if (_t.hook.after_on)
			_t.hook.after_on(e, v, sm.d, sm.s);
	};
	return _t;
})();

var GAME = (function() {
	function testhit(c1, c2, dt) {
		SPRITE.each2Obj(function(v1, v2) {
			if (rect_intersect(v1.rect, v2.rect))
				v1.hit(v2, dt)
		}, c1, c2);
	};
	var _t = [];
	_t.state = 0;
	_t.states = dictflip([
		'READY',
		'RUNNING',
		'PAUSE',
		'ENDED',
	]);
	_t.rect = {
		l: 0,
		t: 0,
		r: DC.canv.width,
		b: DC.canv.height
	};
	_t.start = function(n) {
		STORY.state.set(n);
		_t.state = _t.states.RUNNING;
	};
	_t.run = function(dt) {
		ieach(SPRITE.objs_sort, function(i, c1) {
			var hits = SPRITE.proto[c1].hits;
			if (hits) ieach(hits, function(i, c2) {
				testhit(c1, c2, dt);
			});
		});
		SPRITE.eachObj(function(i, v) {
			v.run(dt);
		});
		STORY.run(dt);
	};
	_t.draw = function() {
		DC.clear();
		SPRITE.eachLayerObj(function(i, v) {
			v.draw();
		})
	};
	_t.keyste = {};
	var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	_t.keychars = ieach(chars, function(i, v, d) {
		d[v] = v.charCodeAt(0);
	}, {});
	_t.input = function(e) {
		_t.keyste.shiftKey = e.shiftKey;
		_t.keyste.ctrlKey = e.ctrlKey;
		if (e.type == 'keydown') {
			// to supress repeated keydown event
			if (_t.keyste[e.which])
				return;
			_t.keyste[e.which] = 1;
		}
		else if (e.type == 'keyup') {
			_t.keyste[e.which] = 0;
		}
		STORY.on(STORY.events.GAME_INPUT, e);
	};
	return _t;
})();

var UTIL = {
	// fs can be function, frame array, or a single frame
	addFrameAnim: function(v, t, fs) {
		v.anim(t, function(d) {
			if (d.callback)
				d.frames = d.callback(v, d);
			if (d.frames) {
				d.index = (d.index + 1) % d.frames.length;
				v.data.frame = d.frames[d.index];
			}
		}, {
			callback: fs.call && fs,
			frames: fs.length >= 0 ? fs : [fs],
			index: 0
		}, 'frame');
	},
	// ps should be array of objects like
	// { x/fx:0, y/fy:0, v:10 }
	// x and y should be between 0 and 1
	addPathAnim: function(v, t, ps) {
		v.anim(t, function(d) {
			var e = v.data,
				n = d.pathnodes[d.index];
			if (!n)
				return true;

			if (+n.fx === n.fx)
				n.x = interp(GAME.rect.l, GAME.rect.r, n.fx);
			if (+n.fy === n.fy)
				n.y = interp(GAME.rect.t, GAME.rect.b, n.fy);

			if (d.index == 0) {
				e.x = n.x;
				e.y = n.y;
				d.index ++;
			} else {
				var dx = n.x - e.x,
					dy = n.y - e.y,
					r = sqrt_sum(dx, dy),
					f = n.v / r;
				e.x = e.x * (1-f) + n.x * f;
				e.y = e.y * (1-f) + n.y * f;
				if (f >= 1) // to next node
					d.index ++;
			}
		}, {
			pathnodes: ps,
			index: 0
		}, 'path');
	},
	newTimeRunner: function(t, n) {
		return function(dt, d) {
			d.age = (d.age || 0) + dt;
			if (d.age > t) return n;
		}
	},
	// stes: array of objects like
	// { life:1000, [next:1] }
	newAliveState: function(stes) {
		function init(d) {
			d.age = 0;
		}
		function run(dt, d) {
			d.age += dt;
			if (d.age > d.life)
				return d.next !== undefined ? d.next : -1;
		}
		stes = ieach(stes, function(k, v, d) {
			d[k] = { run:run, init:init, data:extend({}, v) }
		}, []);

		var s = newStateMachine(stes);
		s.setOld = s.set;
		s.set = function(k) {
			var i = ieach(this.stes, function(i, v, d) {
				if (v.data.name==k) return i;
			}, k);
			this.setOld(i);
			this.is_creating = this.d.name == 'creating';
			this.is_dying = this.d.name == 'dying';
		}
		s.die = function() {
			s.set('dying');
		}
		s.create = function() {
			s.set('creating');
		}
		s.set(0);
		return s;
	},
};

(function() {
	var dt = newCounter();
	var gameTick = newTicker(10, function() {
		if (GAME.state == GAME.states.RUNNING)
			GAME.run(10);
	});
	var uiTick = newTicker(100, function(fns) {
		ieach($('.ui'), function(i, e) {
			ieach(e.attributes, function(i, attr) {
				var n = attr.name,
					t = attr.textContent,
					k = 'exec:'+n+':'+t,
					f = fns[attr.name];
				if (f) (e[k] = e[k] || f(e, t)).apply(e);
			});
		});
	}, {
		'ui-bind': function(e, t) {
			return Function(($attr(e, 'ui-bind-attr') || 'this.innerHTML')+'='+t);
		},
		'ui-show': function(e, t) {
			return Function('this.style.display=('+t+')?"block":"none"');
		}
	});
	setInterval(function() {
		var t = Math.min(dt(), 100);
		gameTick.run(t);
		uiTick.run(t);
	}, 10);

	GAME.fps = 0;
	var fpsCounter = newFPSCounter();
	requestAnimationFrame(function render(t) {
		GAME.fps = fpsCounter(t);
		GAME.draw();
		requestAnimationFrame(render);
	});
	
	ieach(['keydown', 'keyup'], function(i, v) {
		window.addEventListener(v, function(e) {
			GAME.input(e);
			gameTick.run(Math.min(dt(), 100));
		});
	});
})();

SPRITE.newCls('Basic', {
	layer: 'L10',
	runBasic: undefined,
	run: function(dt) {
		var d = this.data, s = this.state;

		s.run(dt);
		if (!s.d.life)
			this.isAlive = false;

		if (d.parent && d.parent.state.is_dying && !s.is_dying)
			s.die();

		var delta = 1;
		if (s.is_creating)
			delta = dt / s.d.life;
		else if (s.is_dying)
			delta = - dt / s.d.life;
		d.opacity = limit_between((+d.opacity || 0) + delta, 0, 1);

		if (this.runBasic)
			this.runBasic(dt, d, s);
	},
	drawBasic: undefined,
	drawText: function(d, s) {
		if (d.font)
			DC.font = d.font;
		if (d.color)
			DC.fillStyle = d.color;
		DC.fillText(d.t, d.x, d.y);
	},
	drawFrame: function(d, s) {
		var f = d.frame,
			w = (f.w || f.sw) * d.scale,
			h = (f.h || f.sh) * d.scale;
		if (f.rotate) {
			var t = +f.rotate===f.rotate ? f.rotate :
				Math.PI*1.5 + Math.atan2(d.vy, d.vx);
			DC.translate(d.x, d.y);
			DC.rotate(t);
			DC.drawImageInt(RES[f.res],
				f.sx, f.sy, f.sw, f.sh,
				-w/2, -h/2, w, h);
		}
		else DC.drawImageInt(RES[f.res],
			f.sx, f.sy, f.sw, f.sh,
			d.x-w/2, d.y-h/2, w, h);
	},
	draw: function() {
		var d = this.data, s = this.state;
		if (d.opacity > 0) {
			DC.save();
			if (d.opacity < 1)
				DC.globalAlpha = d.opacity;

			if (this.drawBasic)
				this.drawBasic(d, s);
			else if (d.frame)
				this.drawFrame(d, s);
			else if (d.text)
				this.drawText(d, s);
			DC.restore();
		}
	},
	anim: function(t, fn, d, id) {
		var t = newTicker(t, function(obj) {
			this.finished = fn(d, obj) || !obj.isAlive;
		}, this);
		STORY.anim.add(t);
		t.f(t.d);

		if (id) {
			var dict = this.animations;
			if (!dict)
				dict = this.animations = {};
			if (dict[id])
				dict[id].finished = true;
			dict[id] = t;
		}

		return t;
	},
	states: [
		{ name:'creating',	life: 500,		next: 1 },
		{ name:'living',	life: Math.Inf, next: 2 },
		{ name:'dying',		life: 500,		next:-1 }
	],
}, function(d) {
	this.isAlive = true;
	this.data = d = extend({
		x: interp(GAME.rect.l, GAME.rect.r, 0.5),
		y: interp(GAME.rect.t, GAME.rect.b, 0.5),
		text: 'Static Text',
		color: undefined,
		font: undefined,

		parent: undefined, // if parent is dead, it will kill self too

		frame: undefined, // i.e. {res:'player0L', sx:0, sy:0, sw:10, sh:10, w:10, h:10}
		scale: 1,

		frtick: 50,
		frames: undefined, // array of frames
		pathtick: 30,
		pathnodes: undefined, // array of objects like { x/fx:0, y/fy:0, v:1}

		states: undefined,
		layer: undefined,
	}, d);
	this.state = UTIL.newAliveState(d.states || this.states);
	if (d.frames)
		UTIL.addFrameAnim(this, d.frtick, d.frames);
	if (d.pathnodes)
		UTIL.addPathAnim(this, d.pathtick, d.pathnodes);
	if (d.layer)
		this.layer = d.layer;
});

SPRITE.newCls('Circle', {
	from: 'Basic',
	runCircle: undefined,
	mkRect: function(rt, d) {
		rt.l = Math.min(d.x0, d.x) - d.r*1.1;
		rt.t = Math.min(d.y0, d.y) - d.r*1.1;
		rt.r = Math.max(d.x0, d.x) + d.r*1.1;
		rt.b = Math.max(d.y0, d.y) + d.r*1.1;
	},
	checkPosition: function(rt, sp) {
		if (rt.r+sp.l < GAME.rect.l ||
			rt.l-sp.r > GAME.rect.r ||
			rt.b+sp.t < GAME.rect.t ||
			rt.t-sp.b > GAME.rect.b) {
			this.isAlive = false;
			STORY.on(STORY.events.OBJECT_OUT, this);
		}
	},
	runBasic: function(dt, d, s) {
		d.x0 = d.x;
		d.y0 = d.y;
		if (this.runCircle)
			this.runCircle(dt, d, s);
		d.x += d.vx * dt;
		d.y += d.vy * dt;

		var rt = this.rect, sp = this.space;
		this.mkRect(rt, d);
		this.checkPosition(rt, sp);
	},
	drawCircle: function(d, s) {
		if (d.color)
			DC.fillStyle = d.color;
		DC.beginPath();
		DC.arc(d.x, d.y, d.r, 0, 2*Math.PI);
		DC.closePath();
		DC.fill();
	},
	drawBasic: function(d, s) {
		if (d.frame)
			this.drawFrame(d, s);
		else
			this.drawCircle(d, s);
	},
	space: {
		l: 40,
		r: 40,
		t: 40,
		b: 20
	},
}, function(d) {
	d = extend({
		r: 10,
		vx: 0,
		vy: 0,
		x0: 0,
		y0: 0,
	}, d);
	SPRITE.init.Basic.call(this, d);
	this.rect = { l:0, t:0, r:0, b:0 };
});

SPRITE.newCls('Player', {
	from: 'Basic',
	hits: [
		'Player',
		'Ball',
		'Stick',
		'Enemy',
		'Dannmaku',
		'Drop',
	],
	hit: function(v) {
		var d = this.data,
			e = v.data;
		if (v.clsName == SPRITE.proto.Drop.clsName && v.state.d.name=='living') {
			if (circle_intersect(d, { x:e.x, y:e.y, r:20 })) {
				STORY.on(STORY.events.PLAYER_GETDROP, this);
				STORY.on(STORY.events.DROP_COLLECTED, v);
			}
			else
				e.collected = this;
		}
		else if (v.clsName == SPRITE.proto.Player.clsName) {
			if (circle_intersect(d, e)) {
				var r = sqrt_sum(d.x - e.x, d.y - e.y),
					sin = (d.y - e.y) / r,
					cos = (d.x - e.x) / r,
					cx = (d.x*e.r+e.x*d.r)/(d.r+e.r),
					cy = (d.y*e.r+e.y*d.r)/(d.r+e.r),
					f = 1.01;
				d.x = cx + d.r*cos*f; d.y = cy + d.r*sin*f;
				e.x = cx - e.r*cos*f; e.y = cy - e.r*sin*f;
			}
		}
		else if (v.clsName == SPRITE.proto.Stick.clsName) {
			if (!this.state.d.isInvinc && line_circle_intersect(e, { x:d.x, y:d.y, r:d.h })) {
				STORY.on(STORY.events.PLAYER_HIT, this);
			}
			else if (line_circle_intersect(e, d) && !e.grazed) {
				STORY.on(STORY.events.PLAYER_GRAZE, e.grazed = this);
			}
		}
		else if (v.state.d.mkDamage) {
			if (!this.state.d.isInvinc && circle_intersect({ x:d.x, y:d.y, r:d.h }, e)) {
				STORY.on(STORY.events.PLAYER_HIT, this);
			}
			else if (circle_intersect(d, e) && !e.grazed) {
				STORY.on(STORY.events.PLAYER_GRAZE, e.grazed = this);
			}
		}
	},
	
	runPlayer: function(dt, d, s) {
		var m = GAME.keyste.shiftKey,
			v = m ? 0.12 : 0.36;
		d.slowMode = m;
		d.x0 = d.x;
		d.y0 = d.y;

		var vx = 0,
			vy = 0;
		if (GAME.keyste[d.conf.key_left])
			vx = -v;
		else if (GAME.keyste[d.conf.key_right])
			vx = +v;
		if (GAME.keyste[d.conf.key_up])
			vy = -v;
		else if (GAME.keyste[d.conf.key_down])
			vy = +v;
		if (vx && vy) {
			vx /= 1.414;
			vy /= 1.414
		}
		d.vx = vx;
		d.vy = vy;
		d.x += d.vx * dt;
		d.y += d.vy * dt;

		// FIRE!
		if (GAME.keyste[d.conf.key_fire]) {
			if (!d.is_firing) {
				d.fire_tick = newTicker(d.conf.fire_interval, function(v) {
					STORY.on(STORY.events.PLAYER_FIRE, v);
				}, this);
				d.fire_tick.f(this);
			}
			d.is_firing = true;
			d.fire_count = d.conf.fire_count;
		}
		else if (d.is_firing) {
			d.fire_count -= dt;
			if (d.fire_count <= 0)
				d.is_firing = false;
		}
		if (d.is_firing)
			d.fire_tick.run(dt);

		// BOMB!
		if (GAME.keyste[d.conf.key_bomb] && (s.d.name=='living' || s.d.juesi) &&!s.d.bomb)
			STORY.on(STORY.events.PLAYER_BOMB, this);

		// AUTO COLLECT!
		if (d.y < interp(GAME.rect.t, GAME.rect.b, 0.3))
			STORY.on(STORY.events.PLAYER_AUTOCOLLECT, v);
	},
	onStateChange: function(s, d) {
		if (s.is_dying)
			STORY.on(STORY.events.PLAYER_DYING, this);
	},
	runBasic: function(dt, d, s) {
		if (!this.isAlive) {
			STORY.on(STORY.events.PLAYER_DEAD, this);
			return;
		}

		if (!s.is_dying)
			this.runPlayer(dt, d, s);

		// limit player move inside boundary
		if (d.x-d.r < GAME.rect.l)
			d.x = GAME.rect.l + d.r;
		if (d.x+d.r > GAME.rect.r)
			d.x = GAME.rect.r - d.r;
		if (d.y-d.r < GAME.rect.t)
			d.y = GAME.rect.t + d.r;
		if (d.y+d.r > GAME.rect.b)
			d.y = GAME.rect.b - d.r;

		this.rect.l = d.x - d.r*1.1;
		this.rect.t = d.y - d.r*1.1;
		this.rect.r = d.x + d.r*1.1;
		this.rect.b = d.y + d.r*1.1;

		if (this.last_state != s.d)
			this.onStateChange(s, this.last_state);
		this.last_state = s.d;
	},
	drawBasic: function(d, s) {
		if (this.state.d.isInvinc)
			DC.globalAlpha = 0.5;

		if (d.frame)
			this.drawFrame(d, s);
	},

	states: [
		{ name:'creating',	life: 1000,		next: 1, isInvinc:1 },
		{ name:'living',	life: Math.Inf, next: 2, isInvinc:0 },
		{ name:'dying',		life: 1000,		next:-1, isInvinc:1 },
		{ name:'bomb',		life: 5000,		next: 1, isInvinc:1 },
		{ name:'juesi',		life: 100,		next: 2, isInvinc:1 },
	],
}, function(d) {
	d = extend({
		r: 15,
		h: 1,

		x: interp(GAME.rect.l, GAME.rect.r, 0.5),
		y: interp(GAME.rect.t, GAME.rect.b, 0.8),
		vx: 0,
		vy: 0,
		x0: 0,
		y0: 0,

		frtick: 120,
	  	frames: function(v, d) {
			var fs = RES.frames.Player0;
			if (v.state.is_dying) {
				fs = RES.frames.PlayerD;
				if (d.index + 1 > fs.length - 1)
					d.index = fs.length - 2;
			}
			else if (Math.abs(v.data.vx) > 0.1) {
				fs = v.data.vx < 0 ? RES.frames.PlayerL : RES.frames.PlayerR;
				if (d.frames != fs)
					d.index = 0;
				if (d.index + 1 > fs.length - 1)
					d.index = 4;
			}
			return fs;
		},
	}, d);
	SPRITE.init.Basic.call(this, d);
	this.rect = { l:0, t:0, r:0, b:0 };

	this.data.conf = extend({
		key_left: 37,
		key_up: 38,
		key_right: 39,
		key_down: 40,
		key_fire: GAME.keychars.Z,
		key_bomb: GAME.keychars.X,
		fire_interval: 50,
		fire_count: 500,
	}, this.data.conf);
});

SPRITE.newCls('Ball', {
	from: 'Circle',
	layer: 'L20',
	hits: [
		'Ball',
	],
	hit: function(v) {
		var d = this.data,
			e = v.data;
		if (circle_intersect(d, e))
			circles_hit(d, e);
	},

	states: [
		{ name:'creating',	life: 200,		next: 1, mkDamage:0 },
		{ name:'living',	life: Math.Inf, next: 2, mkDamage:1 },
		{ name:'dying',		life: 500,		next:-1, mkDamage:0 },
	],
}, function(d) {
	SPRITE.init.Circle.call(this, d);
	this.data.mass = this.data.r;
});

SPRITE.newCls('Stick', {
	from: 'Circle',
	layer: 'L20',
	hits: [
		'Ball',
	],
	hit: function(v) {
		var d = this.data,
			e = v.data;
			cr = line_circle_intersect(d, e);
		if (cr)
			circles_hit(cr, e);
	},
	mkRect: function(rt, d) {
		rt.l = Math.min(d.x0, d.x, d.x + d.dx);
		rt.t = Math.min(d.y0, d.y, d.y + d.dy);
		rt.r = Math.max(d.x0, d.x, d.x + d.dx);
		rt.b = Math.max(d.y0, d.y, d.y + d.dy);
	},
	drawBasic: function(d, s) {
		DC.beginPath();
		DC.moveTo(d.x, d.y);
		DC.lineTo(d.x + d.dx, d.y + d.dy);
		DC.lineWidth = d.r;
		DC.stroke();
		DC.closePath();
	},

	states: [
		{ name:'creating',	life: 200,		next: 1, mkDamage:0 },
		{ name:'living',	life: Math.Inf, next: 2, mkDamage:1 },
		{ name:'dying',		life: 500,		next:-1, mkDamage:0 },
	],
}, function(d) {
	d = extend({
		dx: 0,
		dy: (GAME.rect.b - GAME.rect.t)*0.2,
	}, d);
	SPRITE.init.Circle.call(this, d);
	this.data.mass = 100;
});

SPRITE.newCls('Enemy', {
	from: 'Circle',
	hits: [
		'Bullet',
	],
	hit: function(v) {
		var d = this.data,
			e = v.data;
		if (this.state.is_dying || v.state.is_dying)
			return;
		if (circle_intersect(d, e)) {
			d.damage ++;
			STORY.on(STORY.events.BULLET_HIT, v);
			if (d.damage >= d.life) {
				STORY.on(STORY.events.ENEMY_KILL, this);
			}
		}
	},
	
	states: [
		{ name:'creating',	life: 500,		next: 1, mkDamage:0 },
		{ name:'living',	life: Math.Inf, next: 2, mkDamage:1 },
		{ name:'dying',		life: 500,		next:-1, mkDamage:0 },
	],
}, function(d) {
	d = extend({
		r: 20,
		y: interp(GAME.rect.t, GAME.rect.b, 0.1),
		life: 10,
		damage: 0
	}, d);
	SPRITE.init.Circle.call(this, d);
});

SPRITE.newCls('Drop', {
	from: 'Circle',
	layer: 'L20',
	runCircle: function(dt, d, s) {
		var v = d.collected;
		if (v && !v.isAlive)
			v = d.collected = SPRITE.getAliveOne('Player');
		if (v && v.isAlive && !v.state.is_dying) {
			var e = v.data,
				v = d.collected_auto ? 0.8 : sqrt_sum(d.vx, d.vy),
				dx = e.x - d.x,
				dy = e.y - d.y,
				r = sqrt_sum(dx, dy);
			d.vx = v * dx / r;
			d.vy = v * dy / r;
			if (!d.collected_auto)
				d.collected = undefined;
		}
		else if (d.vy < 0.15) {
			d.vy += 0.001 * dt;
			d.vx *= 0.9;
		}
	},
	space: {
		l: 40,
		r: 40,
		t: 300,
		b: 20
	},
	states: [
		{ name:'creating',	life: 300,		next: 1 },
		{ name:'living',	life: Math.Inf, next: 2 },
		{ name:'dying',		life: 100,		next:-1 },
	],
}, function(d) {
	d = extend({
		r: 60,
		vy: -0.4,
		collected: undefined,
		collected_auto: false,
		frames: RES.frames.Drops[2],
	}, d);
	SPRITE.init.Circle.call(this, d);
});

SPRITE.newCls('Bullet', {
	from: 'Circle',
	layer: 'L20',
	states: [
		{ name:'creating',	life: 50,		next: 1 },
		{ name:'living',	life: Math.Inf, next: 2 },
		{ name:'dying',		life: 400,		next:-1 },
	],
}, function(d) {
	d = extend({
		r: 5,
		vy: -1.2,
	}, d);
	SPRITE.init.Circle.call(this, d);
});

SPRITE.newCls('Dannmaku', {
	from: 'Circle',
	layer: 'L20',
	states: [
		{ name:'creating',	life: 100,		next: 1, mkDamage:0 },
		{ name:'living',	life: Math.Inf, next: 2, mkDamage:1 },
		{ name:'dying',		life: 100,		next:-1, mkDamage:0 },
	],
}, function(d) {
	d = extend({
		r: 5,
		vy: 0.3,
	}, d);
	SPRITE.init.Circle.call(this, d);
});

// for test only
function newPlayer() {
	var p = SPRITE.newObj('Player');
	p.onmyous = {};
	keach({
		'left': { val:0.9, max:0.9, min:0.6, delta:-0.002 },
		'right': { val:0.1, max:0.4, min:0.1, delta:+0.002 },
	}, function(k, a) {
		p.onmyous[k] = SPRITE.newObj('Basic', {
			parent: p,
			frames: RES.frames.Onmyou,
			offsetRadius: 25,
			anim: a,
		});
		p.onmyous[k].runBasic = function(dt, d, s) {
			var p = d.parent,
				a = d.anim,
				delta = p.data.slowMode ? a.delta : -a.delta;
			a.val = limit_between(a.val + dt * delta, a.min, a.max);
			d.x = p.data.x + d.offsetRadius * Math.cos(a.val * Math.PI);
			d.y = p.data.y - d.offsetRadius * Math.sin(a.val * Math.PI);
		};
	});
	p.pslow = {};
	p.anim(100, function(d, p) {
		p.showSlow = p.isAlive && !p.state.is_dying && p.data.slowMode;
		if (!p.showSlow || p.pslow.isAlive)
			return;
		p.pslow = SPRITE.newObj('Basic', {
			layer: 'L99',
			parent: p,
			frames: RES.frames.PSlow,
		});
		p.pslow.runBasic = function(dt, d, s) {
			var p = d.parent;
			d.x = p.data.x;
			d.y = p.data.y;
			if (p.showSlow && s.is_dying)
				s.create();
			if (!p.showSlow && !s.is_dying)
				s.die();
		};
	});
}
function newBall(d) {
	var t = random(-0.6, 0.6) * Math.PI / 2,
		r = random(10) + 5;
	SPRITE.newObj('Ball', {
		x: random(GAME.rect.l, GAME.rect.r),
		y: random(GAME.rect.t, interp(GAME.rect.t, GAME.rect.b, d.fy)),
		vx: d.speed*Math.sin(t),
		vy: d.speed*Math.cos(t),
		r: r,
		scale: 2.5*r / 32,
		frames: randin(RES.frames.TamaLarge),
	});
}
function newBullet(d) {
	d.from.bullet0_idx = ((d.from.bullet0_idx || 0) + 1) % RES.frames.Bullet0.length;
	d.from.bullet1_idx = ((d.from.bullet1_idx || 0) + 1) % 5;
	array(2, function(i, para) {
		var x = i % 2 ? -1 : 1;
		SPRITE.newObj('Bullet', {
			x: d.from.data.x + x*5,
			y: d.from.data.y,
			vx: 0.02*x,
			vy: -1.2,
			from: d.from,
			frames: RES.frames.Bullet0[d.from.bullet0_idx],
		});
	});
	if (d.from.bullet1_idx == 0) {
		if (!d.to) {
			var r = Math.Inf;
			SPRITE.eachObj(function(i, u) {
				if (u.state.d.mkDamage) {
					var r0 = squa_sum(u.data.x-d.from.data.x, u.data.y-d.from.data.y);
					if (r0 < r) {
						r = r0;
						d.to = u;
					}
				}
			}, 'Enemy');
		}
		array(4, function(i) {
			var x = i % 2 ? -1 : 1,
				v1 = random(0.4, 0.5),
				t = (d.from.data.slowMode ? random(-5, 5) : random(10, 20)-i*5) * Math.PI / 180,
				onmyou = x > 0 ? d.from.onmyous.right : d.from.onmyous.left;
			SPRITE.newObj('Bullet', {
				x: onmyou.data.x,
				y: onmyou.data.y,
				vy: -v1*Math.cos(t),
				vx: x*v1*Math.sin(t),
				from: d.from,
				to: d.to,
				frames: RES.frames.Bullet1,
			}).runCircle = function(dt, d, s) {
				var u = d.to,
					e = u && u.data;
				if (u && u.isAlive && u.state.d.mkDamage && !s.is_dying) {
					var dx = e.x - d.x,
						dy = e.y - d.y,
						r = sqrt_sum(dx, dy),
						v = sqrt_sum(d.vx, d.vy);
					d.vx = v * dx / r;
					d.vy = v * dy / r;
				}
			};
		})
	}
}
function newDannmaku(d) {
	var v = SPRITE.newObj('Dannmaku', d);
	d = v.data;
	if (d.type == 'FollowSource') {
		fill(d, {
			duration: 1500,
			gravity: 20e-7,
		});
		v.runCircle = function(dt, d, s) {
			if (this.state.d.age < d.duration && d.from) {
				var e = d.from.data;
				d.vx -= d.gravity * dt * (d.x - e.x);
				d.vy -= d.gravity * dt * (d.y - e.y);
			}
		};
	}
	else if (d.type == 'SlowingDown') {
		fill(d, {
			min_velocity: 0.02,
			decrease_by: 0.992,
		});
		v.runCircle = function(dt, d, s) {
			if (Math.abs(d.vx) > d.min_velocity) d.vx *= d.decrease_by;
			if (Math.abs(d.vy) > d.min_velocity) d.vy *= d.decrease_by;
		};
	}
	else if (d.type == 'FollowTarget') {
		fill(d, {
			duration: 1000,
			gravity: 10e-7,
			decrease_by: 0.98,
		});
		v.runCircle = function(dt, d, s) {
			if (this.state.d.age < d.duration) {
				d.vx *= d.decrease_by;
				d.vy *= d.decrease_by;
			}
			else {
				if (!d.to || !d.to.isAlive)
					d.to = SPRITE.getAliveOne('Player');
				if (d.to) {
					var e = d.to.data;
					d.vx -= d.gravity * dt * (d.x - e.x);
					d.vy -= d.gravity * dt * (d.y - e.y);
				}
			}
		};
	}
	else if (d.type == 'Circle') {
		fill(d, {
			theta_delta: 0.001,
			flip_each_count: true,
			flip_each_layer: true,
			decrease_by: 0.99,
		});
		if (d.flip_each_count && d.generator)
			d.theta_delta *= d.generator.count % 2 ? 1 : -1;
		if (d.flip_each_layer && d.generator)
			d.theta_delta *= d.generator.layer % 2 ? 1 : -1;
		v.runCircle = function(dt, d, s) {
			var v = sqrt_sum(d.vx, d.vy),
				sinv = d.vy / v,
				cosv = d.vx / v,
				sint = Math.sin(d.theta_delta*dt),
				cost = Math.cos(d.theta_delta*dt);
			d.vy = v * (sinv*cost + cosv*sint);
			d.vx = v * (cosv*cost - sinv*sint);
			d.theta_delta *= d.decrease_by;
		};
	}
	else if (d.type == 'OrbAround') {
		fill(d, {
			source_x: d.from.data.x,
			source_y: d.from.data.y,
			theta: 0,
			speed: 1/300,
			radius: 100,
			offset_count: 0.04,
			offset_speed: 0.1,
			flip_each_count: true,
		});
		if (d.offset_count && d.generator)
			d.theta += d.generator.count * d.offset_count;
		if (d.flip_each_count && d.generator)
			d.speed *= d.generator.count % 2 ? 1 : -1;
		v.runCircle = function(dt, d, s) {
			var f = d.from;
			if (f && f.isAlive && !f.state.is_dying) {
				d.x = d.radius*Math.sin(d.theta) + d.source_x;
				d.y = d.radius*Math.cos(d.theta) + d.source_y;
				d.theta += dt*d.speed;
			}
		};
	}
	else if (d.type == 'ZigZag') {
		fill(d, {
			delay: 500,
			interval: 5000,
			theta_delta: 0.8,
			flip_each_count: true,
			flip_each_layer: true,
		});
		if (d.flip_each_count && d.generator)
			d.theta_delta *= d.generator.count % 2 ? 1 : -1;
		if (d.flip_each_layer && d.generator)
			d.theta_delta *= d.generator.layer % 2 ? 1 : -1;
		STORY.timeout(function() {
			v.anim(d.interval, function(d, v) {
				var vr = sqrt_sum(d.vx, d.vy),
					t = Math.atan2(d.vy, d.vx) + d.theta_delta;
				d.vx = Math.cos(t) * vr;
				d.vy = Math.sin(t) * vr;
				d.theta_delta = -d.theta_delta;
			}, d);
		}, d.delay);
	}
	else if (d.type == 'Laser') {
		fill(d, {
			length: 50,
			theta: Math.PI/2,
		});
		var last = v;
		range(d.length, d.r, d.r, function(r) {
			last = SPRITE.newObj('Dannmaku', {
				vy: 0,
				head: v,
				parent: last,
				length: r,
			});
			last.runCircle = function(dt, d, s) {
				var pd = d.head.data,
					x = pd.x + d.length * Math.cos(pd.theta),
					y = pd.y + d.length * Math.sin(pd.theta);
				d.vx = (x - d.x) / dt;
				d.vy = (y - d.y) / dt;
			};
		});
		last.data.parent = v;
	}
}
function genDannmaku(d) {
	if (d.type == 'any') {
	}
	else {
		d = extend({
			theta: 0,
			theta_rand: 0.05,
			theta_rand_min: 0.8,
			theta_rand_max: 1.2,
			theta_step: 0.15,
			theta_count: 9,
			theta_reverse: false,
			theta_velocity: 0.0,
			theta_velocity_flip: false,
			count: 9,
			layers: 10,
			interval: 200,
			radius: 20,
			velocity: 0.2,
			x: undefined,
			y: undefined,
			to: undefined,
			dannmaku: undefined,
		}, {
			'com1': {
				count: 1,
				layers: 50,
				interval: 50,
			},
			'com2': {
				count: 1,
				layers: 50,
				interval: 50,
				theta_reverse: true,
			},
		}[d && d.preset], d);
		var idx = 0, cnt = d.theta_count-1;
		STORY.timeout(function(d, layer) {
			if (d.from && d.from.state.d.name=='living') {
				for(var count = 0; count < d.count; count ++) {
					if (idx ++ >= cnt)
						idx = d.theta_reverse ? -cnt : 0;
					d.theta = (Math.abs(idx) - cnt/2) * d.theta_step;
					if (d.theta_velocity_flip)
						d.theta_velocity = -d.theta_velocity;

					var to = d.to ? d.to.data : SPRITE.getAliveOne('Player').data,
						from = +d.x === d.x ? { x:d.x, y:d.y } : d.from.data,
						t = Math.atan2(to.y-from.y, to.x-from.x) +
							d.theta*random(d.theta_rand_min, d.theta_rand_max)+random(d.theta_rand);
					newDannmaku(extend({
						x: from.x + d.radius*Math.cos(t),
						y: from.y + d.radius*Math.sin(t),
						vx: d.velocity*Math.cos(t+d.theta_velocity),
						vy: d.velocity*Math.sin(t+d.theta_velocity),
						r: 3,
						from: d.from,
						frames: RES.frames.LongA,
						generator: { layer:layer, count:count },
					}, d.dannmaku));
				};
			}
			else
				this.finished = true;
		}, d.interval, d, d.layers);
	}
}
function newEnemy(d, f) {
	d = extend({
		x: random(GAME.rect.l+100, GAME.rect.r-100),
		vx: random(-0.05, 0.05),
		vy: random(0.01, 0.1),
		r: 16,
		frtick: 150,
		frames: RES.frames['Enemy'+randin([0,1])+randin([0,1,2])],
	}, {
		'com1': {
			// example
		}
	}[d && d.preset], d);
	f = f || {
		preset: '',
		delay: 1000,
		dannmaku: {
			type: 'OrbAround',
			speed: 1/500,
		},
	};
	var enm = SPRITE.newObj('Enemy', d);
	if (f) STORY.timeout(function(d) {
		genDannmaku(d);
	}, f.delay || 0, fill(f, {
		from: enm,
	}));
}
function newBoss() {
	var boss = SPRITE.newObj('Enemy', {
		r: 24,
		life: 300,
		frtick: 150,
		frames: RES.frames.EnemyX,
		pathnodes: [
			{ fx:0.0, fy:0.0, v:3 },
			{ fx:0.1, fy:0.1, v:3 },
			{ fx:0.5, fy:0.1, v:3 },
		],
	});
	boss.effects = array(3, function(i) {
		var eff = SPRITE.newObj('Basic', {
			parent: boss,
			frames: RES.frames.EffBoss,
			rot: {
				theta: 0,
				dtheta: random(0.05, 0.10) / 50,
				phi: random(1),
				dphi: random(0.01, 0.05) / 50,
				radius1: 30,
				radius2: 10,
			}
		});
		eff.runBasic = function(dt, d, s) {
			var p = d.parent,
				r = d.rot;
			r.theta += r.dtheta * dt;
			r.phi += r.dphi * dt;
			d.x = p.data.x +
				r.radius1*Math.cos(r.theta)*Math.cos(r.phi) -
				r.radius2*Math.sin(r.theta)*Math.sin(r.phi);
			d.y = p.data.y +
				r.radius1*Math.cos(r.theta)*Math.sin(r.phi) +
				r.radius2*Math.sin(r.theta)*Math.cos(r.phi);
			d.z = Math.sin(r.theta);
			d.scale = 1.0 + 0.4*Math.sin(r.theta);
		};
		eff.drawEffects = eff.draw;
		eff.draw = return_nothing;
		return eff;
	});
	boss.drawBasic = function(d, s) {
		ieach(boss.effects, function(i, v) {
			if (v.data.z < 0)
				v.drawEffects();
		});
		if (d.frame)
			this.drawFrame(d, s);
		ieach(boss.effects, function(i, v) {
			if (v.data.z >= 0)
				v.drawEffects();
		});
		DC.beginPath();
		DC.arc(d.x, d.y, d.r*1.5, 0, (d.life-d.damage)/d.life*2*Math.PI);
		DC.stroke();
		DC.closePath();
	}
}
function newEffect(v) {
	SPRITE.newObj('Circle', {
		x: v.data.x,
		y: v.data.y,
		vx: v.data.vx*=0.1,
		vy: v.data.vy*=0.1,
		frames: {
			Enemy: RES.frames.EffEnemy,
			Player: RES.frames.EffPlayer,
		}[v.clsName],
		states: [
			{ name:'creating',	life: 100,	next: 1 },
			{ name:'living',	life: 50,	next: 2 },
			{ name:'dying',		life: 850,	next:-1 },
		],
	});
	array(8, function(i) {
		var p = SPRITE.newObj('Circle', {
			x: v.data.x,
			y: v.data.y,
			vx: random(-0.2, 0.2),
			vy: random(-0.2, 0.2),
			scale: 1.5,
			frames: randin({
				Enemy: RES.frames.EffPiece,
				Player: RES.frames.EffPieceR,
			}[v.clsName]),
			states: [
				{ name:'creating',	life: 50,	next: 1 },
				{ name:'living',	life: 50,	next: 2 },
				{ name:'dying',		life: 600,	next:-1 },
			],
		})
		p.runCircle = function(dt, d, s) {
			d.vx *= 0.97;
			d.vy *= 0.97;
			d.scale *= 0.992;
		};
	});
}
function killCls() {
	ieach(arguments, function(i, c) {
		SPRITE.eachObj(function(i, v) {
			if (!v.state.is_dying)
				v.state.die();
		}, c);
	})
}
function killObj() {
	ieach(arguments, function(i, v) {
		if (!v.state.is_dying)
			v.state.die();
	})
}

GAME.statics = {
	time: 0,
	graze: 0,
	point: 0,
	miss: 0
};
var hook = {
	bg: newTicker(50, function() {
		RES.elems.bg.style['background-position-y'] = GAME.statics.time*0.02+'px';
		RES.elems.bg2.style['background-position-y'] = GAME.statics.time*0.031+'px';
	}),
	data: undefined,
	init: function(d) {
	},
	quit: function(d) {
	},
	after_run: function(dt, d) {
		GAME.statics.time += dt;
		this.bg.run(dt);
		if (this.data !== d) {
			this.quit(this.data);
			this.init(this.data = d);
		}
	},
	before_on: function(e, v, d) {
		if (e == STORY.events.STORY_LOAD) {
			SPRITE.clrObj();
			newPlayer();
		}
		else if (e == STORY.events.GAME_INPUT) {
			if (v.type == 'keyup' && v.which == 13) {
				var s = GAME.state,
					c = GAME.states;
				if (s == c.PAUSE)
					GAME.state = c.RUNNING;
				else if (s == c.RUNNING)
					GAME.state = c.PAUSE;
			}
		}
		else if (e == STORY.events.PLAYER_AUTOCOLLECT) {
			SPRITE.eachObj(function(i, u) {
				u.data.collected = v;
				u.data.collected_auto = true;
			}, 'Drop');
		}
		else if (e == STORY.events.PLAYER_HIT) {
			GAME.statics.graze --;
			v.state.set('juesi');
			/*
			STORY.timeout(function() {
				killCls('Dannmaku');
			}, 10, null, 80);
			*/
		}
		else if (e == STORY.events.PLAYER_GRAZE) {
			GAME.statics.graze ++;
		}
		else if (e == STORY.events.PLAYER_DYING) {
			var vy = -0.8,
				x = v.data.x,
				y = v.data.y;
			SPRITE.newObj('Drop', { vy:vy, x:x+90, y:y-50 });
			SPRITE.newObj('Drop', { vy:vy, x:x+30, y:y-60 });
			SPRITE.newObj('Drop', { vy:vy, x:x-30, y:y-60 });
			SPRITE.newObj('Drop', { vy:vy, x:x-90, y:y-50 });
			newEffect(v);
		}
		else if (e == STORY.events.PLAYER_DEAD) {
			GAME.statics.miss ++;
			newPlayer();
		}
		else if (e == STORY.events.PLAYER_FIRE) {
			if (!d.disable_fire)
				newBullet({
					from: v,
				});
		}
		else if (e == STORY.events.PLAYER_BOMB) {
			v.state.set('bomb');
		}
		else if (e == STORY.events.ENEMY_KILL) {
			v.state.die();
			newEffect(v);
		}
		else if (e == STORY.events.DROP_COLLECTED) {
			v.state.die();
			GAME.statics.point += 10;
		}
		else if (e == STORY.events.BULLET_HIT) {
			v.state.die();
			v.data.vx = random(-0.1, 0.1);
			v.data.vy = random(0.1, 0.2) * (v.data.vy > 0 ? -1 : 1);
			UTIL.addFrameAnim(v, v.data.frtick, randin(RES.frames.EffBullet));
		}
	}
};
var tl = {};
tl.init = {
	run: UTIL.newTimeRunner(5000, 'sec0'),
	init: function(d) {
		d.title = SPRITE.newObj('Basic', {
			t: 'Dannmaku Demo!',
			font: '30px Arial'
		});
	},
	quit: function(d) {
		d.title.state.die();
	}
};
tl.sec0 = {
	run: UTIL.newTimeRunner(20000, 'sec1'),
	init: function(d) {
		STORY.timeout(function(d, n) {
			newBall({
				speed: n > 10 ? 0.05 : 0.25,
				fy: n > 10 ? 0.6 : 0.2,
			});
		}, 20, null, 60);
	},
	quit: function(d) {
		killCls('Ball');
	},
	on: function(e, v, d) {
		if (e == STORY.events.OBJECT_OUT) {
			if (v.clsName == SPRITE.proto.Ball.clsName) {
				var fy = random(0.2, 0.6);
				newBall({
					speed: 0.6-fy,
					fy: fy
				});
			}
		}
	}
};
tl.sec1 = {
	init: function(d) {
		STORY.timeout(function(d, n) {
			if (n < 3) newEnemy();
		}, 300, null, 8);
	},
	run: function(dt, d) {
		if (d.pass) {
			tl.loop = (tl.loop || 0) + 1;
			if (tl.loop >= 5)
				return 'diag';
			else
				return 'sec1';
		}
	},
	on: function(e, v, d) {
		if (e == STORY.events.ENEMY_KILL) {
			SPRITE.newObj('Drop', {
				x: v.data.x,
				y: v.data.y
			});
			var pass = reduce(SPRITE.objs.Enemy, function(i, v, r) {
				return v.isAlive ? (r && v.state.is_dying) : r;
			}, true);
			if (pass) {
				SPRITE.eachObj(function(i, v) {
					v.state.die();
					SPRITE.newObj('Drop', {
						x: v.data.x,
						y: v.data.y,
						vx: v.data.vx *= 0.01,
						vx: v.data.vy *= 0.01,
						frames: RES.frames.Drops[1],
					});
				}, 'Dannmaku');
				STORY.timeout(function(d) {
					STORY.on(STORY.events.PLAYER_AUTOCOLLECT,
						SPRITE.getAliveOne('Player'));
					d.pass = true;
				}, 100, d);
			}
		}
		else if (e == STORY.events.OBJECT_OUT) {
			if (v.clsName == SPRITE.proto.Enemy.clsName && !v.state.is_dying)
				newEnemy();
		}
	}
};
ieach([
	{ t:'x0aabbcc', x:GAME.rect.l+50, y:interp(GAME.rect.t, GAME.rect.b, 0.8), name:'diag' },
	{ t:'y0aabbcc', x:GAME.rect.r-50, y:interp(GAME.rect.t, GAME.rect.b, 0.8) },
	{ t:'x0aabbcc', x:GAME.rect.l+50, y:interp(GAME.rect.t, GAME.rect.b, 0.8) },
	{ t:'y0aabbcc', x:GAME.rect.r-50, y:interp(GAME.rect.t, GAME.rect.b, 0.8) },
	{ t:'x0aabbcc', x:GAME.rect.l+50, y:interp(GAME.rect.t, GAME.rect.b, 0.8) },
	{ t:'y0aabbcc', x:GAME.rect.r-50, y:interp(GAME.rect.t, GAME.rect.b, 0.8), next:'boss' },
], function(i, v, tl) {
	var c = v.name || 'diag'+i, n = v.next || 'diag'+(i+1);
	tl[c] = {
		init: function(d) {
			d.age = 0;
			d.disable_fire = true;
			d.text = SPRITE.newObj('Basic', v);
		},
		run: function(dt, d) {
			if (d.pass || GAME.keyste.ctrlKey || (d.age+=dt) > 20000)
				return n;
		},
		quit: function(d) {
			d.text.state.die();
		},
		on: function(e, v, d) {
			if (e == STORY.events.GAME_INPUT) {
				if (v.which == GAME.keychars.Z) {
					if (v.type == 'keydown')
						d.pass = 0;
					else if (v.type == 'keyup' && d.pass === 0)
						d.pass = 1;
				}
			}
		},
	}
}, tl);
tl.boss = {
	init: function(d) {
		killCls('Enemy', 'Dannmaku');
		STORY.timeout(function() {
			newBoss();
		}, 1000);
	},
	run: function(dt, d) {
		if (d.pass)
			return 'end';
	},
	on: function(e, v, d) {
		if (e == STORY.events.ENEMY_KILL) {
			SPRITE.newObj('Drop', {
				x: v.data.x,
				y: v.data.y,
				pass: 1
			});
		}
		else if (e == STORY.events.DROP_COLLECTED) {
			if (v.data.pass)
				d.pass = true;
		}
	}
};
tl.end = {
	init: function(d) {
		SPRITE.newObj('Basic', {
			t: 'You Win!'
		});
	},
	run: function(dt, d) {
	}
};

RES.check(function() {
	STORY.load(tl, hook);
	GAME.start('init');
//	STORY.state.set('sec1');
});
