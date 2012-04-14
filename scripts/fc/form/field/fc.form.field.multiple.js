(function ($) {
	$.fc.widget("fc.form.field.multiple", $.fc.form.field, {
		defaultElement: '<select multiple>',

		options: {
			searchable: true,
			removeSelectedFromAvailable: true,

			source: [],
			autoRefresh: true,

			template:
				'<div class="ui-widget-content ui-corner-all">' +
					'<table class="<%=widgetFullName%>-container">' +
						'<tr>' +
							'<td>' +
								'<div class="ui-widget-header ui-corner-all"><%=options.i18n.available%>' +
								'<% if (options.searchable) {%><input type="text" placeholder="filter" class="<%=widgetFullName%>-search ui-corner-all"><span class="ui-icon ui-icon-search"></span><%}%></div>' +
								'<ul class="<%=widgetFullName%>-from ui-state-default ui-corner-all" data-accept="selected" data-scope="available"></ul>' +
							'</td>' +
							'<td class="<%=widgetFullName%>-controls">' +
								'<button data-action="select-all" data-icon="ui-icon-seek-end"><%=options.i18n.selectAll%></button>' +
								'<button data-action="select" data-icon="ui-icon-seek-next"><%=options.i18n.select%></button>' +
								'<button data-action="remove" data-icon="ui-icon-seek-prev"><%=options.i18n.remove%></button>' +
								'<button data-action="remove-all" data-icon="ui-icon-seek-start"><%=options.i18n.removeAll%></button>' +
							'</td>' +
							'<td>' +
								'<div class="ui-widget-header ui-corner-all"><%=options.i18n.selected%></div>' +
								'<ul class="<%=widgetFullName%>-to ui-state-default ui-corner-all" data-accept="available" data-scope="selected"></ul>' +
							'</td>' +
						'</tr>' +
					'</table>' +
				'</div>',

			optionsTemplate:
				'<%for (var i = 0; i < options.length; i++) {%>' +
					'<option value="<%=options[i].value%>"><%=options[i].text%></option>' +
				'<%}%>',

			i18n: {
				available: "Available",
				selected: "Selected",
				selectAll: "Select All",
				select: "Select",
				removeAll: "Remove All",
				remove: "Remove"
			}
		},

		_destroy: function () {
			if (this.overlay) {
				this.overlay.destroy();
			}

			if (this.label) {
				this.label.remove();
				delete this.label;
			}

			if (this.container) {
				this.container.remove();
				delete this.container;
				delete this.availableList;
				delete this.selectedList;
				delete this.controls;
			}

			this.element
				.unwrap()
				.show();

			delete this.selected;
			delete this.available;

			if (!this.externalSource) {
				this.source.destroy();
			}
		},

		_init: function () {
			$.fc.form.field.prototype._init.call(this);

			var self = this,
				data = this.element
					.find('option')
					.each(function () {
						$(this).attr("value", this.value);
					})
					.map(function (index, option) {
						return { text: option.innerHTML, value: option.value };
					})
					.get();

			if (this.options.source !== null && this.options.source.widgetName === "fcDataView") {
				this.source = this.options.source;
				this.externalSource = true;
				if (this.options.autoRefresh) {
					this.source.refresh();
				}
			} else {
				var sourceOptions = {
						localFilter: function (data, filter) {
							var pattern = new RegExp(filter, 'i');
							return $.grep(data, function (record) {
									return pattern.test(record.text);
								});
						},
						data: $.isArray(this.options.source) ? $.merge(data, this.options.source) : data
					};

				this.source = new $.fc.data.view(
						$.isPlainObject(this.options.source) ?
							$.extend(true, sourceOptions, this.options.source) :
							sourceOptions
					);
			}

			this.available = new $.fc.observableArray(!this.externalSource ? sourceOptions.data : []);
			var value = this.options.value || this.element.val();
			this.selected = new $.fc.observableArray($.grep(this.available(), function (record) {
					return $.inArray(record.value, value) > -1;
				}));

			this.selected.change(function (e, records) {
				self.element.find('option').removeAttr("selected");

				$.each(records, function (index, record) {
					self.element
						.find('option[value="' + record.value + '"]')
						.attr('selected', true);
				});

				self.selectedList.empty();

				$.each(records, function (index, record) {
					$('<li></li>', { text: record.text, "class": "ui-state-default ui-corner-all" })
						.appendTo(self.selectedList)
						.data('record', record);
				});

				if (self.options.removeSelectedFromAvailable) {
					self.available.trigger();
				}
			});

			this.available.change(function (e, records) {
				self.availableList.empty();

				if (self.options.removeSelectedFromAvailable) {
					records = $.grep(records, function (record) {
						return self.selected.indexOf(record) === -1;
					});
				}

				$.each(records, function (index, record) {
					$('<li></li>', { text: record.text, "class": "ui-state-default ui-corner-all" })
						.appendTo(self.availableList)
						.data('record', record);
				});
			});

			this.selected.trigger();
			if (!this.options.removeSelectedFromAvailable) {
				this.available.trigger();
			}

			this.source._bind({
				change: function (records) {
					self.element
						.html($.fc.tmpl(self.options.optionsTemplate, { options: records }));

					self.selected.trigger();

					self.available.replaceAll(records);
				},
				beforerefresh: function () {
					if (self.overlay) {
						self.overlay.resize().show();
					}
				},
				refresh: function () {
					if (self.overlay) {
						self.overlay.hide();
					}
				}
			});
		},

		_getRecords: function (items) {
		    return items.map(function (index, item) {
					return $(item).data('record');
				})
				.get();
		},

		_initList: function (list) {
			var self = this,
				makeDraggable = function (items) {
					$(items).draggable({
							scope: list.data("scope"),
							revert: 'invalid',
							cursor: 'move',
							cursorAt: {
								left: 0,
								top: 0
							},
							distance: 30,
							helper: function () {
								var $this = $(this);
								if (!$this.hasClass("ui-selected")) {
									$this.addClass('ui-selected').siblings('li').removeClass('ui-selected');
								}

								return $('<div></div>', { "class": "ui-state-highlight ui-corner-all" })
									.append($this.siblings('.ui-selected').andSelf().clone());
							},
						    stop: function () {
								$(items).draggable("destroy");
							}
						});
				};

			list
				.disableSelection()
				.droppable({
					scope: list.data("accept"),
					activeClass: "ui-state-highlight",
					drop: function (e, ui) {
						var items = ui.draggable.add(ui.draggable.siblings(".ui-selected")),
							records = self._getRecords(items);

						items.bind("dragstop", function () {
							if (list.data('scope') === "selected") {
								self.select(records);
							} else {
								self.remove(records);
							}
						});
					}
				})
				.selectable({
					stop: function () {
						makeDraggable(list.children(".ui-selected"));
					}
				})
				.on("click." + this.widgetFullName, "li", function (e) {
					var $this = $(this),
						current = list.data('current');

					if (typeof (current) === "undefined" || !current || !current.length) {
						current = list.children("li").first();
					}

					if (e.ctrlKey) {
						$this.toggleClass('ui-selected');
					} else if (e.shiftKey) {
						var direction = current.index() <  $this.index(),
							items = current[direction ? "nextUntil" : "prevUntil"](this);

						items = items.add($this);

						if (current[direction ? "next" : "prev"]().hasClass('ui-selected')) {
							items = items.add(current);
						}

						items.toggleClass('ui-selected');
					} else {
						$this.addClass('ui-selected').siblings('li').removeClass('ui-selected');
					}

					$this.parent().focus();
					list.data('current', $this);

					makeDraggable(this);
				})
				.on("dblclick." + this.widgetFullName, "li", function () {
					var records = [ $(this).data('record') ];

					if (list.data('scope') === "available") {
						self.select(records);
					} else {
						self.remove(records);
					}
				})
				.on(($.browser.opera ? "keypress." : "keydown.") + this.widgetFullName, function (e) {
					if (e.ctrlKey && e.keyCode === 65) {
						$(this).children('li').addClass("ui-selected");
						e.preventDefault();
					}

					if (e.shiftKey) {
						var $this,
							list = $(this),
							current = list.data('current');

						switch (e.keyCode) {
							case 37:
							case 38:
								$this = current.prev();
								break;
							case 39:
							case 40:
								$this = current.next();
								break;
						}

						if (typeof ($this) !== "undefined" && $this && $this.length) {
							if ($this.hasClass("ui-selected")) {
								current.toggleClass("ui-selected");
							} else {
								$this.toggleClass("ui-selected");
							}

							list.data('current', $this);
							e.preventDefault();
						}
					}
				})
				.on("mouseenter." + this.widgetFullName, "li", function (e) {
					$(this).addClass("ui-state-hover");
				})
				.on("mouseleave." + this.widgetFullName, "li", function (e) {
					$(this).removeClass("ui-state-hover");
				});
		},

		_initControls: function () {
			var self = this;

			this.controls
				.on("click." + this.widgetFullName, function (e) {
					switch ($(this).data('action')) {
						case "select-all":
							self.select(self._getRecords(self.availableList.children("li")));
							break;
						case "select":
							self.select(self._getRecords(self.availableList.children(".ui-selected")));
							break;
						case "remove-all":
							self.remove(self._getRecords(self.selectedList.children("li")));
							break;
						case "remove":
							self.remove(self._getRecords(self.selectedList.children(".ui-selected")));
							break;
					}
				})
				.each(function () {
					var $this = $(this),
						icon = $this.data('icon');

					$this.button({
							text: false,
							icons: {
								primary: icon
							}
						});
				});
		},

		_render: function () {
			if (this.options.decorate) {
				var self = this;

				this.element.wrap("<div></div>");

				this.wrapper = this.element.parent().addClass(this.widgetBaseClass);

				this.overlay = new $.fc.overlay(this.wrapper);

				if (this.options.label) {
					this.label = $("<label></label>", { "text": this.options.label})
						.css(this.options.labelStyle || {})
						.prependTo(this.wrapper);
				}

				this.element
					.hide();

				this.container = $($.fc.tmpl(this.options.template, this))
					.insertAfter(this.element);

				this.availableList = this.container
					.find("." + this.widgetFullName + "-from");

				this.selectedList = this.container
					.find("." + this.widgetFullName + "-to");

				this._initList(this.availableList);
				this._initList(this.selectedList);


				this.controls = this.container
					.find("." + this.widgetFullName + "-controls button");

				this._initControls();

				this.search = this.container
					.find("." + this.widgetFullName + "-search")
					.on(($.browser.opera ? "keypress." : "keydown.") + this.widgetFullName, function (e) {
						if (e.keyCode === 13) {
							self.source.filter(this.value);
							e.preventDefault();
						}
					});

				this.container
					.find(".ui-icon-search")
					.bind("click." + this.widgetFullName, function () {
						self.source.filter(self.search.val());
					});
			}
		},

		_setOptions: function() {
			this._base._setOptions.apply(this, arguments);
		},

		_setOption: function(key, value) {
			this._base._setOption.apply(this, key, value);
		},

		select: function (records) {
			var self = this;
			this.selected.push.apply(this.selected, $.grep(records, function (record) {
					return self.selected.indexOf(record) < 0;
				}));
		},

		remove: function (records) {
			this.selected.removeAll(records);
		},

		value: function () {
			var value = $.map(arguments, function (value) { return value; });

			this._base.value.apply(this, value);

			if (arguments.length) {
				this.select($.grep(this.available(), function (record) {
					return $.inArray(record.value, value) > -1;
				}));
			}
		}
	});
})(jQuery);