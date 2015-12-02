JKME.engine = function (element) {
	//get element by Id
	this.element = getElement(element);
	
	//check element
	if (this.element === null) {
		error('Can\'t find the element.')
		return;
	}
	
	if (this.element.$) JKME.detach(this.element);
	
	//store this to element
	this.element.$ = this;
	
	//create keyboard menu bar
	this.menuId = 'jkMenu'+ Math.floor(Math.random()*100000);
	this.menu = new JKME.menu(this, this.menuId);
	var menu = this.menu;
	//append it to document
	document.body.appendChild(menu.el);
	//add event listener
	menu.onKeyboardSelectionChanged = function (keyboard) {
		var $ = this.el.$;
		$.switchLayout(keyboard);
	}
	menu.updateMenu();
	JKME.keyboard.addEventListener('keyboardchanged', function () {
		menu.updateMenu();
	});
	
	var me = this;
	var onmousemove = function (e) {
		menu.showMenu(this);
		menu.hideMenu(1000)
	}
	
	var onmouseout = function (e) {
		menu.hideMenu(500);
	}
	
	var onkeypress = function (e) {
		return me.processKeyEvent(e);
	}
	
	var onkeydown = function (e) {
		var swap = function () {
			ob = me.lastKeyboardName;
			me.lastKeyboardName = me.keyboardName;
			me.keyboardName = ob;
		}
		
		if (e.keyCode == 8 && (me.env.cs || me.env.ie)) {
			return me.processKeyEvent(e);
		} else if (
			e.keyCode == 0x20 && e.shiftKey) {
				log(me.keyboardName, me.lastKeyboardName)
				if (me.keyboardName == 'Default' && me.lastKeyboardName != null) {
					swap();
					me.keyboard = JKME.keyboard.keyboards[me.keyboardName].keyboard;
					me.reset();
				} else {
					me.lastKeyboardName = 'Default';
					swap();
					me.keyboard = JKME.keyboard.keyboards[me.keyboardName].keyboard;
					me.reset();
				}
				
				me.menu.updateMenu();
				menu.showMenu(e.srcElement || e.target);
				menu.hideMenu(1000);
				if (e.preventDefault)
					e.preventDefault();
				return false;
		}
	}
	
	this.onmousemove = onmousemove;
	this.onmouseout = onmouseout;
	this.onkeypress = onkeypress;
	this.onkeydown = onkeydown;
	
	//capture events
	addEventHandler(this.element, 'mousemove', onmousemove);
	addEventHandler(this.element, 'mouseout', onmouseout);
	addEventHandler(this.element, 'keypress', onkeypress);
	addEventHandler(this.element, 'keydown', onkeydown);
}

JKME.engine.prototype = {
	keyboardName: 'Default',
	keyboard: JKME.keyboard.keyboards['Default'].keyboard,
	lastKeyboardName: null,
	contextHistory: [],
	backRef: [],
	switches: {},
	hotkey: {},
	context: "",
	matchedVK: false,
	shouldMatchAgain: false,
	env: { cs: /chrome|safari/i.test(navigator.userAgent), ie: /MSIE/i.test(navigator.userAgent), opera: /opera/i.test(navigator.userAgent) },
	onSwitchedLayout : function () {},
	
	switchLayout: function (keyboard) {
		var $ = this;
		$.menu.showMessage('Loading');
		if (JKME.keyboard.keyboards[keyboard]) {
			JKME.keyboard.loadKeyboard(keyboard, function (status) {
				log(status)
				if (status === 'success') {
					$.menu.showMessage('');
					$.keyboardName = keyboard;
					$.keyboard = JKME.keyboard.keyboards[keyboard].keyboard;
					$.reset();
					$.onSwitchedLayout($, keyboard);
					$.menu.updateMenu();
				} else {
					$.menu.showMessage('Failed to load');
					setTimeout(function () {
						$.menu.showMessage('');
					}, 2000);
				}
			})
		}
	},
	
	reset: function() {
		this.context = "",
		this.switches = {};
		this.contextHistory = [];
	},
	
	commit: function (target, _after_context) {
		log('commit', this.context, _after_context);
		
		scrollTop = target.scrollHeight - target.scrollTop;
		scrollLeft = target.scrollWidth -  target.scrollLeft;
		
		target.value = this.context + _after_context;
		
		target.scrollTop = target.scrollHeight - scrollTop;
		target.scrollLeft = target.scrollWidth - scrollLeft;
		
		if (_after_context === undefined || _after_context.length == 0) {
			if (this.env.ie) {
				textInputRange = target.createTextRange();
				textInputRange.collapse(false);
				textInputRange.select();
			}
		} else if (_after_context != ""  && this.env.ie) {				
			textInputRange = target.createTextRange();
			textInputRange.collapse(false);
			fix = _after_context.split("\n").length - 1;
			textInputRange.moveStart('character', -_after_context.length + fix);
			textInputRange.moveEnd('character', -_after_context.length + fix)
			textInputRange.select();

		} else if (_after_context != "" || this.env.opera) {
			target.selectionStart = this.context.length;
			target.selectionEnd = this.context.length;
		}
	},
	
	getInputSelection : function (el) {
	    var start = 0, end = 0, normalizedValue, range,
	        textInputRange, len, endRange;

	    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
	        start = el.selectionStart;
	        end = el.selectionEnd;
	    } else if (document.selection != undefined){
	        range = document.selection.createRange();

	        if (range && range.parentElement() == el) {
	            len = el.value.length;
	            normalizedValue = el.value.replace(/\r\n/g, "\n");

	            // Create a working TextRange that lives only in the input
	            textInputRange = el.createTextRange();
	            textInputRange.moveToBookmark(range.getBookmark());

	            // Check if the start and end of the selection are at the very end
	            // of the input, since moveStart/moveEnd doesn't return what we want
	            // in those cases
	            endRange = el.createTextRange();
	            endRange.collapse(false);

	            if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
	                start = end = len;
	            } else {
	                start = -textInputRange.moveStart("character", -len);
	                start += normalizedValue.slice(0, start).split("\n").length - 1;

	                if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
	                    end = len;
	                } else {
	                    end = -textInputRange.moveEnd("character", -len);
	                    end += normalizedValue.slice(0, end).split("\n").length - 1;
	                }
	            }
	        }
	    }

	    return {
	        start: start,
	        end: end
	    };
	}
}