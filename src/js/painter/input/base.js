/**
 * @fileoverview Base class for the Input Painter
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../../base/painter');
var keyNameMap = require('../../common/constMap').keyName;

/**
 * Input Painter Base
 * @module painter/input/base
 * @extends module:base/painter
 */
var InputPainter = tui.util.defineClass(Painter, /**@lends module:painter/input/base.prototype */{
    /**
     * @constructs
     * @param {Object} options - options
     */
    init: function() {
        Painter.apply(this, arguments);
    },

    /**
     * key-value object contains event names as keys and handler names as values
     * @type {Object}
     */
    events: {
        blur: '_onBlur',
        keydown: '_onKeyDown',
        focus: '_onFocus'
    },

    /**
     * css selector to find its own element(s) from a parent element.
     * @type {String}
     */
    selector: 'input',

    /**
     * keydown Actions
     * @type {Object}
     */
    keyDownActions: {
        ESC: function(param) {
            this.controller.finishEditing(param.address, true);
        },
        ENTER: function(param) {
            this.controller.finishEditing(param.address, true, param.value);
        },
        TAB: function(param) {
            this.controller.finishEditing(param.address, true, param.value);
            this.controller.focusInToNextCell(param.shiftKey);
        }
    },

    /**
     * Returns the cell address of the target element.
     * @param {jQuery} $target - target element
     * @returns {{rowKey: String, columnName: String}}
     * @private
     */
    _getCellAddress: function($target) {
        return {
            rowKey: $target.closest('tr').attr('key'),
            columnName: $target.closest('td').attr('columnName')
        };
    },

    /**
     * Extends the default keydown actions.
     * @param {Object} actions - Object that contains the action functions
     * @private
     */
    _extendKeydownActions: function(actions) {
        this.keyDownActions = _.assign({}, this.keyDownActions, actions);
    },

    /**
     * Extends the default event object
     * @param {Object} events - Object that contains the names of event handlers
     */
    _extendEvents: function(events) {
        this.events = _.assign({}, this.events, events);
    },

    /**
     * Executes the custom handler (defined by user) of the input events.
     * @param {Event} event - DOM event object
     * @private
     */
    _executeCustomEventHandler: function(event) {
        var $input = $(event.target),
            address = this._getCellAddress($input);

        this.controller.executeCustomInputEventHandler(event, address);
    },

    /**
     * Event handler for the 'focus' event.
     * @param {Event} event - DOM event object
     * @private
     */
    _onFocus: function(event) {
        var address = this._getCellAddress($(event.target));

        this._executeCustomEventHandler(event);
        this.controller.startEditing(address);
    },

    /**
     * Event handler for the 'blur' event.
     * @param {Event} event - DOM event object
     * @private
     */
    _onBlur: function(event) {
        var $target = $(event.target),
            address = this._getCellAddress($target);

        this._executeCustomEventHandler(event);
        this.controller.finishEditing(address, false, $target.val());
    },

    /**
     * Event handler for the 'keydown' event.
     * @param  {KeyboardEvent} event - KeyboardEvent object
     * @private
     */
    _onKeyDown: function(event) {
        var keyCode = event.keyCode || event.which,
            keyName = keyNameMap[keyCode],
            action = this.keyDownActions[keyName],
            $target = $(event.target),
            param = {
                $target: $target,
                address: this._getCellAddress($target),
                shiftKey: event.shiftKey,
                value: $target.val()
            };

        this._executeCustomEventHandler(event);

        if (action) {
            action.call(this, param);
            event.preventDefault();
        }
    },

    /**
     * Finds an element from the given parent element with 'this.selector', and moves focus to it.
     * @param {jquery} $parent - parent element
     */
    focus: function($parent) {
        var $input = $parent.find(this.selector);

        if (!$input.is(':focus')) {
            $input.eq(0).focus();
        }
    }
});

module.exports = InputPainter;