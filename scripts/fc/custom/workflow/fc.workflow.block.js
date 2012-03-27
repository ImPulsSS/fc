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
			var self = this;

			this.element
				.html(this.options.text)
				.addClass(this.widgetBaseClass + " ui-state-default ui-corner-all")
				.disableSelection();

			this.element.wrapInner('<span class="fc-workflow-block-content"></span>');

			this.connections = new $.fc.observableArray([]);
			this.connections.bind("change", function (e, connection) {
				self.position();
			});
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

			this.widget()
				.draggable({
					drag: function (e, ui) {
						self.connectors(self.getConnectors(ui.position));
					}
				});
		},

		_destroy: function () {
			this.element
				.removeClass(this.widgetBaseClass + " ui-state-default ui-corner-all");

			this.element.empty();

			delete this.connectors;
		},

		getConnectors: function (position) {
			var width = this.widget().outerWidth(),
				height = this.widget().outerHeight();

			position = position || this.widget().position();

			return {
				top: {
					name: "top",
					x: position.left + width / 2,
					y: position.top,
					offset: "0 -100"
				},
				right: {
					name: "right",
					x: position.left + width,
					y: position.top + height / 2,
					offset: "400 100"
				},
				bottom: {
					name: "bottom",
					x: position.left + width / 2,
					y: position.top + height,
					offset: "0 100"
				},
				left: {
					name: "left",
					x: position.left,
					y: position.top + height / 2,
					offset: "-400 100"
				}
			};
		},

		connectWith: function (block, fromConnector, toConnector, formChild) {
			var connection = new $.fc.workflow.connection(this, block, fromConnector, toConnector, !!formChild);
			this.connections.push(connection);
			block.connections.push(connection);
		},

		position: function () {
			var self = this;
			$.each(this.connections(), function (index, connection) {
				 var direction = self === connection.options.from ?
						 "from" :
						 "to",
					 connector = connection.getConnector(direction);

				 if ((direction === "from" && !connection.options.formChild) || (direction === "to" && connection.options.formChild)) {
				    return;
				 }

				self.widget().position({
					of: connection.options[direction === "from" ? "to" : "from"].widget(),
					my: "center center",
					at: "center center",
					offset: connection.getConnector(direction === "from" ? "to" : "from").offset
				});

				if (typeof (self.options.css.left) !== "undefined" || typeof (self.options.css.top) !== "undefined") {
					self.widget().css({
						left: self.options.css.left,
						top: self.options.css.top
					});
				}

				 self.connectors(self.getConnectors());
			});
		}
	});
})(jQuery);