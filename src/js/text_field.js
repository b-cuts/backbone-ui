var bean = require('bean');
var _ = require('underscore');

var $ = require('./util');
var BaseView = require('./base_view');
var HasError = require('./has_error');
var HasFocus = require('./has_focus');
var HasFormLabel = require('./has_form_label');
var HasGlyph = require('./has_glyph');
var HasModel = require('./has_model');
var HasTextInput = require('./has_text_input');

module.exports = BaseView.extend({
  options: {
    // disables the input text
    disabled: false,

    // The type of input (text, password, number, email, etc.)
    type: 'text',

    // the value to use for both the name and id attribute
    // of the underlying input element
    name: null,

    // the tab index to set on the underlying input field
    tabIndex: null,

    // a callback to invoke when a key is pressed within the text field
    onKeyPress: $.noop,

    // if given, the text field will limit it's character count
    maxLength: null
  },

  // public accessors
  input: null,

  initialize: function(options) {

    BaseView.prototype.initialize.call(this, options);

    this.mixin([HasModel, HasGlyph, HasFormLabel, HasError,
      HasFocus, HasTextInput]);
    _(this).bindAll('_refreshValue');

    this.$el.addClass('text_field');

    if(this.options.name){
      this.$el.addClass(this.options.name);
    }

    this.input = $.el.input({maxLength: this.options.maxLength});

    bean.on(this.input, 'keyup', _(function(e) {
      if(_(this.options.onKeyPress).exists() && _(this.options.onKeyPress).isFunction()) {
        this.options.onKeyPress(e, this);
      }
    }).bind(this));

    this.setupTextInput(_(this._updateModel).bind(this));
    this._observeModel(this._refreshValue);
    if(!this.options.ignoreErrors) {
      this._observeErrors();
    }
  },

  render: function() {
    var value = (this.input && this.input.value.length) > 0 ?
      this.input.value : this.resolveContent();

    this.$el.empty();

    $.attr(this.input, {
      type: this.options.type || 'text',
      name: this.options.name || null,
      id: this.options.name || null,
      tabIndex: this.options.tabIndex || null,
      placeholder: this.options.placeholder || null,
      pattern: this.options.pattern || null,
      value: value || null
    });

    // insert glyph if exist
    this._parent = $.el.div({className: 'text_wrapper'});
    var content = this.input;
    var glyphLeftClassName = this.resolveGlyph(this.model, this.options.glyphLeftClassName);
    var glyphRightClassName = this.resolveGlyph(this.model, this.options.glyphRightClassName);
    this.insertGlyphLayout(glyphLeftClassName, glyphRightClassName, content, this._parent);

    // add focusin / focusout
    this.setupFocus(this.input, this._parent);

    this.el.appendChild(this.wrapWithFormLabel(this._parent));

    this.setEnabled(!this.options.disabled);

    return this;
  },

  getValue: function() {
    return this.input.value;
  },

  setValue: function(value) {
    this.input.value = value;
    this._updateModel();
  },

  // sets the enabled state
  setEnabled: function(enabled) {
    if(enabled) {
      this.$el.removeClass('disabled');
    } else {
      this.$el.addClass('disabled');
    }
    this.input.disabled = !enabled;
  },

  _updateModel: function() {
    _(this.model).setProperty(this.options.content, this.input.value);
  },

  _refreshValue: function() {
    var newValue = this.resolveContent();
    if(this.input && this.input.value !== newValue) {
      this.input.value = _(newValue).exists() ? newValue : "";
    }
  }
});
