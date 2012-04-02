(function ($) {
	$.fc.widget("fc.form.field.checkbox", $.fc.form.field, {
		defaultElement: '<input type="checkbox">',

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
				if (arguments[0]) {
					this.element.attr("checked", true);
				}
				return arguments[0];
			}
		}
	});
})(jQuery);