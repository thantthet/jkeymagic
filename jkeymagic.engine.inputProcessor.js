JKME.engine.prototype.processKeyEvent = function (e) {

	log('processKeyEvent', e, this);
	if (this.env.opera) {
		if (e.keyCode >= 33 && e.keyCode <= 40) {
			return;
		}
	}
	
	if (this.on === false) return;
	
	var target = this.env.ie ? e.srcElement : e.target;
	var eat = false;
	var sel = this.getInputSelection(target);
	var _new_context = target.value.substr(0, sel.start);
	var _after_context = target.value.substr(sel.end, target.value.length);
	
	if (this.context != _new_context ) {
		this.reset();
		this.context = _new_context;
	}

	var oldText = this.context;
	
	var code = this.getKeyCode(e);
	
	var modifiers = {
		shift: code.shift,
		alt: e.altKey,
		ctrl: e.ctrlKey,
		cmd: e.metaKey == undefined ? false : e.metaKey
	}
	
	var success = this.processInput(code.keycode, String.fromCharCode(this.env.ie | this.env.opera ? e.keyCode : e.charCode), modifiers);
	
	if (!success && code.keycode) {
		this.switches = {};
	}
	var looped = 0;
	if (success) {
		while (success) {
			if (this.shouldMatchAgain) {
				modifiers = {
					shift: false,
					alt: false,
					ctrl: false,
					cmd: false
				}
				success = this.processInput(0, "", modifiers);
				
				looped++;
				if (looped == 20) {
					error('Max loop exceeded.')
					return;
				}
				if (!success) {
					this.updateHistory(oldText);
					break;
				} else if (e.keyCode == 8 && this.contextHistory.length) {
					if (this.context == this.contextHistory[this.contextHistory.length]) { // if results are the same
						this.contextHistory.pop(); // sync with smartbackspace
					} else {
						this.contextHistory = new Array();
					}
				}
			} else if (e.keyCode == 8 && this.contextHistory.length) {
					if (this.context == this.contextHistory[this.contextHistory.length]) { // if results are the same
						mthis.contextHistory.pop(); // sync with smartbackspace
					} else {
						this.contextHistory = new Array();
					}
					break;
			} else {
				this.updateHistory(oldText);
				break;
			}
		}
		this.commit(target, _after_context);
		if (e.preventDefault) e.preventDefault();
		return false;
	
	} else {
		if (modifiers.alt || modifiers.ctrl || modifiers.cmd) {
			return;
		}
		
		if (e.keyCode == 8) {
			if (this.keyboard['autobksp'] == true && this.contextHistory.length != 0) {
				this.context = this.contextHistory[this.contextHistory.length - 1];
				this.contextHistory.pop();	
				this.commit(target, _after_context);
				if (e.preventDefault) e.preventDefault();
				return false;
			} else if (this.context.length) {
				this.context = this.context.substr(0, this.context.length - 1);
				this.contextHistory = [];
			}
			return true;
		}

		if (e.charCode <= 0x20 || e.keyCode <= 0x20) {
			return;
		} else if (this.keyboard['eat']) {
			log('eaten')
			if (e.preventDefault)
				e.preventDefault();
			return false;
		} else {
			log('not eaten')
			this.context += String.fromCharCode(this.env.ie | this.env.opera ? e.keyCode : e.charCode);
			this.updateHistory(oldText);
		}
	}
}

JKME.engine.prototype.updateHistory =  function (text) {
	if (this.contextHistory.length == 0) {
		this.contextHistory.push(text);
	} else if (text != this.contextHistory[this.contextHistory.length - 1]) {
		this.contextHistory.push(text);
	}
}

JKME.engine.prototype.getKeyCode = function (e) {
	var
		keycode = 0,
		shift = false;
	var charCode = this.env.ie | this.env.opera ? e.keyCode : e.charCode;
	
	log('getKeyCode', keycode, shift);
	
	if (charCode >= 0x41 && charCode <= 0x5a) {
		shift = true;
		keycode = charCode;
	} else if (charCode >= 0x61 && charCode <= 0x7a) {
		keycode = charCode - 0x20;
	} else if (charCode >= 0x30  && charCode <= 0x39) {
		keycode = charCode;
	} else {
		switch (charCode) {
			case 0x60: keycode = 0xc0; break;
			case 0x7e: keycode = 0xc0; shift = true; break;
			
			case 0x21: keycode = 0x31; shift = true; break;
			case 0x40: keycode = 0x32; shift = true; break;
			case 0x23: keycode = 0x33; shift = true; break;
			case 0x24: keycode = 0x34; shift = true; break;
			case 0x25: keycode = 0x35; shift = true; break;
			case 0x5e: keycode = 0x36; shift = true; break;
			case 0x26: keycode = 0x37; shift = true; break;
			case 0x2a: keycode = 0x38; shift = true; break;
			case 0x28: keycode = 0x39; shift = true; break;
			case 0x29: keycode = 0x30; shift = true; break;
			
			case 0x2d: keycode = 0xbd; break;
			case 0x5f: keycode = 0xbd; shift = true; break;
			
			case 0x3d: keycode = 0xbb; break;
			case 0x2b: keycode = 0xbb; shift = true; break;
			
			case 0x5b: keycode = 0xdb; break;
			case 0x7b: keycode = 0xdb; shift = true; break;
			
			case 0x5d: keycode = 0xdd; break;
			case 0x7d: keycode = 0xdd; shift = true; break;
			
			case 0x5c: keycode = 0xdc; break;
			case 0x7c: keycode = 0xdc; shift = true; break;
			
			case 0x3b: keycode = 0xba; break;
			case 0x3a: keycode = 0xba; shift = true; break;
			
			case 0x27: keycode = 0xde; break;
			case 0x22: keycode = 0xde; shift = true; break;
			
			case 0x2c: keycode = 0xbc; break;
			case 0x3c: keycode = 0xbc; shift = true; break;
			
			case 0x2e: keycode = 0xbe; break;
			case 0x3e: keycode = 0xbe; shift = true; break;
			
			case 0x2f: keycode = 0xbf; break;
			case 0x3f: keycode = 0xbf; shift = true; break;
			default:
				keycode = e.keyCode;
			break;
		}
	}
	log('getKeyCode', keycode, shift);
	return {keycode: keycode, shift: shift};
}

JKME.engine.prototype.processInput = function (keyCode, keyValue, modifiers) {
	log('processInput', keyCode, keyValue, modifiers);
	for (var ruleIdx in this.keyboard['rules']) {
		var rule = this.keyboard['rules'][ruleIdx];
		if (this.matchRule(rule, keyCode, keyValue, modifiers)) {
			log('matchRule=true', rule);
			if (this.matchedVK === false) {
				this.context += keyValue
			}
			if (keyCode) {
				this.switches = {};
			}
			var success = this.processOutput(rule);
			log('processOutput='+success, this.context);
			return success;
		}
	}
	return false;
}

JKME.engine.prototype.processOutput = function (rule) {
	var
		length = rule.length,
		outputResult = "",
		idx;
	
	for (itemIdx in rule['rhs']) {
		var item = rule['rhs'][itemIdx];
		switch (item['type']) {
			case tString: //string
				
				outputResult += item['value'];
				break;
			case tBackRefString:
				
				if (this.backRef.length <= item['index']) {
					continue;
				}
				idx = rule['lhs'][item['index']]['value'].indexOf(this.backRef[item['index']]);
				if (idx != -1) {
					outputResult += item['value'].charAt(idx);
				}
				break;
			case tReference:
				
				if (this.backRef.length <= item['index']) {
					continue;
				}
				outputResult += this.backRef[item['index']];
				break;
			case tVKey:
				
				outputResult += String.fromCharCode(item['keyCode']);
				break;
			case tSwitch:
				log('switch' +item['switchId']);
				if (this.switches[item['switchId']] !== undefined) {
					this.switches[item['switchId']] = !this.switches[item['switchId']];
				} else {
					this.switches[item['switchId']] = true;
				}
				break;
		}
	}
	log(this, this.context, outputResult);
	this.context = this.context.substr(0, this.context.length - length);
	this.context += outputResult;
	
	if (outputResult.length == 0 || (outputResult.length == 1 && outputResult.charCodeAt(0) > 0x20 && outputResult.charCodeAt(0) < 0x7F)) {
		this.shouldMatchAgain = false;
	} else {
		this.shouldMatchAgain = true;
	}

	return true;

}

JKME.engine.prototype.matchKeyStates = function (keyCode, modifiers, rule) {
	var
		matchedCount = 0,
		_modifiers = {
			shift : modifiers.shift,
			ctrl : modifiers.ctrl,
			alt : modifiers.alt,
			cmd : modifiers.cmd
		};
	for (var itemIdx in rule) {
		var item = rule[itemIdx];
		if (item['type'] == tVKey) {
			switch (item['keyCode']) {
				case 0x10:
					if (_modifiers.shift == true) {
						_modifiers.shift = false;
					} else {
						return -1;
					}
				break;
				case 0x11:
					if (_modifiers.ctrl == true) {
						_modifiers.ctrl = false;
					} else {
						return -1;
					}
				break;
				case 0x12:
					if (_modifiers.alt == true) {
						_modifiers.alt = false;
					} else {
						return -1;
					}
				break;
				default:
				if (item['keyCode'] != keyCode) {
					return -1;
				}
			}
			matchedCount++
		}
	}
	
	if (_modifiers.ctrl == true || _modifiers.alt == true || _modifiers.cmd == true) {
		
		return -1;
	}
	
	return matchedCount;
}

JKME.engine.prototype.matchRule = function (rule, keyCode, keyValue, modifiers) {
	
	var appendedContext = this.context;
	this.matchedVK = false;
	var kcode = this.matchKeyStates(keyCode, modifiers, rule['lhs']);
	if (kcode == -1) {
		
		return false;
	} else if (kcode == 0) {
		if (keyValue != "") appendedContext += keyValue
	} else {
		this.matchedVK = true;
	}
	
	var 
		lenToMatch = rule['length'],
		lenAppended = appendedContext.length;
		
	if (lenToMatch > lenAppended) {
		
		return false;
	}
	
	var 
		stringToMatch = appendedContext.substr(lenAppended - lenToMatch),
		stringToMatchIdx = 0; 
	
	this.backRef = new Array();
		
	for (var itemIdx in rule['lhs']) {
		var
			item = rule['lhs'][itemIdx],
			found = false,
			idx = 0,
			curChar = stringToMatch.charAt(stringToMatchIdx);
			
		switch (item['type']) {
			case tString: //string
				
				for (var i = 0; i < item['value'].length; i++) {
					var c = item['value'].charAt(i);
					if (stringToMatchIdx == stringToMatch.length) {
						
						return false;
					}
					if (c != curChar) {
						
						return false;
					}
					curChar = stringToMatch.charAt(++stringToMatchIdx);
				}
				
				this.backRef.push(item['value']);
				break;
			case tAnyOfString:
				
				if (item['value'].indexOf(curChar) == -1) {
					
					return false;
				} else {
					
					this.backRef.push(curChar);
					stringToMatchIdx++;
				}
				break;
			case tNotOfString:
				
				if (item['value'].indexOf(curChar) != -1) {
					
					return false;
				} else {
					
					this.backRef.push(curChar);
					stringToMatchIdx++;
				}
				break;
			case tAny:
				
				var c = stringToMatch.charAt(stringToMatchIdx++);
				if ( (c >= '\u0021' && c <= '\u007D') || (c >= '\u00FF' && c < '\uFFFF') ) {
					stringToMatchIdx++;
				} else {
					
					return false;
				}
				this.backRef.push(c);
				
				break;
			case tSwitch:
				if (this.switches[item['switchId']] !== undefined) {
					if (!this.switches[item['switchId']]) {
						return false;
					}
				} else {
					return false;
				}
				break;
		}
	}
	
	return true;
}