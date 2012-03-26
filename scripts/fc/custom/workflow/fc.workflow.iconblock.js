(function ($) {
	$.fc.widget("fc.workflow.iconblock", $.fc.workflow.block, {
		options: {
			icon: "",
			iconDirection: "left"
		},

		_create: function () {
			$.fc.workflow.block.prototype._create.call(this);

			this.element
				.wrap('<div></div>');

			this.container = this.element.parent()
				.addClass(this.widgetFullName + " " + this.widgetFullName + "-" + this.options.iconDirection);

			this.icon = $('<div></div>', { "class": this.widgetFullName + "-icon ui-state-default " + this.options.icon })
				.appendTo(this.element);
		},

		_destroy: function () {
			this.element
				.unwrap();

			this.icon.remove();
			delete this.icon;

			$.fc.workflow.block.prototype._destroy.call(this);
		},

		getConnectors: function (position) {
			var iconWidth = this.icon.outerWidth(),
				iconHeight = this.icon.outerHeight(),
				iconPosition = this.icon.position();

			position = position || this.widget().position();

			return $.extend(true, $.fc.workflow.block.prototype.getConnectors.call(this, position), {
					iconTop: { x: position.left + iconWidth / 2, y: position.top + iconPosition.top },
					iconBottom: { x: position.left + iconWidth / 2, y: position.top + iconPosition.top + iconHeight }
				});
		},

		widget: function () {
			return this.container;
		}
	});
})(jQuery);