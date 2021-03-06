(function ($) {
	$.fc.widget("fc.grid", {
		defaultElement: '<table>',

		options: {
			columns: [],
			css: {},
			source: null,

			caption: null,
			captionClass: "",

			autoRefresh: true,

			selectable: {
				enabled: true,
				multiple: false
			},

			showScrollBar: true,
			showFooter: true,

			extractExistingTextOnly: true,

			statTemplate: '<div class="<%=widgetFullName%>-stat">Displaying <span class="<%=widgetFullName%>-offset"><%=source.offset() + 1%></span> - <span class="<%=widgetFullName%>-limit"><%=source.offset() + source.limit()%></span> of <span class="<%=widgetFullName%>-total"><%=source.total()%></span></div>',

			headerTemplate:	'<tr>' +
			                    '<% for (var i = 0; i < columns.length; i++) { %>' +
									'<th data-column="<%=i + 1%>" data-property="<%=columns[i].property%>" data-sortable="<%=columns[i].sortable%>" data-resizable="<%=columns[i].resizable%>"><div><%=columns[i].text%></div></th>' +
								'<% } %>' +
							'</tr>',

			renderHeaders: function () {
			/*	var headersWrappers = $(this).find('.fc-grid-header');

				headersWrappers
					.first()
					.addClass('ui-corner-tl');

				headersWrappers
					.last()
					.addClass('ui-corner-tr');*/
			},

			getPager: function () {
				return new $.fc.pager({
						source: this.source
					});
			}
		},

		_create: function () {
			this.element.wrap('<div></div>');

			this.container = this.element.parent()
				.css(this.options.css)
				.addClass(this.widgetBaseClass);

			this.element
				.css(this.options.css)
				.addClass(this.widgetFullName + "-table");

			this.overlay = this.options.overlay || new $.fc.overlay(this.container);

			this.selected = new $.fc.observableArray([]);

			this._callMethod("_initColumns");

			this._callMethod("_initData");

			this._callMethod("_renderHeaders");

			this._callMethod("_renderCaption");

			this._callMethod("_renderBody");

			this._callMethod("_renderFooter");

			if (this.options.autoRefresh) {
				this.source.refresh();
			} else {
				this.data.trigger();
			}
		},

		_destroy: function () {
			this.element
				.removeClass(this.widgetBaseClass)
				.find('tbody tr').removeClass(this.widgetFullName + "-row-odd " + this.widgetFullName + "-row-even").end()
				.unwrap();

			this.body
				.enableSelection()
				.off("." + this.widgetName);

			this.headers
				.children('div')
				.each(function () {
					$(this).parent().html($(this).text());
				});

			this.footer.remove();

			delete this.data;
			delete this.selected;
			delete this.caption;

			delete this.headers;
			delete this.header;
			delete this.captionElement;
			delete this.body;
			delete this.pager;
			delete this.stat;
			delete this.footer;
			delete this.container;
		},

		_initColumns: function () {
			var $this,
				self = this,
				columns = [];

			this.columns = new $.fc.observableArray([]);
			this.columns.bind('change', function (e, value) {
				self.rowTemplate = $.map(value, function (column, index) {
						return $.fc.stringBuilder.format(	'<td class="{0}-cell {0}-column-{1}" data-column="{1}">' +
																(column.cellTemplate || '<div class="{0}-cell-inner{3}"><%=$.fc.data.getField(row, {2})%></div>') +
															'</td>',
								self.widgetFullName,
								Number(index) + 1,
								$.isNumeric(column.property) ?
									column.property :
									"'" + column.property + "'",
								column.cellClassName ? " " + column.cellClassName : "");
					})
					.join('');

				self.rowTemplate = $.fc.stringBuilder.format('<tr class="{0}-row {0}-row-<%=evenness%>" data-index="<%=index%>">{1}</tr>',
										self.widgetFullName,
										self.rowTemplate);

				self._callMethod("_renderHeaders");

				if (self.footer) {
					self.footer.attr('colspan', value.length);
				}
			});

			this.element
				.children('thead')
				.find('td, th')
				.each(function (index) {
					var $this = $(this),
						column = {
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
						};

					self._trigger("beforecolumnadded", null, this, column);

					columns.push(column);
				});

			$.each(this.options.columns, function (index, column) {
				columns.push($.extend({
						text: "column " + columns.length,
						property: columns.length,
						resizable: true,
						sortable: true
					}, column));
			});

			this.columns(columns);
		},

		_initData: function () {
			var self = this,
				extractExistingTextOnly = this.options.extractExistingTextOnly,
				columns = self.columns(),
				data = [];

			this.element
				.find('tbody tr')
				.each(function (index) {
					data[index] = data[index] || {};

					$(this)
						.find('td')
						.each(function (column) {
							data[index][columns[column].property] = extractExistingTextOnly ? $(this).text() : $(this).html();
						});
				});

			if (this.options.source !== null && this.options.source.widgetName === "fcDataView") {
				this.source = this.options.source;
				this.options.autoRefresh = false;
			} else {
				var sourceOptions = {
						data: $.isArray(this.options.source) ? data.concat(this.options.source) : data
					};

				this.source = new $.fc.data.view(
						$.isPlainObject(this.options.source) ?
							$.extend(true, sourceOptions, this.options.source) :
							sourceOptions
					);
			}

			this.data = new $.fc.observableArray(data);
			this.data.change(function () {
				self._callMethod("_render");
			});

			this.source._bind({
				change: function (e, records) {
					self.data.replaceAll(records);
					self.selected.removeAll();
				},
				beforerefresh: function () {
					self.overlay.resize().show();
				},
				refresh: function () {
					self.overlay.hide();
				}
			});
		},

		_render: function () {
			var tableRows = [],
				self = this,
				data = this.data() || [];

			self._trigger("beforerender", null, data);

			$.each(data, function (index, row) {
				tableRows.push(self._renderRow({ index: index, evenness: index % 2 ? "even" : "odd", row: row }));
			});

			this.body.html(tableRows.join(''));
		},

		_renderBody: function () {
			var self = this;

			this.element
				.find('tbody').remove();

			this.body = $('<tbody></tbody>')
				.insertAfter(this.header)
				.disableSelection()
				.on("mouseenter." + this.widgetName, "tr:not(.ui-state-disabled)", function (e) { $(this).addClass(self.widgetFullName + "-row-over"); })
				.on("mouseleave." + this.widgetName, "tr:not(.ui-state-disabled)", function (e) { $(this).removeClass(self.widgetFullName + "-row-over"); })
				.on("click." + this.widgetName, "tr:not(.ui-state-disabled)", function (e) {
					var record = self.source.data()[$(this).data('index')];

					if (self.options.selectable.enabled && !self.options.selectable.multiple) {
						self.body.find(".ui-selected")
							.removeClass("ui-selected ui-state-highlight");

						$(this).addClass("ui-selected ui-state-highlight");

						self.selected
							.replaceAll(record);

						self._trigger("rowselected", e, { items: $(this) });
					}

					self._trigger("rowclick", e, record);
				})
				.on("dblclick." + this.widgetName, "tr:not(.ui-state-disabled)", function (e) { self._trigger("rowdblclick", e, self.source.data()[$(this).data('index')] || self.data()[$(this).data('index')]); })
				.on("click." + this.widgetName, "td", function (e) {
					var td = $(this),
						tr = td.closest('tr');
					if (tr.hasClass('ui-state-disabled')) {
						return;
					}

					self._trigger("cellclick", e, self.source.data()[tr.data('index')] || self.data()[tr.data('index')], self.columns()[td.data('column') - 1]);
				})
				.on("dblclick." + this.widgetName, "td", function (e) {
					var td = $(this),
						tr = td.closest('tr');
					if (tr.hasClass('ui-state-disabled')) {
						return;
					}
					self._trigger("celldblclick", e, self.source.data()[tr.data('index')] || self.data()[tr.data('index')], self.columns()[td.data('column') - 1]);
				});

			if (self.options.selectable.enabled && self.options.selectable.multiple) {
				this.body.selectable({
					filter: "tr",
					cancel: ".ui-selected,.ui-state-disabled",
					stop: function (e) {
						var selected = self.body.find('.ui-selected');

						self._trigger("rowselected", e, { items: selected });

						self.selected
							.replaceAll(selected.map(function () {
									return self.source.data()[$(this).data('index')];
								}).toArray());
					}
				});
			}
		},

		_renderCaption: function () {
			var self = this;

			this.captionElement = this.element.find('caption');

			if (!this.captionElement.length) {
				this.captionElement = $('<caption></caption>', { "class": self.widgetFullName + "-caption " + self.options.captionClass, html: this.options.caption })
					.prependTo(this.element);
			}

			this.caption = new $.fc.observable(this.captionElement.html());
			this.caption.change(function (e, data) {
				self.captionElement.html(data);
			});
		},

		_renderFooter: function () {
			if (!this.options.showFooter) {
				return;
			}

			this.footer = this.element
				.find('tfoot tr td');

			var cols = this.columns().length;

			if (!this.footer.length) {
				this.footer = $('<tfoot><tr><td colspan=' + cols + '></td></tr></tfoot>')
					.appendTo(this.element)
					.find('td')
					.addClass(this.widgetFullName + "-footer ui-state-default");
			}

			this._renderStat();

			this.pager = this.options.getPager.call(this);

			this.pager
				.widget()
				.appendTo(this.footer);
		},

		_renderHeaders: function () {
			var $this,
				self = this,
				columns = this.columns(),
				colgroup = $('<colgroup>');

			this.header = this.element
				.find('thead');

			if (!this.header.length) {
				this.header = $('<thead></thead>')
					.prependTo(this.element);
			}

			self.header.html($.fc.tmpl(self.options.headerTemplate, { columns: columns }));

			this.headers = this.header
				.find('td, th');

			this.headersWrappers = this.headers
				.children('div')
				.addClass(this.widgetFullName + "-header")
				.disableSelection()
				.each(function (index) {
					$this = $(this)
						.css($.extend({}, columns[index].css || {}, { width: null, height: null, minWidth: null, minHeight: null, maxWidth: null, maxHeight: null }))
						.addClass(self.widgetFullName + "-column-" + (index + 1) + " ui-state-default");

					var col = $('<col>', {
							width: columns[index].css && columns[index].css.width ?
								columns[index].css.width :
								$this.parent().width() || null,
							"data-flex": !columns[index].css || !columns[index].css.width
						})
						.appendTo(colgroup);

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
							.click(function () {
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

								self.sort.call(self, columns[index], columns[index].property, directionAsc ? "DESC" : "ASC");
							});
					}

					if (columns[index].resizable) {
						$this
							.resizable({
								helper: "ui-resizable-helper",
								handles: "e",
								boundWidth: $this.width(),
								stop: function (e, ui) {
									col.width(ui.size.width);
									$(this).css({ width: "auto", height: "auto" });

									var flexCol,
										flexCols = self.colgroup
											.find('[data-flex="true"]'),
										decrease = (ui.size.width - ui.originalSize.width - $(this).width() + col.width()) / flexCols.length;

									flexCols.each(function () {
										flexCol = $(this);
										flexCol.width(flexCol.width() - decrease);
									});
								},
								minWidth: $.fc.getTextDimensions($this.text(), { }, $this.attr('class') + " ui-widget").width
							})
							.find('.ui-resizable-e')
								.dblclick(function () {
									var $this = $(this).parent(),
										width = $this.resizable("option", "boundWidth");

									$this.width(width);
								});
					}
				});

			this.colgroup = this.element
				.find('colgroup');

			if (!this.colgroup.length) {
				this.colgroup = $('<colgroup></colgroup>')
					.prependTo(this.element);
			}

			this.colgroup.empty();
			colgroup.find('col').detach().appendTo(this.colgroup);
			colgroup.remove();
		},

		_renderRow: function (data) {
			return $.fc.tmpl(this.rowTemplate, data);
		},

		_renderStat: function () {
			if (!this.footer || !this.footer.length || !this.options.statTemplate) {
				return;
			}

			var self = this,
				classPrefix = "." + self.widgetFullName + "-",
				statRefresh = function () {
					self.stat
						.show()
						.find(classPrefix + "offset")
						.text(self.source.offset() + 1)
						.end()
						.find(classPrefix + "limit")
						.text(Math.min(self.source.offset() + self.source.limit(), self.source.total()))
						.end()
						.find(classPrefix + "total")
						.text(self.source.total());
				};

			this.stat = $($.fc.tmpl(this.options.statTemplate, this))
				.appendTo(this.footer);

			if (!this.data()) {
				this.stat.hide();
			}

			this.source.offset.bind("change", function () { statRefresh(); });
			this.source.limit.bind("change", function () { statRefresh(); });
			this.source.total.bind("change", function () { statRefresh(); });
		},

		sort: function (column, property, direction) {
			var sortParams = [{ property: property, direction: direction }];

			if (this._trigger("beforesort", null, column, property, direction) === false) {
				return;
			}

			this.source.sort(sortParams);
		},

		widget: function () {
			return this.container;
		}
	});
})(jQuery);