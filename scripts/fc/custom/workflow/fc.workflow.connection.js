(function ($) {
	$.fc.widget("fc.workflow.connection", {
		defaultElement: '<div>',

		options: {
			from: null,
			to: null,
			fromConnector: "top",
			toConnector: "bottom"
		},

		_constructor: function (from, to, fromConnector, toConnector, formChild) {
			var options = {
						from: from,
						to: to,
						fromConnector: fromConnector,
						toConnector: toConnector,
						formChild: formChild
					},
				element = $(this.defaultElement).appendTo(from.widget().parent());

			this._createWidget(options, element[0]);
		},

		_create: function () {
			var self = this;

			this.element
				.addClass(this.widgetBaseClass);

			this.id = $.fc.getId();

			this.from = this.options.from;
			this.from.connectors.bind("change." + this.id, function () {
				self.refresh();
			});

			this.to = this.options.to;
			this.to.connectors.bind("change." + this.id, function () {
				self.refresh();
			});

			this.refresh();
		},

		_destroy: function () {
			this.element
				.removeClass(this.widgetBaseClass);

			this.from.connectors.unbind("change." + this.id);

			delete this.from;
			delete this.to;
			delete this.id;
		},

		getConnector: function (direction) {
			return this[direction].connectors()[this.options[direction + "Connector"]];
		},

		refresh: function () {
			var from = this.getConnector("from"),
				to = this.getConnector("to"),
				borderWidth = "1px 0 0 1px";

			if (from.x > to.x && from.y > to.y) {
				borderWidth = "1px 1px 0 0";
			}
			if (from.x < to.x && from.y > to.y) {
				borderWidth = "0 1px 1px 0";
			}
			if (from.x < to.x && from.y < to.y) {
				borderWidth = "0 0 1px 1px";
			}

			this.element.css({
				width: Math.abs(to.x - from.x),
				height: Math.abs(to.y - from.y),
				left: Math.min(from.x, to.x) - 1,
				top: Math.min(from.y, to.y) - 1,
				borderWidth: borderWidth
			});
		}
	});
})(jQuery);