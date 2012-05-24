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
				this.element.val(typeof (arguments[0]) in { "string": true, "int": true } ? arguments[0] : true);
				this.element.attr("checked", !!arguments[0]);

				return arguments[0];
			}
		}
	});
})(jQuery);