(function ($) {
	$.fc.widget("fc.tooltip", {
		implement: { hidable: $.fc.hidable },

		options: {
			text: function () {
				return this.element.data('tooltip');
			},

			visible: false,

			position: {
				my: "left+15 bottom",
				at: "center top",
				collision: "flipfit flipfit"
			},

			parent: document.body,

			animations: {
				show: function (callback) {
					$(this)
						.fadeIn(100, callback);
				},
				hide: function (callback) {
					$(this).hide();
				}
			}
		},

		_create: function () {
			var self = this;

			this.tooltip = $('<div></div>', {
					"class": this.widgetBaseClass,
					"html": $.isFunction(this.options.text) ?
						this.options.text.call(this) :
						this.options.text
				})
				.appendTo(this.options.parent)
				.position($.extend({ of: this.element }, this.options.position))
				.hide();

			this.cachedTitle = this.element.attr('title');

			this.element
				.removeAttr('title')
				.bind('mouseenter.' + this.widgetName, function () {
					self.show();
				})
				.bind('mouseleave.' + this.widgetName, function () {
					self.hide();
				});
		},

		_destroy: function() {
			this.tooltip.remove();

			this.element.attr('title', this.cachedTitle);

			delete this.cachedTitle;
			delete this.tooltip;
		},

		widget: function () {
			return this.tooltip;
		}
	});
})(jQuery);