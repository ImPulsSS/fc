(function ($) {
	$.fc.namespace("fc.dialog");

	$.fc.dialog = {
		defaults: {
			widthOffset: 22,
			heightOffset: 100,
			inputHeight: 30,

			dimensions: { "min-width": 300, "max-width": 600 },
			css: { "padding-top": 10 }
		},

		_response: function (callback, value) {
			$(this).dialog("destroy");
			$(this).remove();

			if (typeof (callback) !== "undefined" && $.isFunction(callback)) {
				callback(value);
			}
		},

		alert: function (title, message, callback) {
			var size = $.fc.getTextDimensions(message, $.fc.dialog.defaults.dimensions, "ui-widget ui-dialog-content");

			$('<div></div>', {
					html: message,
					title: title,
					css: $.fc.dialog.defaults.css
				})
				.appendTo(document.body)
				.dialog({
					modal: true,
					resizable: false,
					width: size.width + $.fc.dialog.defaults.widthOffset,
					height: size.height + $.fc.dialog.defaults.heightOffset,
					buttons: {
						ok: function () {
							$.fc.dialog._response.call(this, callback);
						}
					}
				});
		},

		confirm: function (title, message, callback) {
			var size = $.fc.getTextDimensions(message, $.fc.dialog.defaults.dimensions, "ui-widget ui-dialog-content");

			$('<div></div>', {
					html: message,
					title: title,
					css: $.fc.dialog.defaults.css
				})
				.appendTo(document.body)
				.dialog({
					modal: true,
					resizable: false,
					width: size.width + $.fc.dialog.defaults.widthOffset,
					height: size.height + $.fc.dialog.defaults.heightOffset,
					buttons: {
						ok: function () {
							$.fc.dialog._response.call(this, callback, true);
						},
						cancel: function () {
							$.fc.dialog._response.call(this, callback, false);
						}
					}
				});
		},

		prompt: function (title, message, value, callback) {
			if ($.isFunction(value)) {
				callback = value;
				value = null;
			}

			var size = $.fc.getTextDimensions(message, $.fc.dialog.defaults.dimensions, "ui-widget ui-dialog-content");

			$('<div></div>', {
					html: message + '<div class="ui-widget fc-form-field"><input type="text"></div>',
					title: title,
					css: $.fc.dialog.defaults.css
				})
				.appendTo(document.body)
				.dialog({
					modal: true,
					resizable: false,
					width: size.width + $.fc.dialog.defaults.widthOffset,
					height: size.height + $.fc.dialog.defaults.heightOffset + $.fc.dialog.defaults.inputHeight,
					buttons: {
						ok: function () {
							var value = $(this).find('input').val();
							$.fc.dialog._response.call(this, callback, value);
						},
						cancel: function () {
							$.fc.dialog._response.call(this, callback, false);
						}
					}
				})
				.find('input')
				.val(value);
		},

		show: function (options) {
			$('<div></div>')
				.appendTo(document.body)
				.dialog(options);
		}
	};
})(jQuery);