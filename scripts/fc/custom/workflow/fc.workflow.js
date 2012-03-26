(function ($) {
	$.fc.widget("fc.workflow", {
		options: {
			api: {

			}
		},

		_create: function () {
			var self = this;

			this.element
				.addClass(this.widgetBaseClass);

			var start = new $.fc.workflow.iconblock({
						text: 'Capturing: All new subscribers<br><a href="#">Specify new subscribers</a>',
						iconDirection: "bottom",
						css: { width: 900, left: 0, top: 0 },
						appendTo: this.element
					}),
				end = new $.fc.workflow.iconblock({
						text: 'Capturing: All new subscribers<br><a href="#">Specify new subscribers</a>',
						iconDirection: "top",
						css: { width: 900, left: 0, top: 600 },
						appendTo: this.element
					}),
				empty = new $.fc.workflow.iconblock({
						text: 'New condition block #1<br><a href="#">Create block</a>',
						iconDirection: "left",
						css: { left: 325, top: 300 },
						appendTo: this.element/*,
						connectWith: [
							[ start, "top", "bottom" ],
							[ end, "bottom", "top" ]
						] */
					}),
				add1 = new $.fc.workflow.add({
						css: { left: 325, top: 150 },
						connectWith: [
							[ start, "top", "bottom" ],
							[ empty, "bottom", "top" ]
						],
						appendTo: this.element
					}),
				add2 = new $.fc.workflow.add({
						css: { left: 325, top: 450 },
						connectWith: [
							[ empty, "top", "bottom" ],
							[ end, "bottom", "top" ]
						],
						appendTo: this.element
					});
		},

		_destroy: function () {
			this.element
				.removeClass(this.widgetBaseClass);
		},

		addBlock: function (setup) {

		}
	});
})(jQuery);