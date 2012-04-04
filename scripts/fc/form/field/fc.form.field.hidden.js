(function ($) {
	$.fc.widget("fc.form.field.hidden", $.fc.form.field, {
		defaultElement: '<input type="hidden">',

		options: {
			decorate: false,

			textValueStyle: {}
		},

		_render: function () {
			if (this.options.decorate) {
				this.element.wrap("<div></div>");

				this.wrapper = this.element.parent().addClass(this.widgetBaseClass);

				if (this.options.label) {
					$("<label></label>", { "text": this.options.label})
						.css(this.options.labelStyle)
						.prependTo(this.wrapper);
				}

				this.textValue = $("<span></span>", { "text": this.options.value, "class": this.widgetFullName + "-textvalue" })
					.css(this.options.textValueStyle)
					.appendTo(this.wrapper);
			}

			this.value(this.options.value || null);
		},

		value: function () {
			if (arguments.length === 0) {
				return this.element.val();
			} else {
				this.element.val(arguments[0]);

				if (typeof (this.textValue) !== "undefined") {
					this.textValue.html(arguments[0]);
				}

				return arguments[0];
			}
		},

		widget: function () {
			return this.options.decorate ? this.wrapper : this.element;
		}
	});
})(jQuery);