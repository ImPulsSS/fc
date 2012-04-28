(function ($) {
	$.fc.widget("fc.form.wrapped", $.fc.form, {

		implement: { hidable: $.fc.hidable },

		options: {
			containerStyle: {},
			containerClass: null,
			buttonSetClass: '',

			buttons: []
		},

		_create: function () {
			this._base._create.call(this);

			this.element.wrap('<div></div>');
			this.container = this.element
				.parent()
				.addClass(this.options.containerClass)
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
					if (key in $.fc.attrFn) {
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

			this._base._destroy.call(this);
		},

		_renderField: function (fieldOptions) {
			switch (fieldOptions.type) {
				case "plain":
					return new $.fc.plain(fieldOptions, fieldOptions.html || fieldOptions.text);
			}

			return this._base._renderField.call(this, fieldOptions);
		},

		load: function (values) {
			if (typeof (values) === "undefined" || !values) {
				values = {};
			}

			var field, fieldName, fieldValue;

			this.element.find(':input').each(function () {
				field = $(this).data('fcFieldWidget');
				if (!field) {
					return;
				}

				field.reset();
			});

			for (fieldName in values) {
				fieldValue = values[fieldName];

				field = this.getField(fieldName);

				if (!field) {
					continue;
				}

				field.value(values[fieldName]);
			}
		},

		widget: function() {
			return this.container;
		}
	});
})(jQuery);