if (window.console) {
	var log = function () {
		if (0) console.log(arguments)
	}

	var error = function (m) {
		if (0) console.error(m)
	}
} else {
	var log = function () {
		/*msg = '';
		for (var i = 0; i < arguments.length; i++) {
			if (i != 0) msg += ' - ';
			msg += arguments[i];
		}
		document.getElementById('dbgView').innerHTML = msg;*/
	};
	var error = function () {};
}

var getElement = function (object) {
	var element = null;
	if (typeof object !== 'object') {
		element = document.getElementById(object);
		if (typeof element !== 'object') {
			return null;
		} else {
			return element;
		}
	} else {
		element = object;
		return element;
	}
}

var addEventHandler = function (element, type, listener) {
	if (element.addEventListener) {
		element.addEventListener(type, listener, false);
	} else if (element.attachEvent && listener.call) {
		element.attachEvent("on" + type, function () {
			return listener.call(element, window.event);
			}
		);
	} else {
		error('Can\'t add event listner')
	}
}

var removeEventHandler = function (element, type, listener) {
	if (element.removeEventListener) {
		element.removeEventListener(type, listener, false);
	} else if (element.detachEvent) {
		element.detachEvent("on" + type, listener);
	}
}

JKME = {
	enabledTags: ['TEXTAREA', 'INPUT'],	
	
	config: {
		showMenu: true,
		menuClassName: 'jkMenu',
		logoUrl: 'keymagic.png'
	},
	
	attach: function (element) {
		return new JKME.engine(element);
	},
	
	detach: function (element) {
		element = getElement(element);
		try {
			engine = element.$;
			removeEventHandler(element, 'keypress', engine.onkeypress);
			removeEventHandler(element, 'keydown', engine.onkeydown);
			removeEventHandler(element, 'mousemove', engine.onmousemove);
			removeEventHandler(element, 'mouseout', engine.onmouseout);
			document.body.removeChild(engine.menu.el);
		} catch (ex) {
			error(ex);
			return false;
		}
		return true;
	},
	
	switchLayout: function(element, keyboardName) {
		el = getElement(element);
		if (el === null) {
			return;
		}
		if (el.$) {
			el.$.switchLayout(keyboardName);
		}
	}
}