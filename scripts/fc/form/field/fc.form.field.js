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
			fieldWrapperClass: 'ui-widget fc-form-field',
			dataType: "string",
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

			this.name = this.options.name || $.fc.getId();
			this.element[0].name = this.name;

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

		_init: function () {
			this._callMethod("_render");
		},

		_render: function () {
			if (this.options.decorate) {
				this.element.wrap("<div></div>");

				this.wrapper = this.element.parent().addClass(this.options.fieldWrapperClass);

				if (this.options.label) {
					$("<label></label>", { "text": this.options.label})
						.css(this.options.labelStyle)
						.prependTo(this.wrapper);
				}
			}
			
			this.value(this.options.value || null);
		},

		_resetValidation: function () {
			this.element.removeClass('ui-state-error');
			this.element.unbind('change.field');
		},

		_markInvalid: function () {
			var self = this;

			this.element.addClass('ui-state-error');
			this.element.bind('change.field', function () {
				self.valid();
			});
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