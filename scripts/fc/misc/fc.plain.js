(function ($) {
	$.fc.widget("fc.plain", {
		defaultElement: '<div>',

		_create: function (options) {
			if (typeof (options) !== "undefined" && typeof (options.html) !== "undefined" && options.html) {
				this._createWidget(options, $(options.html)[0]);
				return;
			}

			if (!this.element) {
				return;
			}

			var self = this;

			this.element.addClass(this.widgetBaseClass);

			for (var event in this.options) {
				if ($.isFunction(this.options[event])) {
					this.element.bind(event, self.options[event]);
				}
			}
		},

		_destroy: function () {
			this.element.removeClass(this.widgetBaseClass);
		}
	});
})(jQuery);