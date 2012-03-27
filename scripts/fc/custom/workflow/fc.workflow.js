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

			this.blocks = new $.fc.observableArray([]);

			var root = new $.fc.workflow.iconblock({
						text: 'Capturing: All new subscribers<br><a href="#">Specify new subscribers</a>',
						name: "root",
						iconDirection: "bottom",
						css: { left: 0, width: 900 },
						appendTo: this.element,
						fixed: true
					}),
				top = new $.fc.workflow.iconblock({
						text: 'Capturing: All new subscribers<br><a href="#">Specify new subscribers</a>',
						name: "top",
						iconDirection: "top",
						css: { left: 0, width: 900 },
						appendTo: this.element
					}),

				block1 = new $.fc.workflow.iconblock({
						text: 'Condition block #1<br><a href="#">edit</a>',
						name: "block1",
						iconDirection: "left",
						appendTo: this.element
					}),
				block2 = new $.fc.workflow.iconblock({
						text: 'Condition block #2<br><a href="#">edit</a>',
						name: "block2",
						iconDirection: "left",
						css: {  },
						appendTo: this.element
					}),
				block3 = new $.fc.workflow.iconblock({
						text: 'Condition block #3<br><a href="#">edit</a>',
						name: "block3",
						iconDirection: "left",
						css: {  },
						appendTo: this.element
					}),
				block4 = new $.fc.workflow.iconblock({
						text: 'Condition block #4<br><a href="#">edit</a>',
						name: "block4",
						iconDirection: "left",
						css: {  },
						appendTo: this.element
					}),
				add1 = new $.fc.workflow.add({
						name: "add1",
						connectWith: [
							[ root, "top", "bottom", true ],
							[ block1, "bottom", "top" ]
						],
						appendTo: this.element
					}),
				add2 = new $.fc.workflow.add({
						name: "add2",
						connectWith: [
							[ block1, "top", "bottom", true ],
							[ block3, "bottom", "top" ]
						],
						appendTo: this.element
					}),
				add3 = new $.fc.workflow.add({
						name: "add3",
						connectWith: [
							[ block1, "top", "right", true ],
							[ block2, "bottom", "top" ]
						],
						appendTo: this.element
					}),
				add4 = new $.fc.workflow.add({
						name: "add4",
						connectWith: [
							[ block2, "top", "bottom", true ],
							[ top, "bottom", "top" ]
						],
						appendTo: this.element
					}),
				add5 = new $.fc.workflow.add({
						name: "add5",
						connectWith: [
							[ block2, "top", "right", true ],
							[ top, "bottom", "top" ]
						],
						appendTo: this.element
					}),
				add6 = new $.fc.workflow.add({
						name: "add6",
						connectWith: [
							[ block3, "top", "bottom", true ],
							[ top, "bottom", "top" ]
						],
						appendTo: this.element
					}),
				add7 = new $.fc.workflow.add({
						name: "add7",
						connectWith: [
							[ block3, "top", "right", true ],
							[ block4, "bottom", "top" ]
						],
						appendTo: this.element
					}),
				add8 = new $.fc.workflow.add({
						name: "add8",
						connectWith: [
							[ block4, "top", "bottom", true ],
							[ top, "bottom", "top" ]
						],
						appendTo: this.element
					}),
				add9 = new $.fc.workflow.add({
						name: "add9",
						connectWith: [
							[ block4, "top", "right", true ],
							[ top, "bottom", "top" ]
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