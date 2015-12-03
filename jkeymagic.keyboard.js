if (!JKME.keyboard) {
JKME.keyboard  = {
    lastkb: window['KMKL'],
    events: {
        'keyboardchanged': []
    },
    
    keyboards: {
        //default keyboard which is empty
        'Default': {
            path: '',
            loaded: true,
            keyboard: {
                'eat' : false
            }
        }
    },
    
    addEventListener : function (event, listener) {
        this.events[event].push(listener);
    },
    
    callEventListeners: function (event, arg) {
        for (var i in this.events[event]) {
            this.events[event][i](arg);
        }
    },
    
    addKeyboard: function (path, name, keyboard) {
        newKeyboard = {
            path: path,
            loaded: false
        }
        this.keyboards[name] = newKeyboard;
        if (keyboard !== undefined) {
            this.keyboards[name].loaded = true;
            this.keyboards[name].keyboard = keyboard;
        }
        this.callEventListeners('keyboardchanged');
    },
    
    load: function (file, callback) {
        var head = document.getElementsByTagName('body')[0];
            newjs = document.createElement('script');
        
        // IE
        newjs.onreadystatechange = function () {
            if (newjs.readyState === 'loaded' || newjs.readyState === 'complete') {
                newjs.onreadystatechange = null;
                callback('success');
            }
        };
        
        newjs.onerror = function () {
            if (newjs.readyState === 'loaded' || newjs.readyState === 'complete') {
                newjs.onreadystatechange = null;
                callback('fail');
                head.removeChild(newjs);
            }
        };
        
        // others
        newjs.onload = function () {
            callback('success');
        };
        
        newjs.onerror = function () {
            callback('fail');
            head.removeChild(newjs);
        };
        
        newjs.src = file;
        newjs.type = 'text/javascript';
        head.appendChild(newjs);
    },
    
    loadKeyboard: function (name, callback) {
        var kbName = name;
        var keyboard = this.keyboards[name];
        
        loading = true;
        if (keyboard.loaded == false) {
            this.load(keyboard['path'] ,function (status) {
                if (status === 'fail') {
                    //delete JKME.keyboard.keyboards[kbName];
                    keyboard.error = true;
                    error('Failed to load keyboard. Invalid keyboard path?');
                    
                    callback('fail');
                    JKME.keyboard.callEventListeners('keyboardchanged');
                    return;
                }
                
                if (this.lastkb == window['KMKL']) {
                    //delete JKME.keyboard.keyboards[kbName]; 
                    keyboard.error = true;
                    error('Failed to load keyboard. Invalid keyboard file?');
                    
                    callback('fail');
                    JKME.keyboard.callEventListeners('keyboardchanged');
                    return;
                }
                this.lastkb = window['KMKL'];
                keyboard.keyboard = window['KMKL'];
                keyboard.loaded = true;
                
                callback('success');
                JKME.keyboard.callEventListeners('keyboardchanged');
            })
        } else {
            callback('success');
        }
    },
    
    createOption: function (text, selected) {
        
        if (selected === undefined) {
            selected = true;
        }
        var option = document.createElement('option');
        option.selected = selected;
        option.defaultSelected = selected;
        option.innerHTML = text;
        option.value = text;
        return option;
    },
    
    getKeyboardsAsOptions: function (selectedKeyboardName) {
        var options = document.createElement('select');
        var alt = false;
        for (var kb in this.keyboards) {
            var option = this.createOption(kb, kb == selectedKeyboardName);
            if (this.keyboards[kb].error) option.className += 'error ';
            if (alt) option.className += 'alt ';
            options.appendChild(option);
            alt = !alt;
        }
        return options;
    }
}
}