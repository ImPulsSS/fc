(function ($) {
	$.fc.widget("fc.form.field.radio", $.fc.form.field, {
		defaultElement: '<input type="radio">',

		options: {
			css: {
				"width": null
			}
		},

		value: function () {
			if (arguments.length === 0) {
				return this.element.is(":checked") ? this.element.val() : null;
			} else {
				this.element.val(arguments[0]);
				return arguments[0];
			}
		}
	});
})(jQuery);