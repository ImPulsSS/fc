(function ($) {
	$.fc.widget("fc.form.field.hidden", $.fc.form.field, {
		defaultElement: '<input type="hidden">',

		_render: function () {
			this.value(this.options.value || null);
		},

		widget: function() {
			return this.element;
		}
	});
})(jQuery);