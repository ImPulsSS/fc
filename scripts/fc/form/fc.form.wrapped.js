(function ($) {
	var attrFn = $.attrFn || {
		val: true,
		css: true,
		html: true,
		text: true,
		data: true,
		width: true,
		height: true,
		offset: true,
		click: true
	};

	$.fc.widget("fc.form.wrapped", $.fc.form, {
		options: {
			containerStyle: {},
			buttonSetClass: ''
		},

		_create: function () {
			$.fc.form.prototype._create.call(this);

			this.element.wrap('<div></div>');
			this.container = this.element
				.parent()
				.css(this.options.containerStyle);

			this._createButtons();
		},

		_createButtons: function() {
			var self = this,
				buttonPane = $("<div></div>", { "class": "ui-helper-clearfix" }),
				buttonSet = $("<div></div>", { "class": this.options.buttonSetClass }).appendTo(buttonPane);

			$.each(this.options.buttons, function(name, props) {
				props = $.isFunction(props) ?
					{ click: props, text: name } :
					props;

				var button = $('<button type="button"></button>')
					.click(function () {
						props.click.apply(self, arguments);
					})
					.appendTo(buttonSet);

				$.each(props, function (key, value) {
					if (key === "click") {
						return;
					}
					if (key in attrFn) {
						button[key](value);
					} else {
						button.attr(key, value);
					}
				});

				if ($.fn.button) {
					button.button();
				}
			});

			this.buttonPane = buttonPane.appendTo(this.container);
		},

		_destroy: function () {
			this.element.unwrap();

			this.buttonPane.remove();

			delete this.container;
			delete this.buttonPane;

			$.fc.form.prototype._destroy.call(this);
		},

		widget: function() {
			return this.container;
		}
	});
})(jQuery);