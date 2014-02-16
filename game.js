Math.Inf = parseFloat('Infinity');

function array(n, fn) {
	var ls = [];
	for (var i = 0; i < n; i ++) {
		ls[i] = fn(i);
	}
	return ls;
}
function range(n) {
	return array(n, function(i) {
		return i;
	});
}
function ieach(ls, fn, d) {
	var r = undefined;
	for (var i = 0, n = ls.length; i < n && r === undefined; i ++) {
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
	return ls[Math.floor(Math.random()*ls.length)];
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

function getTick() {
	return (new Date()).getTime();
}
function newCounter() {
	var t0 = getTick();
	return function() {
		var t = getTick(),
			dt = t - t0;
		t0 = t;
		return dt;
	}
}
function TimeCounter() {
	var _t = TimeCounter;
	return (_t.counter || (_t.counter = newCounter()))();
}
function FPSCounter() {
	var _t = FPSCounter,
		dt = (_t.counter || (_t.counter = newCounter()))();
	var arr = _t.arr || (_t.arr=Array(20)),
		idx = ((arr.idx || 0) + 1) % arr.length;
	arr[idx] = dt;
	arr.idx = idx;
	return 1000.0 / (sum(arr) / arr.length);
}
function newState(stes) {
	var _t = {
		state: stes[0],
		age: 0,
		ste: 0,
		set: function(s, a) {
			if (!stes[s]) s = each(stes, function(k, v) {
				if (v[s]) return k;
			});
			if (a === undefined)
				_t.age = _t.ste == s ? _t.age : 0;
			else
				_t.age = a;
			_t.ste = s;
			_t.state = stes[s] || {};
		},
		run: function(dt) {
			var d = _t.state;
			_t.age = (_t.age || 0) + dt;
			if (d && _t.age > d.life)
				_t.set(d.next, _t.age - d.life);
		}
	};
	return _t;
}
function newTicker(t) {
	var _t = {
		t: t,
		c: 0,
		run: function(dt) {
			_t.c += dt;
			if (_t.c > _t.t) {
				_t.c -= _t.t;
				return true;
			}
		}
	}
	return _t;
}

var DC = (function() {
	var canv = $e('canv'),
		_t = canv.getContext('2d');
	_t.canv = canv;
	_t.clear = function() {
		DC.clearRect(0, 0, canv.width, canv.height);
	}
	_t.font = '30px Arial';
	_t.textAlign = 'center';
	_t.strokeStyle = 'rgba(255,128,0,0.5)';
	_t.fillStyle = 'white';
	_t.lineWidth = 3;
	return _t;
})();

var RES = (function() {
	var res = $e('res'),
		_t = {};
	_t.process = 0;
	function loaded() {
		ieach(res.children, function(i, v, d) {
			if (v.tagName == 'CANVAS') {
				var from = $attr(v, 'from'),
					trans = $attr(v, 'transform');
				if (from) {
					var im = $e(from),
						dc = v.getContext('2d');
					v.width = im.naturalWidth;
					v.height = im.naturalHeight;
					if (trans == 'mirror-x') {
						dc.translate(v.width, 0);
						dc.scale(-1, 1);
					}
					else if (trans == 'mirror-y') {
						dc.translate(0, v.height);
						dc.scale(1, -1);
					}
					dc.drawImage(im, 0, 0);
				}
			}
			d[v.id] = v;
		}, _t);
		document.dispatchEvent(new CustomEvent('res.loaded'));
	}
	function check() {
		var ls = ieach(res.children, function(i, v, d) {
			if (v.tagName == 'IMG')
				d.push(v.complete ? 1 : 0);
		}, []);
		_t.process = sum(ls) / ls.length;
		if (_t.process == 1) 
			loaded();
		else
			setTimeout(check, 500);
	};
	setTimeout(check, 10);
	return _t;
})();

var SPRITE = (function() {
	var _t = {
		cls: {},
		obj: {},
		init: {},
		sort: []
	};
	_t.newCls = function(c, cls, init, from) {
		if (from) {
			cls.from = _t.cls[from];
			cls = extend({}, cls.from, cls)
		}
		cls.cls = c;
		init.prototype = cls;

		_t.cls[c] = cls;
		_t.init[c] = init;
		if (!_t.obj[c])
			_t.obj[c] = [];

		_t.sort = keys(_t.cls).sort();
		return cls;
	};
	_t.newObj = function(c, data) {
		var ls = _t.obj[c],
			cls = _t.cls[c],
			obj = new _t.init[c](data, cls);

		var idx = ieach(ls, function(i, v) {
			if (!v.isAlive) return i;
		}, ls.length);
		obj.idx = idx;
		obj.isAlive = true;
		ls[idx] = obj;

		return obj;
	};
	_t.eachCls = function(fn) {
		ieach(_t.sort, function(i, c) {
			fn(c);
		});
	};
	_t.eachObj = function(fn, c) {
		function loopAlive(c) {
			var n = 0,
				ls = _t.obj[c];
			ieach(ls, function(i, v) {
				if (!v.isAlive)
					return;
				fn(v);
				n ++;
			});
			// no one alive? clear the array then
			if (n == 0 && ls.length)
				_t.obj[c] = [];
		}
		if (c)
			loopAlive(c);
		else
			_t.eachCls(loopAlive);
	};
	_t.clearObj = function(c) {
		_t.eachObj(function(v) {
			v.isAlive = false;
		}, c);
	}
	return _t;
})();

var STORY = (function() {
	var _t = [];
	_t.events = dictflip([
		'GAME_INPUT',
		'OBJECT_OUT',
		'PLAYER_HIT',
		'PLAYER_DEAD',
		'PLAYER_AUTOCOLLECT',
		'PLAYER_GETDROP',
		'PLAYER_GRAZE',
		'PLAYER_FIRE',
		'PLAYER_BOMB',
		'DROP_COLLECTED',
		'ENEMY_KILL'
	]);
	_t.load = function() {
		// to be finished
	}
	_t.timeline = { },
	_t.current = { },
	_t.start = function(s) {
		_t.current = {
			scene: s,
			data: {}
		};
		var p = _t.timeline[s];
		if (p && p.init) {
			p.init(_t.current.data);
		}
	};
	_t.timeouts = [];
	_t.timeoffs = [];
	_t.timeout = function(fn, t, d, n) {
		var id = _t.timeoffs.length ? _t.timeoffs.pop() : _t.timeouts.length;
		_t.timeouts[id] = {f:fn, t:t, c:0, d:d, n:n};
		return id;
	};
	_t.run = function(dt) {
		var t = _t.timeline,
			s = _t.current.scene,
			d = _t.current.data,
			p = t[s];
		if (t.all && t.all.before_run)
			t.all.before_run(dt, d, s);
		if (p) {
			var n = p.run(dt, d);
			if (n) _t.start(n);
		}
		if (t.all && t.all.after_run)
			t.all.after_run(dt, d, s);

		ieach(_t.timeouts, function(i, v) {
			if (!v) return;
			v.c += dt;
			if (v.c >= v.t) {
				if (v.n !== 0) // do at least once
					v.f.apply(v.d, [v.c, v.n]);
				if (v.n > 0) {
					v.c = 0;
					v.n --;
				}
				else if (v.n && v.n.apply(v.d)) {
					v.c = 0;
				}
				else {
					_t.timeouts[i] = undefined;
					_t.timeoffs.push(i);
				}
			}
		});
	};
	_t.on = function(e, v) {
		var t = _t.timeline,
			s = _t.current.scene,
			d = _t.current.data,
			p = t[s];
		if (t.all && t.all.before_on)
			t.all.before_on(e, v, d, s);
		if (p && p.on)
			p.on(e, v, d);
		if (t.all && t.all.after_on)
			t.all.after_on(e, v, d, s);
	};
	return _t;
})();

var GAME = (function() {
	function testhit(c1, c2, dt) {
		SPRITE.eachObj(function(v1) {
			SPRITE.eachObj(function(v2) {
				if (c1 == c2 && v2.idx >= v1.idx)
					return;
				if (v1.rect && v2.rect &&
						rect_intersect(v1.rect, v2.rect))
					v1.hit(v2, dt)
			}, c2);
		}, c1);
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
	_t.init = function() {
		STORY.load();
		STORY.start('init');
	};
	_t.run = function(dt) {
		SPRITE.eachCls(function(c1) {
			var hits = SPRITE.cls[c1].hits;
			if (hits) ieach(hits, function(i, c2) {
				testhit(c1, c2, dt);
			});
		});
		SPRITE.eachObj(function(v) {
			v.run(dt);
		});
		STORY.run(dt);
	};
	_t.draw = function() {
		DC.clear();
		SPRITE.eachObj(function(v) {
			v.draw();
		})
	};
	_t.keyste = {};
	_t.keychars = ieach('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', function(i, v, d) {
		d[v] = v.charCodeAt(0);
	}, {});
	_t.input = function(e) {
		_t.keyste.shiftKey = e.shiftKey;
		_t.keyste.ctrlKey = e.ctrlKey;
		if (e.type == 'keydown') {
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
	getAliveObjs: function(c) {
		var ls = [];
		SPRITE.eachObj(function(v) {
			ls.push(v);
		}, c);
		return ls;
	},
	// fs should be array of objects like
	// { res:'', sx:0, sy:0, sw:10, sh:10, w:10, h:10, [rotate:1] }
	newFrameTick: function(t, fs) {
		return {
			t: newTicker(t),
			f: function(v, d) {
				d.index = (d.index + 1) % d.frames.length;
				v.data.frame = d.frames[d.index];
			},
			d: {
				frames: fs,
				index: 0
			}
		}
	},
	newFrameGroupTick: function(t, fgs, fn) {
		return {
			t: newTicker(t),
			f: function(v, d) {
				d.frames = fn(v, d, fgs);
				d.index = (d.index + 1) % d.frames.length;
				v.data.frame = d.frames[d.index];
			},
			d: {
				frames: fgs[0],
				index: 0
			}
		}
	},
	// ps should be array of objects like
	// { x/fx:0, y/fy:0, v:10 }
	// x and y should be between 0 and 1
	newPathTick: function(t, ps) {
		return {
			t: newTicker(t),
			f: function(v, d) {
				var t = v.data,
					n = d.pathnodes[d.index];
				if (n) {
					if (+n.fx === n.fx)
						n.x = GAME.rect.l * (1-n.fx) + GAME.rect.r * n.fx;
					if (+n.fy === n.fy)
						n.y = GAME.rect.t * (1-n.fy) + GAME.rect.b * n.fy;
					if (d.index == 0) {
						t.x = n.x;
						t.y = n.y;
						d.index ++;
					} else {
						var dx = n.x - t.x,
							dy = n.y - t.y,
							r = sqrt_sum(dx, dy),
							f = n.v / r;
						t.x = t.x * (1-f) + n.x * f;
						t.y = t.y * (1-f) + n.y * f;
						if (f >= 1) // to next node
							d.index ++;
					}
				}
			},
			d: {
				pathnodes: ps,
				index: 0
			}
		}
	},
};

SPRITE.newCls('Static', {
	run: function(dt) {
		var d = this.data;

		d.run(dt);
		if (!d.state.life)
			this.isAlive = false;

		if (this.runStatic)
			this.runStatic(dt, d);
	},
	draw: function() {
		var d = this.data;
		DC.save();

		if (d.state.creating)
			DC.globalAlpha = d.age / d.state.life;
		else if (d.state.dying)
			DC.globalAlpha = 1 - d.age / d.state.life;

		if (this.drawStatic)
			this.drawStatic(d);
		else if (d.t)
			DC.fillText(d.t, d.x, d.y);

		DC.restore();
	},

	states: {
		0: { creating: 1, life:	500, next: 1 },
		1: { living:   1, life:	Math.Inf, next: 2 },
		2: { dying:    1, life: 500 }
	},
}, function(o, c) {
	this.data = extend(newState(this.states), {
		x: (GAME.rect.l+GAME.rect.r)/2,
		y: (GAME.rect.t+GAME.rect.b)/2,
		t: 'Static Text',
	}, o);
});

SPRITE.newCls('Base', {
	runStatic: function(dt, d) {
		d.x0 = d.x;
		d.y0 = d.y;
		d.x += d.vx * dt;
		d.y += d.vy * dt;
		if (this.runBase)
			this.runBase(dt, d);

		if (d.ticks) ieach(d.ticks, function(i, v, d) {
			if (v.t.run(dt)) v.f(d, v.d);
		}, this);

		var s = this.space;
		if (d.x+d.r+s.l < GAME.rect.l ||
			d.x-d.r-s.r > GAME.rect.r ||
			d.y+d.r+s.t < GAME.rect.t ||
			d.y-d.r-s.b > GAME.rect.b) {
			this.isAlive = false;
			STORY.on(STORY.events.OBJECT_OUT, this);
		}

		if (!this.rect) this.rect = {};
		this.rect.l = Math.min(d.x0, d.x) - d.r*1.1;
		this.rect.t = Math.min(d.y0, d.y) - d.r*1.1;
		this.rect.r = Math.max(d.x0, d.x) + d.r*1.1;
		this.rect.b = Math.max(d.y0, d.y) + d.r*1.1;
	},
	drawStatic: function(d) {
		if (d.frame) {
			var f = d.frame;
			if (f.rotate) {
				var t = +f.rotate===f.rotate ? f.rotate :
					Math.PI/2 + Math.atan2(d.vy, d.vx);
				DC.translate(d.x, d.y);
				DC.rotate(t);
				DC.drawImage(RES[f.res],
					f.sx, f.sy, f.sw, f.sh,
					-f.w/2, -f.h/2, f.w, f.h);
			}
			else DC.drawImage(RES[f.res],
				f.sx, f.sy, f.sw, f.sh,
				d.x-f.w/2, d.y-f.h/2, f.w, f.h);
		}
		else if (d.color) {
			DC.fillStyle = d.color;
			DC.beginPath();
			DC.arc(d.x, d.y, d.r, 0, 2*Math.PI);
			DC.closePath();
			DC.fill();
		}
	},
	space: {
		l: 40,
		r: 40,
		t: 40,
		b: 20
	},
	newdata: function(d, e) {
		return extend(newState(this.states), {
			r: 10,
			x: (GAME.rect.l+GAME.rect.r)/2,
			y: (GAME.rect.t+GAME.rect.b)/2,
			vx: 0,
			vy: 0,
			x0: 0,
			y0: 0,

			color: undefined,
			frame: undefined, // i.e. {res:'player0L', sx:0, sy:0, sw:10, sh:10, w:10, h:10}

			ticks: [], // arrays of { t:newTicker(150), f:fn, d:{} }
		}, d, e);
	},
}, function(d, c) {
	this.data = c.newdata(d);
}, 'Static');

SPRITE.newCls('Player', {
	hits: [
		'Player',
		'Ball',
		'Enemy',
		'Dannmaku',
		'Drop',
	],
	hit: function(v) {
		var d = this.data,
			e = v.data;
		if (e.state.mkDamage) {
			if (!d.state.isInvinc && circle_intersect({x: d.x, y: d.y, r: d.h}, e)) {
				e.set('dying');
				STORY.on(STORY.events.PLAYER_HIT, this);
			}
			else if (circle_intersect(d, e) && !e.grazed) {
				e.grazed = true;
				STORY.on(STORY.events.PLAYER_GRAZE, this);
			}
		}
		else if (v.cls == 'Drop') {
			if (e.state.living && circle_intersect(d, {x: e.x, y: e.y, r: e.h})) {
				e.set('dying');
				STORY.on(STORY.events.PLAYER_GETDROP, this);
				STORY.on(STORY.events.DROP_COLLECTED, v);
			}
			else
				e.collected = this;
		}
		else if (v.cls == 'Player') {
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
	},
	
	run: function(dt) {
		var d = this.data;
			m = GAME.keyste.shiftKey,
			v = m ? 0.14 : 0.35;

		d.run(dt);
		if (!d.state.life) {
			this.isAlive = false;
			STORY.on(STORY.events.PLAYER_DEAD, this);
		}

		if (d.ticks) ieach(d.ticks, function(i, v, d) {
			if (v.t.run(dt)) v.f(d, v.d);
		}, this);

		if (!d.state.dying)
			this.update(dt, d);

		// limit player move inside boundary
		if (d.x-d.r < GAME.rect.l)
			d.x = GAME.rect.l + d.r;
		if (d.x+d.r > GAME.rect.r)
			d.x = GAME.rect.r - d.r;
		if (d.y-d.r < GAME.rect.t)
			d.y = GAME.rect.t + d.r;
		if (d.y+d.r > GAME.rect.b)
			d.y = GAME.rect.b - d.r;

		if (!this.rect) this.rect = {};
		this.rect.l = d.x - d.r*1.1;
		this.rect.t = d.y - d.r*1.1;
		this.rect.r = d.x + d.r*1.1;
		this.rect.b = d.y + d.r*1.1;
	},
	draw: function() {
		var d = this.data;
		DC.save();

		if (d.state.isInvinc) {
			DC.globalAlpha = 0.5;
		}

		if (d.frame) {
			var f = d.frame;
			DC.drawImage(RES[f.res],
				f.sx, f.sy, f.sw, f.sh,
				d.x-f.w/2, d.y-f.h/2, f.w, f.h);
		}

		if (d.slowMode) {
			DC.fillStyle = 'black';
			DC.beginPath();
			DC.arc(d.x, d.y, d.h+1, 0, 2*Math.PI);
			DC.closePath();
			DC.fill();
		}

		DC.restore();
	},
	update: function(dt, d) {
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
			if (d.firetick.run(dt) || !d.fire_on) {
				d.firetick.c = d.fire_on ? 80 : 0;
				STORY.on(STORY.events.PLAYER_FIRE, this);
			}
		}
		d.fire_on = GAME.keyste[d.conf.key_fire];

		// BOMB!
		if (GAME.keyste[d.conf.key_bomb] && !d.state.bomb) {
			d.set('bomb');
			STORY.on(STORY.events.PLAYER_BOMB, this);
		}

		// AUTO COLLECT!
		if (d.y < GAME.rect.t*0.7 + GAME.rect.b*0.3) {
			STORY.on(STORY.events.PLAYER_AUTOCOLLECT, this);
		}
	},
	newdata: function(d) {
		return extend(newState(this.states), {
			r: 15,
			h: 3,

			x: (GAME.rect.l+GAME.rect.r)/2,
			y: GAME.rect.t*0.2 + GAME.rect.b*0.8,
			vx: 0,
			vy: 0,
			x0: 0,
			y0: 0,

			firetick: newTicker(180),

			ticks: [
				UTIL.newFrameGroupTick(120, [
					this.frames0,
					this.framesL,
					this.framesR
				], function(v, d, fgs) {
					if (v.data.vx == 0)
						return fgs[0];
					var fs = fgs[v.data.vx < 0 ? 1 : 2];
					if (d.frames != fs)
						d.index = 0;
					if (d.index + 1 > fs.length - 1)
						d.index = 2;
					return fs;
				}),
			]
		}, d);
	},

	states: {
		0: { creating: 1, life: 1000, next:  1, isInvinc: 1 },
		1: { living:   1, life: Math.Inf, next:  2 },
		2: { dying:    1, life: 1000, isInvinc: 1 },
		3: { bomb:     1, life: 5000, next:  1, isInvinc: 1 },
		4: { juesi:    1, life:  100, next:  2, isInvinc: 1 },
	},

	frames0: array(4, function(i) {
		return extend({ res:'player0L', sy: 0, sw:32, sh:48, w:32, h:48 }, { sx:32*i });
	}),
	framesL: array(7, function(i) {
		return extend({ res:'player0L', sy:48, sw:32, sh:48, w:32, h:48 }, { sx:32*i });
	}),
	framesR: array(7, function(i) {
		return extend({ res:'player0R', sy:48, sw:32, sh:48, w:32, h:48 }, { sx:255-32*(i+1) });
	}),
}, function(d, c) {
	this.data = c.newdata(d);
	this.data.conf = extend({
		key_left: 37,
		key_up: 38,
		key_right: 39,
		key_down: 40,
		key_fire: GAME.keychars.Z,
		key_bomb: GAME.keychars.X,
	}, this.data.conf);
}, 'Static');

SPRITE.newCls('Ball', {
	hits: [
		'Ball',
	],
	hit: function(v) {
		var d = this.data,
			e = v.data;
		if (circle_intersect(d, e)) {
			var r = sqrt_sum(d.x - e.x, d.y - e.y),
				sin = (d.y - e.y) / r,
				cos = (d.x - e.x) / r,
				md = d.r,
				me = e.r,
				vd = sqrt_sum(d.vx, d.vy),
				ve = sqrt_sum(e.vx, e.vy),
				vdn = d.vx*cos + d.vy*sin, vdr = d.vx*sin - d.vy*cos,
				ven = e.vx*cos + e.vy*sin, ver = e.vx*sin - e.vy*cos;
			var vdn2 = (vdn*(md - me)+2*me*ven)/(md+me),
				ven2 = (ven*(me - md)+2*md*vdn)/(md+me);
			d.vx = vdn2*cos + vdr*sin; d.vy = vdn2*sin - vdr*cos;
			e.vx = ven2*cos + ver*sin; e.vy = ven2*sin - ver*cos;
			var cx = (d.x*e.r+e.x*d.r)/(d.r+e.r),
				cy = (d.y*e.r+e.y*d.r)/(d.r+e.r),
				f = 1.01;
			d.x = cx + d.r*cos*f; d.y = cy + d.r*sin*f;
			e.x = cx - e.r*cos*f; e.y = cy - e.r*sin*f;
		}
	},

	states: {
		0: { creating: 1, life:	200, next: 1 },
		1: { living:   1, life:	Math.Inf, next: 2, mkDamage: 1 },
		2: { dying:    1, life: 500 }
	},
}, function(d, c) {
	this.data = c.newdata(d);
}, 'Base');

SPRITE.newCls('Enemy', {
	hits: [
		'Bullet',
	],
	hit: function(v) {
		var d = this.data,
			e = v.data;
		if (d.state.dying || e.state.dying)
			return;
		if (circle_intersect(d, e)) {
			e.set('dying');
			d.damage ++;
			if (d.damage >= d.life) {
				d.set('dying');
				STORY.on(STORY.events.ENEMY_KILL, this);
			}
		}
	},
	
	states: {
		0: { creating: 1, life:	500, next: 1 },
		1: { living:   1, life:	Math.Inf, next: 2, mkDamage: 1 },
		2: { dying:    1, life: 500 }
	},
}, function(d, c) {
	this.data = c.newdata({
		r: 20,
		y: GAME.rect.t*0.9+GAME.rect.b*0.1,
		life: 10,
		damage: 0
	}, d);
}, 'Base');

SPRITE.newCls('Bullet', {
	runBase: function(dt, d) {
		var u = d.to,
			e = u && u.data;
		if (!u || !u.isAlive || !e.state.mkDamage)
			return;
		if (d.type == 1) {
			var r = sqrt_sum(d.x - e.x, d.y - e.y),
				v = sqrt_sum(d.vx, d.vy);
			d.vx = v * (e.x - d.x)/r;
			d.vy = v * (e.y - d.y)/r;
		}
	},
	states: {
		0: { creating: 1, life: 100, next: 1 },
		1: { living:   1, life: Math.Inf, next: 2 },
		2: { dying:    1, life: 10 }	
	},
}, function(d, c) {
	this.data = c.newdata({
		r: 5,
		vy: -0.5,
		from: null
	}, d);
}, 'Base');

SPRITE.newCls('Drop', {
	runBase: function(dt, d) {
		if (d.collected) {
			var e = d.collected.data,
				v = d.collected_auto ? 0.8 : sqrt_sum(d.vx, d.vy),
				r = sqrt_sum(d.x - e.x, d.y - e.y),
				sin = (e.x - d.x) / r,
				cos = (e.y - d.y) / r;
			d.vx = v * sin;
			d.vy = v * cos;
			d.collected = d.collected_auto ? d.collected : undefined;
			d.collected_auto = false;
		}
		else if (d.vy < 0.15)
			d.vy += 0.001 * dt;
	},
	space: {
		l: 200,
		r: 40,
		t: 40,
		b: 20
	},
	states: {
		0: { creating: 1, life: 300, next: 1 },
		1: { living:   1, life: Math.Inf, next: 2 },
		2: { dying:    1, life: 100 }
	},
}, function(d, c) {
	this.data = c.newdata({
		r: 60,
		vy: -0.4,
		h: 20, // used for player hit test
		frame: { res:'etama3', sx:32, sy:0, sw:16, sh:16, w:20, h:20 }
	}, d);
}, 'Base');

SPRITE.newCls('Dannmaku', {
	runBase: function(dt, d) {
		var u = d.from,
			e = u && u.data;
		if (!u || !u.isAlive || !e.state.living)
			return;
		if (d.type == 1) {
			if (d.age < 1000) {
				d.vx -= 30e-7 * dt * (d.x - e.x);
				d.vy -= 30e-7 * dt * (d.y - e.y);
			}
		}
		else if (d.type == 2) {
			if (Math.abs(d.vx) > 0.03) d.vx *= 0.992;
			if (Math.abs(d.vy) > 0.03) d.vy *= 0.992;
		}
		else if (d.type == 3) {
			if (d.age < 1000) {
				d.vx *= 0.98;
				d.vy *= 0.98;
			}
			else {
				var p = randin(UTIL.getAliveObjs('Player')).data;
				d.vx -= 10e-7 * dt * (d.x - p.x);
				d.vy -= 10e-7 * dt * (d.y - p.y);
			}
		}
		else if (d.type == 4) {
			if (!d.pos) d.pos = {x: e.x, y: e.y, t: 0};
			if (!e.dir) e.dir = randin([-1, 1]);
			d.pos.t += dt;
			d.x = 100*Math.sin(e.dir*d.pos.t/250) + d.pos.x;
			d.y = 100*Math.cos(e.dir*d.pos.t/250) + d.pos.y;
		}
	},
	states: {
		0: { creating: 1, life: 100, next: 1 },
		1: { living:   1, life: Math.Inf, next: 2, mkDamage: 1 },
		2: { dying:    1, life: 100 },
	},
}, function(d, c) {
	this.data = c.newdata({
		r: 5,
		vy: 0.3,
		from: null
	}, d);
}, 'Base');

setInterval(function() {
	var dt = TimeCounter();
	if (GAME.state == GAME.states.RUNNING)
		GAME.run(Math.min(dt, 15));
}, 10);

setInterval(function() {
	GAME.fps = FPSCounter();
	GAME.draw();
}, 16.6);

setInterval(function() {
	var fns = {
		'ui-bind': function(e, t) {
			return Function(($attr(e, 'ui-bind-attr') || 'this.innerHTML')+'='+t);
		},
		'ui-show': function(e, t) {
			return Function('this.style.display=('+t+')?"block":"none"');
		}
	};
	ieach($('.ui'), function(i, e) {
		ieach(e.attributes, function(i, attr) {
			var n = attr.name,
				t = attr.textContent,
				k = 'exec:'+n+':'+t,
				f = fns[attr.name];
			if (f) (e[k] = e[k] || f(e, t)).apply(e);
		});
	});
}, 80);

window.addEventListener('keydown', GAME.input);
window.addEventListener('keyup', GAME.input);

// for test only
function newBall(v, fy) {
	var t = random(-0.6, 0.6) * Math.PI / 2,
		r = random(10) + 5;
	SPRITE.newObj('Ball', {
		x: random(GAME.rect.l, GAME.rect.r),
		y: random(GAME.rect.t, GAME.rect.t*(1-fy)+GAME.rect.b*fy),
		vx: v*Math.sin(t),
		vy: v*Math.cos(t),
		r: r,
		frame: { res:'etama3', sx:randin(range(8))*32, sy:128,
			sw:32, sh:32, w:r/14*32, h:r/14*32 }
	});
}
function newBullet(v) {
	var e = null, r = Math.Inf;
	SPRITE.eachObj(function(u) {
		if (u.data.state.mkDamage) {
			var r0 = squa_sum(u.data.x-v.data.x, u.data.y-v.data.y);
			if (r0 < r) {
				r = r0;
				e = u;
			}
		}
	}, 'Enemy');
	SPRITE.newObj('Bullet', {
		x: v.data.x + 10,
		y: v.data.y,
		vy: -0.5,
		from: v,
		frame: { res:'player0L', sx:128, sy:0, sw:16, sh:16, w:16, h:16 },
	});
	SPRITE.newObj('Bullet', {
		x: v.data.x - 10,
		y: v.data.y,
		vy: -0.5,
		from: v,
		frame: { res:'player0L', sx:128, sy:0, sw:16, sh:16, w:16, h:16 },
	});
	SPRITE.newObj('Bullet', {
		x: v.data.x + 20,
		y: v.data.y,
		vy: -0.45,
		vx: 0.1,
		frame: { res:'player0L', sx:128+16, sy:0, sw:16, sh:16, w:16, h:16 },
		type: 1,
		from: v,
		to: e
	});
	SPRITE.newObj('Bullet', {
		x: v.data.x - 20,
		y: v.data.y,
		vy: -0.45,
		vx: -0.1,
		frame: { res:'player0L', sx:128+16, sy:0, sw:16, sh:16, w:16, h:16 },
		type: 1,
		from: v,
		to: e
	});
}
function newDannmaku(v, type) {
	STORY.timeout(function (tc, ts) {
		if (!this.isAlive && !this.data.state.living)
			return;
		var e = this.data,
			p = randin(UTIL.getAliveObjs('Player')).data;
		var r = sqrt_sum(e.x-p.x, e.y-p.y),
			t = Math.asin((p.x - e.x) / r),
			n = 15, p = Math.PI*1.5,
			i = (ts % n - (n-1) / 2) * p/n,
			c = t + i*random(0.8, 1.2),
			dx = Math.sin(c),
			dy = Math.cos(c);
		SPRITE.newObj('Dannmaku', {
			x: e.x + 20*dx,
			y: e.y + 20*dy,
			vx: 0.3*dx,
			vy: 0.3*dy,
			r: 3,
			frame: { res:'etama3', sx:0, sy:64, sw:16, sh:16, w:16, h:16, rotate:true },
			from: this,
			type: type
		});
	}, 20, v, 80);
}
function newEnemy(type) {
	var bx = randin([0, 1]) * 32*4,
		by = randin([0, 1, 2]) * 32;
	var fs = array(4, function(i) {
		return extend({ res:'stg1enm', sy:by, sw:32, sh:32, w:32, h:32 }, { sx:bx+32*i });
	});
	var v = SPRITE.newObj('Enemy', {
		x: random(GAME.rect.l+100, GAME.rect.r-100),
		vx: random(-0.05, 0.05),
		vy: random(0.01, 0.1),
		r: 16,
		ticks: [
			UTIL.newFrameTick(150, fs)
		]
	});
	STORY.timeout(function () {
		newDannmaku(this, type);
	}, 1000, v);
}
function newBoss() {
	var fs = array(8, function(i) {
		return extend({ res:'stg1enm', sy:255-48, sw:32, sh:48, w:32, h:48 }, { sx:32*i });
	}), ps = [
		{ fx:0.0, fy:0.0, v:3 },
		{ fx:0.1, fy:0.1, v:3 },
		{ fx:0.5, fy:0.1, v:3 },
	];
	var boss = SPRITE.newObj('Enemy', {
		r: 24,
		life: 300,
		ticks: [
			UTIL.newFrameTick(150, fs),
			UTIL.newPathTick(30, ps)
		]
	});
	var ds = boss.drawStatic;
	boss.drawStatic = function(d) {
		ds.apply(boss, [d]);
		DC.beginPath();
		DC.arc(d.x, d.y, d.r*1.5, 0, (d.life-d.damage)/d.life*2*Math.PI);
		DC.stroke();
		DC.closePath();
	}
}
function killObj(ls) {
	ieach(ls, function(i, c) {
		SPRITE.eachObj(function(v) {
			if (!v.data.state.dying)
				v.data.set('dying');
		}, c);
	})
}

var tl = {};
tl.all = {
	t: 0,
	graze: 0,
	after_run: function(dt, d, s) {
		tl.all.t += dt;
	},
	after_on: function(e, v, d, s) {
		if (e == STORY.events.GAME_INPUT) {
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
			SPRITE.eachObj(function(u) {
				u.data.collected = v;
				u.data.collected_auto = true;
			}, 'Drop');
		}
		else if (e == STORY.events.PLAYER_HIT) {
			tl.all.graze --;
			v.data.set('juesi');
			/*
			STORY.timeout(function() {
				killObj(['Dannmaku']);
			}, 10, null, 80);
			*/
			STORY.timeout(function() {
				if (v.data.state.dying) {
					var x = v.data.x,
						y = GAME.rect.t*0.8+GAME.rect.b*0.2;
					SPRITE.newObj('Drop', { x:x+90, y:y+10 });
					SPRITE.newObj('Drop', { x:x+30, y:y });
					SPRITE.newObj('Drop', { x:x-30, y:y });
					SPRITE.newObj('Drop', { x:x-90, y:y+10 });
				}
			}, 200);
		}
		else if (e == STORY.events.PLAYER_GRAZE) {
			tl.all.graze ++;
		}
		else if (e == STORY.events.PLAYER_DEAD) {
			SPRITE.newObj('Player');
		}
		else if (e == STORY.events.PLAYER_FIRE) {
			if (!d.disable_fire)
				newBullet(v);
		}
		else if (e == STORY.events.PLAYER_BOMB) {
			// to be finished
		}
	}
};
tl.init = {
	init: function(d) {
		// start the game!
		GAME.state = GAME.states.RUNNING;
		SPRITE.clearObj();
		/*
		SPRITE.newObj('Player', {
			x: 100,
			conf: {
				key_up: GAME.keychars.W,
				key_down: GAME.keychars.S,
				key_left: GAME.keychars.A,
				key_right: GAME.keychars.D,
			}
		});
		*/
		SPRITE.newObj('Player');

		d.title = SPRITE.newObj('Static', {
			t: 'Dannmaku Demo!'
		});
	},
	run: function(dt, d) {
		d.age = (d.age || 0) + dt;
		if (d.age > 5000) {
			d.title.data.set('dying');
			return 'sec0';
		}
	}
};
tl.sec0 = {
	init: function(d) {
		killObj(['Static']);
		STORY.timeout(function() {
			STORY.timeout(function(c, n) {
				newBall(n > 10 ? 0.05 : 0.25, n > 10 ? 0.6 : 0.2);
			}, 20, null, 60);
		}, 1000);
	},
	run: function(dt, d) {
		d.age = (d.age || 0) + dt;
		if (d.age > 20000)
			return 'sec1';
	},
	on: function(e, v, d) {
		if (e == STORY.events.OBJECT_OUT) {
			if (v.cls == 'Ball')
				newBall(0.25, 0.2);
		}
	}
};
tl.sec1 = {
	init: function(d) {
		killObj(['Ball', 'Enemy']);
		STORY.timeout(function () {
			newEnemy(tl.loop || 0);
		}, 300, null, 5);
	},
	run: function(dt, d) {
		if (d.pass) {
			SPRITE.eachObj(function(v) {
				v.data.set('dying');
				v.data.vx *= 0.01;
				v.data.vy *= 0.01;
				SPRITE.newObj('Drop', {
					x: v.data.x,
					y: v.data.y,
					frame: { res:'etama3', sx:16, sy:0, sw:16, sh:16, w:20, h:20 },
				});
			}, 'Dannmaku');
			STORY.timeout(function() {
				STORY.on(STORY.events.PLAYER_AUTOCOLLECT,
					randin(UTIL.getAliveObjs('Player')));
			}, 100);
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
			var pass = reduce(SPRITE.obj.Enemy, function(i, v, r) {
				return v.isAlive ? (r && v.data.state.dying) : r;
			}, true);
			if (pass) STORY.timeout(function() {
				this.pass = true;
			}, 1000, d);
		}
		else if (e == STORY.events.OBJECT_OUT) {
			if (v.cls == 'Enemy' && !v.data.state.dying)
				newEnemy(tl.loop);
		}
	}
};
tl.diag = {
	init: function(d) {
		d.ste = newState({
			0: { life: 1, next: 1, data: { t: 'x0', x: GAME.rect.l+100 } },
			1: { life: 1, next: 2, data: { t: 'y0', x: GAME.rect.r-100 } },
			2: { life: 1, next: 3, data: { t: 'x1', x: GAME.rect.l+100 } },
			3: { life: 1, next: 4, data: { t: 'y2', x: GAME.rect.r-100 } },
			4: { life: 1, next: 5, data: { t: 'x1', x: GAME.rect.l+100 } },
			5: { life: 1, data: { t: 'y2', x: GAME.rect.r-100 } },
		});
		STORY.timeout(function() {
			this.ste.run(0.1);
			this.obj = SPRITE.newObj('Static', d.ste.state.data);
		}, 1000, d);
	},
	run: function(dt, d) {
		d.disable_fire = true;
		if (GAME.keyste.ctrlKey)
			tl.diag.next(d);
		if (d.pass)
			return 'boss';
	},
	on: function(e, v, d) {
		if (e == STORY.events.GAME_INPUT) {
			if (v.type == 'keyup' && v.which == GAME.keychars.Z)
				tl.diag.next(d);
		}
	},
	next: function(d) {
		if (!d.obj)
			return;
		d.ste.run(1);
		d.obj.data.set('dying');
		var n = d.ste.state.data;
		if (n)
			d.obj = SPRITE.newObj('Static', n);
		else {
			d.obj = null;
			STORY.timeout(function() {
				this.pass = true;
			}, 1000, d);
		}
	}
};
tl.boss = {
	init: function(d) {
		killObj(['Static', 'Enemy', 'Dannmaku']);
		STORY.timeout(function () {
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
		SPRITE.newObj('Static', {
			t: 'You Win!'
		});
	},
	run: function(dt, d) {
	}
};
STORY.timeline = tl;

document.addEventListener('res.loaded', function(e) {
	GAME.init();
});
