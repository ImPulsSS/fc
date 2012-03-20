(function ($) {
	$.fc.widget("fc.grid", {
		defaultElement: '<table>',

		options: {
			columns: [],
			source: null,

			showScrollBar: true,

			renderHeaders: function () {
				var headersWrappers = $(this).find('.fc-grid-header');

				headersWrappers
					.first()
					.addClass('ui-corner-tl');

				headersWrappers
					.last()
					.addClass('ui-corner-tr');
			}
		},

		_create: function () {
			this.element.wrap('<div></div>');

			this.container = this.element.parent()
				.addClass(this.widgetBaseClass);

			this.element
				.addClass(this.widgetFullName + "-table");

			this.overlay = new $.fc.overlay({ parent: this.container });

			if (!this.options.store) {
				this.options.store = new $.fc.data.store();
			}

			this._callMethod("_renderHeaders");

			this._callMethod("_render");
		},

		_destroy: function() {
			this.element
				.removeClass(this.widgetBaseClass)
				.find('tbody tr').removeClass(this.widgetFullName + "-row-odd " + this.widgetFullName + "-row-even").end()
				.unwrap();

			this.headers
				.children('div')
				.each(function () {
					$(this).parent().text(this.innerText);
				});

			this.cells
				.removeClass(this.widgetFullName + "-cell");

			delete this.headers;
			delete this.cells;
			delete this.container;
		},

		_render: function () {
			var data = [];

			this.cells = this.element
				.find('tbody tr')
				.each(function (index) {
					data[index] = data[index] || [];

					$(this)
						.find('td')
						.each(function () {
							data[index].push(this.innerText);
						});
				});



			/*this.element
				.find('tbody tr:odd').addClass(this.widgetFullName + "-row-odd").end()
				.find('tbody tr:even').addClass(this.widgetFullName + "-row-even").end();*/
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
						property: typeof ($this.data('resizable')) !== "undefined" ?
							$this.data('property') :
							index,
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
						property: columns.length,
						resizable: true,
						sortable: true
					}, column));

				$('<th></th>', {
						"text": column.text,
						"data-property": column.property,
						"data-sortable": column.sortable,
						"data-resizable": column.resizable
					})
					.wrapInner('<div></div>')
					.appendTo(head);
			});

			this.options.columns = columns;

			this.headers = this.element
				.find('thead td, thead th');

			this.headersWrappers = this.headers
				.children('div')
				.addClass(this.widgetFullName + "-header")
				.disableSelection()
				.each(function (index) {
					$this = $(this)
						.addClass(self.widgetFullName + "-column-" + (index + 1) + " ui-state-default");

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
									.removeClass('ui-state-hover ui-state-active')
									.addClass('ui-state-default');
							})
							.mousedown(function () {
								$(this)
									.addClass('ui-state-active');
							})
							.mouseup(function () {
								var $this = $(this).removeClass('ui-state-active'),
									directionAsc = $this.hasClass(self.widgetFullName + "-sortable-asc");

								self.headersWrappers
									.removeClass(self.widgetFullName + "-sortable-asc " + self.widgetFullName + "-sortable-desc")
									.find('.ui-icon')
										.removeClass('ui-icon-triangle-1-n ui-icon-triangle-1-s')
										.addClass('ui-icon-triangle-2-n-s');

								$this
									.addClass(self.widgetFullName + (directionAsc ? "-sortable-desc" : "-sortable-asc"))
									.find('.ui-icon')
										.removeClass('ui-icon-triangle-2-n-s ui-icon-triangle-1-n ui-icon-triangle-1-s')
										.addClass(directionAsc ? 'ui-icon-triangle-1-s' : 'ui-icon-triangle-1-n');

								self.sort.call(self, columns[index].dataIndex, directionAsc ? "desc" : "asc");
							});
					}

					if (columns[index].resizable) {
						$this
							.resizable({
								helper: "ui-resizable-helper",
								handles: "e",
								boundWidth: $this.width(),
								minWidth: columns[index].minWidth || $.fc.getTextDimensions($this.text(), {}, $this.attr('class') + " ui-widget").width
							})
							.find('.ui-resizable-e')
								.dblclick(function (e) {
									var $this = $(this).parent(),
										width = $this.resizable("option", "boundWidth");

									$this.width(width);
								});
					}
				});
		},

		sort: function () {
			//this.options.store.sort();
		},

		widget: function () {
			return this.container;
		}
	});
})(jQuery);