(function ($) {
	$.fc.widget("fc.workflow.block", {
		defaultElement: '<div>',

		options: {
			css: {
				width: 250
			},
			icon: "",
			iconDirection: "left",
			text: ""
		},

		_create: function () {
			if ((this.options.iconDirection === "left" || this.options.iconDirection === "top") && this.options.css.width) {
				this.options.css.width -= 41;
			}

			this.element
				.text(this.options.text)
				.css(this.options.css)
				.addClass([ this.widgetBaseClass, "ui-state-default ui-corner-all", this.widgetFullName + "-icon-" + this.options.iconDirection ].join(" "));

			this.element.append('<div class="ui-state-default fc-workflow-block-icon"></div>');
		},

		_destroy: function () {
			this.element
				.removeClass([ this.widgetBaseClass, "ui-state-default ui-corner-all", this.widgetFullName + "-icon-" + this.options.iconDirection ].join(" "));
		},

		connectWith: function (block, points) {
			var fromOffset = this.element.offset(),
				toOffset = block.element.offset(),
				parentOffset = this.element.parent().offset(),
				from = {}, to = {};

			switch (points.from) {
				case "top":
					from.x = fromOffset.left + this.element.width() / 2 - parentOffset.left;
					from.y = fromOffset.top + this.element.height() / 2 - parentOffset.top;
					break;
				case "bottom":
					from.x = fromOffset.left + this.element.width() / 2 - parentOffset.left;
					from.y = fromOffset.top + this.element.height() / 2 - parentOffset.top;
					break;
				case "left":
					from.x = fromOffset.left + this.element.width() / 2 - parentOffset.left;
					from.y = fromOffset.top + this.element.height() / 2 - parentOffset.top;
					break;
				case "right":
					from.x = fromOffset.left + this.element.width() / 2 - parentOffset.left;
					from.y = fromOffset.top + this.element.height() / 2 - parentOffset.top;
					break;
			}

			switch (points.to) {
				case "top":
					to.x = toOffset.left + block.element.width() / 2 - parentOffset.left;
					to.y = toOffset.top + block.element.height() / 2 - parentOffset.top;
					break;
				case "bottom":
					to.x = toOffset.left + block.element.width() / 2 - parentOffset.left;
					to.y = toOffset.top + block.element.height() / 2 - parentOffset.top;
					break;
				case "left":
					to.x = toOffset.left + block.element.width() / 2 - parentOffset.left;
					to.y = toOffset.top + block.element.height() / 2 - parentOffset.top;
					break;
				case "right":
					to.x = toOffset.left + block.element.width() / 2 - parentOffset.left;
					to.y = toOffset.top + block.element.height() / 2 - parentOffset.top;
					break;
			}

			$('<div></div>', {
					"class": this.widgetFullName + "-connection",
					css: {
						width: Math.abs(to.x - from.x) + 1,
						height: Math.abs(to.y - from.y) + 1,
						left: from.x,
						top: from.y
					}
				})
				.appendTo(this.element.parent());
		}
	});
})(jQuery);