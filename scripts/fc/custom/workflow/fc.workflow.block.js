(function ($) {
	$.fc.widget("fc.workflow.block", {
		defaultElement: '<div>',

		options: {
			css: {
				width: 250
			},
			text: ""
		},

		_create: function () {
			this.element
				.html(this.options.text)
				.addClass(this.widgetBaseClass + " ui-state-default ui-corner-all")
				.disableSelection();

			this.element.wrapInner('<span class="fc-workflow-block-content"></span>');

			this.connections = [];
		},

		_init: function () {
			var self = this;

			this.widget().css(this.options.css);

			this.connectors = new $.fc.observable(this.getConnectors());

			if (this.options.connectWith && $.isArray(this.options.connectWith)) {
				if ($.isArray(this.options.connectWith[0])) {
					$.each(this.options.connectWith, function (index, connectWith) {
						self.connectWith.apply(self, connectWith);
					});
				} else {
					this.connectWith.apply(this, this.options.connectWith);
				}
			}
		},

		_destroy: function () {
			this.element
				.removeClass(this.widgetBaseClass + " ui-state-default ui-corner-all");

			delete this.connectors;
		},

		getConnectors: function (position) {
			var width = this.widget().outerWidth(),
				height = this.widget().outerHeight();

			position = position || this.widget().position();

			return {
				top: { x: position.left + width / 2, y: position.top },
				bottom: { x: position.left + width / 2, y: position.top + height },
				left: { x: position.left, y: position.top + height / 2 },
				right: { x: position.left + width, y: position.top + height / 2 }
			};
		},

		connectWith: function (block, fromConnector, toConnector) {
			this.connections.push(new $.fc.workflow.connection(this, block, fromConnector, toConnector));
		}
	});
})(jQuery);