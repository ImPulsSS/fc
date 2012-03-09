(function ($) {
	$.fc.widget("fc.alert", $.fc.base.hidable, {
		defaultElement: '<div>',

		options: {
			text: null,

			closable: true,
			showTime: -1,

			state: 'ui-state-highlight' // ui-state-error
		},

		_create: function () {
			var self = this;

			this.element
				.html(this.options.html);

			this.widgetBaseClass = [
					"ui-corner-all",
					this.widgetBaseClass,
					this.options.state
				].join(' ');

			this.element.addClass(this.widgetBaseClass);

			if (this.options.showTime > 0) {
				setTimeout(function () {
						self.hide.apply(self, arguments);
					}, this.options.showTime);
			}
		},

		_init: function () {
			this._callMethod("_render");
		},

		_render: function () {
			if (this.options.closable) {
				var self = this;

				$('<a></a>', {
						"href": "#",
						"text": "&times;",
						"class": "ui-icon ui-icon-close fc-alert-close"
					})
					.click(function (e) {
						self.hide.apply(self, arguments);
						e.preventDefault();
					})
					.appendTo(this.element);
			}
		},

		_destroy: function() {
			this.element
				.removeClass(this.widgetBaseClass);

			this.element
				.find("fc-alert-close")
				.remove();
		}
	});

	$.fc.alert.error = function (text) {
		return new $.fc.alert({
			state: "ui-state-error",
			html: text
		});
	};

	$.fc.alert.highlight = function (text) {
		return new $.fc.alert({
			state: "ui-state-highlight",
			html: text
		});
	};
})(jQuery);