(function ($) {
	$.fc.widget("fc.pager", {
		defaultElement: '<div>',

		options: {
			source: null,
			template: '<button data-action="start">First</button>\
					   <button data-action="prev">Prev</button>\
					   <span class="fc-pager-custom-page">Page: <input type="text" class="fc-pager-current"> of <span class="fc-pager-total">0</span></span>\
					   <button data-action="next">Next</button>\
					   <button data-action="end">Last</button>'
		},

		_create: function () {
			var self = this;

			this.element
				.addClass(this.widgetBaseClass)
				.html(this.options.template);

			this.buttons = this.element
				.buttonset()
				.find("button")
				.click(function () {
					self.options.source.page();
				})
				.each(function () {
					var button = $(this),
						type = button.data("action");

					button.button({
						text: false,
						icons: {
							primary: "ui-icon-seek-" + type
						}
					});
				});

			this.current = this.element
				.find('.fc-pager-current')
				.val(this.options.source.page())
				.change(function () {
					self.options.source.page(this.value);
				});

			this.total = this.element
				.find('.fc-pager-total')
				.text(this.options.source.total());

			this.options.source.offset.bind("change", function () {
				self.refresh();
			});
			this.options.source.limit.bind("change", function () {
				self.refresh();
			});
			this.options.source.total.bind("change", function () {
				self.refresh();
			});

			this.refresh();
		},

		_destroy: function () {
			this.element
				.removeClass(this.widgetBaseClass)
				.empty();
		},

		refresh: function () {
			this.buttons.button("enable");

			if (!this.options.source.offset()) {
				this.buttons.filter('[data-action="start"], [data-action="prev"]').button("disable");
			}

			if (this.options.source.offset() + this.options.source.limit() >= this.options.source.total()) {
				this.buttons.filter('[data-action="end"], [data-action="next"]').button("disable");
			}

			this.current.val(this.options.source.page());
			this.total.text(this.options.source.totalPages());
		}
	});
})(jQuery);