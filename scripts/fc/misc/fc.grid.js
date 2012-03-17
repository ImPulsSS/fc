(function ($) {
	$.fc.widget("fc.grid", {
		defaultElement: '<table>',

		options: {
		},

		_create: function () {
			this.element.wrap('<div></div>');

			this.container = this.element.parent()
				.addClass(this.widgetBaseClass);

			this.element
				.find('td')
		},

		_destroy: function() {
			this.element
				.removeClass(this.widgetBaseClass)
				.unwrap();
		},

		_render: function () {

		}
	});
})(jQuery);