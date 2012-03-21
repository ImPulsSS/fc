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
			},

			render: function () {
				$(this).find('.fc-grid-row:last .fc-grid-cell:first div')
					.addClass('ui-corner-bl');
			}
		},

		_create: function () {
			this.element.wrap('<div></div>');

			this.container = this.element.parent()
				.addClass(this.widgetBaseClass);

			this.element
				.addClass(this.widgetFullName + "-table");

			this.overlay = new $.fc.overlay({ parent: this.container });

			this._callMethod("_renderHeaders");

			this._callMethod("_initData");

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
					$(this).parent().text($(this).text());
				});

			this.cells
				.removeClass(this.widgetFullName + "-cell");

			delete this.headers;
			delete this.header;
			delete this.body;
			delete this.container;
		},

		_initData: function () {
			var self = this,
				columns = self.columns(),
				data = [];

			this.element
				.find('tbody tr')
				.each(function (index) {
					data[index] = data[index] || [];

					$(this)
						.find('td')
						.each(function (column) {
							data[index][columns[column].property] = $(this).text();
						});
				});

			if (this.options.source !== null && this.options.source.widgetName === "fcDataView") {
				this.source = this.options.source;
			} else {
				var sourceOptions = {
						data: $.isArray(this.options.source) ? data.push.apply(this.options.source) : data,
						change: function () {
							self._callMethod("_render");
						}
					};

				this.source = new $.fc.data.view(
						$.isPlainObject(this.options.source) ?
							$.extend(true, sourceOptions, this.options.source) :
							sourceOptions
					);
			}
		},

		_render: function () {
			var tableRows = [],
				self = this,
				data = this.source.data();

	        this.element
				.find('tbody').remove();

			this.body = $('<tbody></tbody>')
				.insertAfter(this.header);

			if (!data.length) {
				this.source.refresh();
				return;
			}

			$.each(data, function (index, row) {
				tableRows.push(self._renderRow({ index: index, evenness: index % 2 ? "even" : "odd", row: row }));
			});

			this.body.html(tableRows.join(''));

			this.body
				.find('tr')
				.hover(function () {
					$(this).addClass(self.widgetFullName + "-row-over");
				}, function () {
					$(this).removeClass(self.widgetFullName + "-row-over");
				})
				.click(function () {
					self.body.find(".ui-state-highlight")
						.removeClass("ui-state-highlight");

					$(this).addClass("ui-state-highlight");
				})
				.disableSelection();
		},

		_renderRow: function (data) {
			return $.fc.tmpl(this.rowTemplate, data);
		},

		_renderHeaders: function () {
			var $this,
				self = this,
				columns = [];

			this.columns = new $.fc.observableArray([]);
			this.columns.bind('change', function (e, value) {
				self.rowTemplate = $.map(value, function (column, index) {
						return $.fc.stringBuilder.format('<td class="{0}-cell {0}-column-{1}"><div class="{0}-cell-inner"><%=row[{2}] || " "%></div></td>',
								self.widgetFullName,
								~~index + 1,
								$.isNumeric(column.property) ?
									column.property :
									"'" + column.property + "'");
					})
					.join('');

				self.rowTemplate = $.fc.stringBuilder.format('<tr class="{0}-row {0}-row-<%=evenness%>" data-index="<%=index%>">{1}</tr>', self.widgetFullName, self.rowTemplate);
			});

			this.header = this.element
				.find('thead');

			if (!this.header.length) {
				this.header = $('<thead></thead>')
					.prependTo(this.element);
			}

			this.header
				.find('td, th')
				.each(function (index) {
					$this = $(this)
						.wrapInner('<div></div>');

					columns.push({
						text: $this.text(),
						property: typeof ($this.data('property')) !== "undefined" ?
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
					.appendTo(self.header);
			});

			this.columns(columns);

			this.headers = this.header
				.find('td, th');

			this.headersWrappers = this.headers
				.children('div')
				.addClass(this.widgetFullName + "-header")
				.disableSelection()
				.each(function (index) {
					$this = $(this)
						.css(columns[index].css || {})
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

								self.sort.call(self, columns[index].property, directionAsc ? "desc" : "asc");
							});
					}

					if (columns[index].resizable) {
						$this
							.resizable({
								helper: "ui-resizable-helper",
								handles: "e",
								boundWidth: $this.width(),
								minWidth: $.fc.getTextDimensions($this.text(), { }, $this.attr('class') + " ui-widget").width
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

		sort: function (property, direction) {
			this.source.sort([{ property: property, direction: direction }]);
		},

		widget: function () {
			return this.container;
		}
	});
})(jQuery);