(function ($) {
	var eventNames = {
		"blur": true,
		"change": true,
		"click": true,
		"dblclick": true,
		"focus": true,
		"focusin": true,
		"focusout": true,
		"keydown": true,
		"keypress": true,
		"keyup": true,
		"mousedown": true,
		"mouseenter": true,
		"mouseleave": true,
		"mousemove": true,
		"mouseout": true,
		"mouseover": true,	
		"mouseup": true,
		"resize": true,
		"scroll": true,
		"select": true,
		"submit": true
	};

	$.fc.widget("fc.form.field", {
		defaultElement: '<input>',

		options: {
			decorate: true,
			dataType: "string",
			tabIndex: null,
			placeholder: "",
			labelStyle: {
				"display": "inline-block",
				"min-width": 70
			},
			css: {
				"width": 150
			}
		},

		_create: function () {
			var self = this;

			this.name = this.options.name || this.element[0].name || $.fc.getId();
			this.element[0].name = this.name;

			this.options.required = this.options.required || this.element.attr("required");
			this.options.pattern = this.options.pattern || this.element.attr("pattern");
			this.options.placeholder = this.options.placeholder || this.element.attr("placeholder");

			if (this.options.tabIndex) {
				this.element[0].tabIndex = this.options.tabIndex;
			} else {
				this.options.tabIndex = this.element[0].tabIndex;
			}

			this.element.data('fcFieldWidget', this);

			if (this.options.css) {
				this.element.css(this.options.css);
			}

			if (this.options.placeholder) {
				this.element.attr("placeholder", this.options.placeholder);
			}

			$.each(this.options, function (event, handler) {
				if (event in eventNames && $.isFunction(handler)) {
					self.element.on(event, function () {
						handler.apply(self, arguments);
					})
				}
			});
		},

		_destroy: function () {
			if (this.options.decorate) {
				if (this.label) {
					this.label.remove();
					delete this.label;
				}

				this.element
					.unwrap();
			}
		},

		_init: function () {
			this._callMethod("_render");
		},

		_render: function () {
			if (this.options.decorate) {
				if (!this.wrapper) {
					this.element.wrap("<div></div>");

					this.wrapper = this.element.parent().addClass(this.widgetBaseClass);
				}

				if (this.options.label && !this.wrapper.find('label').length) {
					$("<label></label>", { "text": this.options.label})
						.css(this.options.labelStyle || {})
						.prependTo(this.wrapper);
				}
			}
			
			this.value(this.options.value || this.element.val() || null);
		},

		_resetValidation: function () {
			this.element.removeClass('ui-state-error');
			this.element.unbind('change.' + this.widgetFullName);
		},

		_markInvalid: function () {
			var self = this;

			this.element.addClass('ui-state-error');
			this.element.bind('change.' + this.widgetFullName, function () {
				self.valid();
			});
		},

		reset: function () {
			this.value(this.options.value || null);
			this._resetValidation();

			return this;
		},

		valid: function () {
			var value = this.value();

			this._resetValidation();

			if (!!this.options.required && !value) {
				this._markInvalid();
				return false;
			}

			if (typeof (this.options.pattern) === "string" && !value.match(this.options.pattern)) {
				this._markInvalid();
				return false;
			}

			return true;
		},

		value: function () {
			if (arguments.length === 0) {
				return this.element.val();
			} else {
				this.element.val(arguments[0]);
				return arguments[0];
			}
		},

		rawValue: function () {
			return this.element.val();
		},

		widget: function() {
			return this.wrapper;
		}
	});
})(jQuery);