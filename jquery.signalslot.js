/**
 * SignalSlot - A jQuery Plugin
 * @name jquery.signalslot.js
 * @version 0.1.1 2008/9/6
 * @require jquery.js
 * Inspired by jquery.sigslot.js which developed by  KIM, SAHNG YOUNG <aj@ajaxian.kr>
 *
 * Licensed under the MIT:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2008-, Yuanhao Li (jay_21cn -[at]- hotmail [*dot*] com)
 */

;(function($) {
    if (typeof $ != 'function' || typeof $.fn == typeof __undefined__)
        throw new Error("jquery library should included first of all. ");
	
    if (typeof $.signal == 'function')
        return;

    /**
     * Class Slot
     */
    function Slot(scope, callback) {
        this.scope = scope;
        this.callback = callback;
        this.getScope = function() {
            return this.scope;
        }
    }

    Slot.prototype.call = function(args) {
        var caller;

        if (typeof this.callback != 'function') return;

        if (args && typeof(args) == 'object' && typeof(args.pop) == 'function') {
            caller = (function (_slotObj, _args) {
                          return function() {
                                     _slotObj.callback.apply(
                                         _slotObj.getScope(),
                                         _args
                                     ); 
                                 };
                      })(this, args);
        } else {
            caller = (function (_slotObj, _args) {
                          return function() {
                                     _slotObj.callback.call(
                                         _slotObj.getScope(),
                                         _args
                                     );
                                 }
                      })(this, args);
        }
        caller();
    }
    /**
     * End class Slot
     */

    var SLOTS = {};

    var trimingIdRegex = /^\s+|\s+$/g;

    var emitSignal = function(sid, args) {
        for (var i = 0; i < SLOTS[sid].length; i++) {
            var objSlot = SLOTS[sid][i];
            objSlot.call(args);
        }
    };

    var addLocalSlot = function(sid, callback, repeatable) {
        var objSlot = new Slot(this, callback);

        if (typeof callback != 'function')
            return false;

        if (!(sid in SLOTS) || SLOTS[sid].constructor != Array)
            SLOTS[sid] = [];

        if (!repeatable) {
            var found = false;
            for (var i = 0; i < SLOTS[sid].length; i ++) {
                if (SLOTS[sid][i].callback === callback) {
                    if (found) {
                        delete SLOTS[sid][i];
                        i--;
                    } else {
                        SLOTS[sid][i] = objSlot;
                        found = true;
                    }
                }
            }
            if (found) return true;
        }

        SLOTS[sid].push(objSlot);
    };

    var addSlot = function(sid, callback, repeatable) {
        var objSlot = new Slot(window, callback);

        if (typeof callback != 'function')
            return false;

        if (!(sid in SLOTS) || SLOTS[sid].constructor != Array)
            SLOTS[sid] = [];

        if (!repeatable) {
            var found = false;
            for (var i = 0; i < SLOTS[sid].length; i ++) {
                if (SLOTS[sid][i].callback === callback) {
                    if (found) {
                        delete SLOTS[sid][i];
                        i--;
                    } else {
                        SLOTS[sid][i] = objSlot;
                        found = true;
                    }
                }
            }
            if (found) return true;
        }

        SLOTS[sid].push(objSlot);
    };

    var countSlot = function(sid) {
        try {
            return SLOTS[sid].length;
        } catch (e) {
            return 0;
        }
    };

    var existSlot = function(sid) {
        return (typeof sid == 'string') && ((sid=sid.replace(trimingIdRegex, "")).length >= 1) && (typeof SLOTS[sid] == 'array') && (SLOTS[sid].length > 0);
    };

    var removeSlot = function(sid, slotCallback) {
        try {
            if (typeof slotCallback == typeof __undefined__ ) {
                delete SLOTS[sid];
                return;
            }
            var x = SLOTS[sid];
            for (var i = 0; i < x.length; i++) {
                if (x[i].callback === slotCallback) {
                    delete x[i];
                }
            }
        } catch (e) {
           alert(id + ': ' + e.message); 
        }
    };

    function functionRunner(object, func, args) {
        if (args && typeof(args) == 'object' && typeof(args.pop) == 'function'){
            return func.apply(object, args);
        } else {
            return func.call(object, args);
        }
    }


    /**********************************
     * @param {Object} sid - unique signal id
     * @param {Object} args - passed to the slot function. if you want to give more than one, wrap them as Array. e.g: $.signal('some-id', [a,b,c,d])
     * @param {Object} opts - Options
            - evt: event for to emit this signal
            - prefunc: condition check for emit this signal
            - callback: callback function after this signal emitted
     */
    $.fn.extend({
        signal: function(sid, args, opts) {
                var signalCallback;

                if (typeof sid != typeof 'string' || (sid=sid.replace(trimingIdRegex,"")).length <= 0)
                    throw new Error("Signal ID is not valid - " + sid);        

                args = (typeof args == typeof __undefined__) ? '' : args;
                opts = $.extend({}, $.signalslot.defaults, opts);

                if (typeof opts.prefunc != 'function' && typeof opts.callback != 'function')
                    throw new Error("prefunc and callback are invalid function.");

                signalCallback = function(event) {
                    if (functionRunner(event.data, opts.prefunc)) {
                        if ($.slot.count(sid)) {
                            emitSignal(sid, args);
                            functionRunner(event.data, opts.callback);
                        }
                    }
                };

                return this.each(function() {
                    $(this).bind(opts.evt, this, signalCallback);
                });
            },
        slot: function(sid, callback, repeatable) {
                return this.each(function() {
                   functionRunner(this, addLocalSlot, [sid, callback, true]);
                });
            }
    });

    $.signalslot = {};
    $.extend($.signalslot, {
        defaults: {
            evt: 'click',
            prefunc: function() { return true; },
            callback: function() {}
        }
    });

    // $.extend($.fn.signal, {
        // defaults: {
            // evt: 'click',
            // prefunc: function() { return true; },
            // callback: function() { return; },
        // },
    // });

    $.slot = {
        count: countSlot,
        exist: existSlot,
        add: addSlot,
        remove: removeSlot
    };
 })(jQuery);
