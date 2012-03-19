(function ($) {
	$.fc.widget("fc.grid", {
		defaultElement: '<table>',

		options: {
			columns: [],
			data: []
		},

		_create: function () {
			this.element.wrap('<div></div>');

			this.container = this.element.parent()
				.addClass(this.widgetBaseClass);

			this.element
				.addClass(this.widgetFullName + "-table");

			this.overlay = new $.fc.overlay({ parent: this.container });

			this._callMethod("_renderHeaders");

			this._callMethod("_render");
		},

		_destroy: function() {
			this.element
				.removeClass(this.widgetBaseClass)
				.unwrap();

			this.headers
				.children('div')
				.each(function () {
					$(this).parent().text(this.innerText);
				})

			delete this.headers;
			delete this.cells;
			delete this.container;
		},

		_render: function () {
			this.cells = this.element
				.find('tbody td').addClass(this.widgetFullName + "-cell").end()
				.find('tbody tr:odd td').addClass(this.widgetFullName + "-cell-odd").end()
				.find('tbody tr:even td').addClass(this.widgetFullName + "-cell-even").end();
		},

		_renderHeaders: function () {
			var $this,
				self = this,
				head = this.element.find('thead tr'),
				columns = [];

			this.element
				.find('thead td, thead th')
				.each(function (index) {
					$this = $(this)
						.wrapInner('<div></div>');

					columns.push({
						text: this.innerText,
						dataIndex: index,
						resizable: typeof ($this.data('resizable')) !== "undefined" ?
							$this.data('resizable') :
							true,
						sortable: typeof ($this.data('sortable')) !== "undefined" ?
							$this.data('sortable') :
							true
					});
				});

			$.each(this.options.columns, function (index, column) {
				columns.push($.extend({
						text: "column " + columns.length,
						dataIndex: columns.length,
						resizable: true,
						sortable: true
					}, column));

				$('<th></th>', { text: column.text, data: { resizable: column.resizable, sortable: column.sortable } })
					.wrapInner('<div></div>')
					.appendTo(head);
			});

			this.headers = this.element
				.find('thead td, thead th');

			this.headersWrappers = this.headers
				.children('div')
				.addClass(this.widgetFullName + "-header")
				.each(function (index) {
					$this = $(this)
						.addClass(self.widgetFullName + "-column-" + (index + 1) + " ui-state-default");

					if (columns[index].resizable) {
						$this.resizable({
							helper: "ui-resizable-helper",
							handles: "e"
						});
					}

					if (columns[index].sortable) {
						$this
							.addClass(self.widgetFullName + "-sortable")
							.append('<span class="ui-icon ui-icon-triangle-2-n-s"/>')
							.mouseenter(function () {
								$(this)
									.removeClass('ui-state-default')
									.addClass('ui-state-hover');
							})
							.mouseleave(function () {
								$(this)
									.removeClass('ui-state-hover')
									.addClass('ui-state-default');
							})
							.click(function () {
								self.headersWrappers
									.filter('.ui-state-active')
									.removeClass('ui-state-active');

								$(this)
									.addClass('ui-state-active');
							});
					}
				});

			this.headersWrappers
				.first()
				.addClass('ui-corner-tl');

			this.headersWrappers
				.last()
				.addClass('ui-corner-tr');
		}
	});
})(jQuery);