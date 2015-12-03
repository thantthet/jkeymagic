JKME.menu = function (jkme, menuId) {
    this.el = document.createElement('div');
    this.el.className = JKME.config.menuClassName;
    this.el.id = menuId;
    this.el.style.display = 'none';
    this.el.$ = jkme;
    this.timerId = null;
    
    imgDiv = document.createElement('div');
    log(imgDiv.style)
    imgDiv.style.backgroundImage = 'url(' + JKME.config.logoUrl + ')';
    imgDiv.style.width = '20px';
    imgDiv.style.height = '20px';
    imgDiv.style.margin = '0 10px 0 5px';
    imgDiv.style.cssFloat = 'left';
    imgDiv.style.styleFloat  = 'left';
    this.el.appendChild(imgDiv);
    
    selectDiv = document.createElement('div');
    selectDiv.style.cssFloat = 'left';
    selectDiv.style.styleFloat  = 'left';
    this.selectDiv = selectDiv;
    this.el.appendChild(selectDiv);
    
    msgDiv = document.createElement('div');
    msgDiv.style.position = 'absolute';
    msgDiv.style.top = '0';
    msgDiv.style.right = '0';
    this.msgDiv = msgDiv;
    this.el.appendChild(msgDiv);
    
    var el = this.el;
    var menu = this;
    
    el.onclick = function (e) {
        menu.showMenu(el.parentNode);
    };
    
    el.onmouseout = function (e) {
        log('menu > mouseout', e);
        menu.hideMenu(1000);
    };
    
    el.onmousemove = function (e) {
        log('menu > mousemove');
        menu.showMenu(el.parentNode);
    };
}

JKME.menu.prototype =  {
    
    onKeyboardSelectionChanged: function () {},
    options: null,
    
    updateMenu: function () {
        options = JKME.keyboard.getKeyboardsAsOptions(this.el.$.keyboardName);
        
        this.options = options;
        
        this.selectDiv.innerHTML = '';
        this.selectDiv.appendChild(this.options);
        this.options.onchange = function (e) {
            menu = this.parentNode.parentNode.$.menu;
            menu.onKeyboardSelectionChanged(this.value);
        }
    },
    
    showMenu: function(target) {
        log('menu > showMenu', this.timerId);
        
        if (JKME.config.showMenu === false) return;
        
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
        
        for (var i = 0; i < JKME.enabledTags.length; i++) {
            tag = JKME.enabledTags[i];
            if (target.tagName == tag) {
        
                offsetLeft = target.offsetLeft;
                offsetTop = target.offsetTop;
                     
                             if (target.offsetParent) {
                                 offsetParentElement = target.offsetParent;
                                 while (offsetParentElement.offsetParent != null) {
                                     offsetLeft += offsetParentElement.offsetLeft;
                                     offsetTop += offsetParentElement.offsetTop;
                                     offsetParentElement = offsetParentElement.offsetParent;
                                 }
                             }
                // bounds = nodeBounds(target);
        
                this.el.style.left = offsetLeft + 'px';
        
                if (this.el.currentStyle) { // IE, Opera
                    styles = document.body.currentStyle;
                    height = parseInt(styles.height) || 0;
                    marginT = parseInt(styles.paddingTop) || 0;
                    marginB = parseInt(styles.paddingBottom) || 0;
                }
                else { // W3C
                    styles = document.defaultView.getComputedStyle(this.el, '');
                    height = parseInt(styles.getPropertyValue("height"));
                    marginT = parseInt(styles.getPropertyValue("padding-top"));
                    marginB = parseInt(styles.getPropertyValue("padding-bottom"));
                }
        
                
                this.el.style.top = (offsetTop - height - marginT - marginB - (this.el.$.env.ie ? 20 : 10)) + 'px';
                this.el.style.display = 'block';
            }
        }
    },
    
    hideMenu: function(timer) {
        log('menu > hideMenu')
        
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
        
        if (timer === undefined) {
            timer = 100;
        }
        var element = this.el;
        this.timerId = setTimeout(
            function () {
                element.style.display = 'none';
            }, timer);
    },
    
    showMessage: function (msg) {
        this.msgDiv.innerHTML = msg;
    }
}

// function Rect(x,y,w,h,e) {
//     this.x = x;
//     this.y = y;
//     this.w = w;
//     this.h = h;
//     this.e = e;
// }
// 
// function nodeBounds(a) {
//       function b(b) {
//           for (var c = a.offsetParent; c && c.offsetParent; c = c.offsetParent)
//               c.scrollLeft && (b.x -= c.scrollLeft), c.scrollTop && (b.y -= c.scrollTop)
//       }
//       if (!a)
//           return null;
//       var c;
//       c = a.ownerDocument && a.ownerDocument.parentWindow ? a.ownerDocument.parentWindow : a.ownerDocument && a.ownerDocument.defaultView ? a.ownerDocument.defaultView : window;
//       if (a.getBoundingClientRect) {
//           var d = a.getBoundingClientRect();
//           return new Rect(d.left + GetWindowPropertyByBrowser_(c, getScrollLeftGetters_), d.top + GetWindowPropertyByBrowser_(c, 
//           getScrollTopGetters_), d.right - d.left, d.bottom - d.top, c)
//       }
//       if (a.ownerDocument && a.ownerDocument.getBoxObjectFor)
//           return d = a.ownerDocument.getBoxObjectFor(a), c = new Rect(d.x, d.y, d.width, d.height, c), b(c), c;
//       for (var e = d = 0, f = a; f.offsetParent; f = f.offsetParent)
//           d += f.offsetLeft, e += f.offsetTop;
//       c = new Rect(d, e, a.offsetWidth, a.offsetHeight, c);
//       b(c);
//       return c
//   }