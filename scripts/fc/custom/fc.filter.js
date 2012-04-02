(function ($) {
	$.fc.widget("fc.filter", $.fc.form.wrapped, {
		options: {
			title: "Filters",

			method: "GET",
			dataType: "json",

			editable: true,
			editableFilters: [],
			editableTemplate: {
				field: {
					type: "hidden",
					name: "field",
					required: true
				},
				comparison: {
					placeholder: "operator",
					type: "select",
					name: "comparison",
					options: [
						["Equal", "eq"],
						["Not Equal", "ne"],
						["Greater", "gt"],
						["Less", "lt"],
						["Greater Or Equal", "gte"],
						["Less Or Equal", "lte"],
						["Exists", "exists"],
						["Not Exists", "notexists"],
						["In", "in"],
						["Not In", "nin"],
						["Regex", "regex"],
						["Contains", "contains"],
						["Starts With", "starts"],
						["Ends With", "ends"]
					],
					required: true
				},
				value: {
					placeholder: "value",
					type: "text",
					name: "value",
					required: true
				}
			},
			editableFieldsSerializeParam: "filter",

			collapsed: false,
			animations: {
				expand: function () {
					$(this).show();
				},
				collapse: function () {
					$(this).hide();
				}
			},

			fieldSetClass: 'fc-form-fieldset fc-filter-fieldset',
			buttonSetClass: 'fc-filter-buttonset',

			beforesubmit: function () {
				$(this).data("fc-filter").overlay.resize().show();
			},

			submit: function (e, data) {
				var self = $(this).data("fc-filter");

				self.overlay.hide();

				if (!data.success) {
					return;
				}

				self._trigger("apply", null, { filters: data.request, data: data.response });
			}
		},

		_create: function () {
			$.fc.form.wrapped.prototype._create.call(this);

			var self = this;

			this.container
				.addClass(this.widgetBaseClass)
				.wrapInner('<div class="fc-filter-body"></div>');

			this.body = this.container.children('.fc-filter-body');

			var title = this.element.attr('title');
			if (typeof (title) !== "string") {
				title = "";
			}

			this.header = $("<div></div>", { "class": "fc-filter-header" }).disableSelection();

			this.title = $('<span></span>', {
					"text": self.options.title || title,
					"class": "fc-filter-title"
				})
				.click(function (e) {
					self.toggleView.apply(self, arguments);
					return false;
				})
				.appendTo(this.header);

			this.toggle = $('<a></a>', {
					"href": "#",
					"html": '<span class="ui-icon ui-icon-triangle-1-n"/>',
					"class": "fc-filter-toggle"
				})
				.appendTo(this.header)
				.click(function (e) {
					self.toggleView.apply(self, arguments);
					return false;
				});

			this.header.prependTo(this.container);

			if (this.options.collapsed) {
				this.options.collapsed = false;
				this.toggleView(true);
			}

			this.overlay = this.options.overlay || new $.fc.overlay({ parent: this.container });
		},

		_createEditableField: function (rawValue, values) {
			var self = this,
				template = rawValue.setup;

			values = values || {};

			if (typeof (template) === "undefined" || !template) {
				template = $.extend(true,
					{},
					self.options.editableTemplate,
					{
						field: {
							value: rawValue.value
						},
						comparison: {
							label: rawValue.text
						}
					}
				);
			} else {
				template = $.extend(true,
					{
						field: {
							type: "hidden",
							name: "field",
							required: true,
							value: rawValue.value
						}
					},
					template
				);
			}

			template = $.map(template, function (value, name) {
				if (typeof (values[name]) !== "undefined") {
					value.value = values[name];
				}
				return value;
			});

			template.push({
				type: "plain",
				html: '<a href="#" class="ui-widget fc-form-field ui-corner-all fc-filter-remove"><span class="ui-icon ui-icon-closethick">close</span></a>',
				click: function (e) {
					var remover = $(this);

					$.fc.dialog.confirm("Filter removing", "Are you sure you want to delete this filter?", function (ok) {
						if (!ok) {
							return;
						}

						remover.closest('.fc-filter-fieldset').remove();
					});

					e.preventDefault();
				},
				mouseenter: function () {
					$(this).addClass('ui-state-hover');
				},
				mouseleave: function () {
					$(this).removeClass('ui-state-hover');
				}
			});

			this._renderFields(template)
				.appendTo(this.editableFields);
		},

		_loadEditables: function (values) {
			var i, fieldName, options;

			for (i = 0; i < values.length; i++) {
				fieldName = values[i].field;
				if (typeof (fieldName) === "undefined") {
					continue;
				}

				options = this.options.editableFilters[fieldName];

				this._createEditableField(options, values[i]);
			}
		},

		_render: function () {
			$.fc.form.wrapped.prototype._render.call(this);

			var self = this;

			if (this.options.editable && this.options.editableFilters.length) {
				this.editableFields = $('<div></div>', { "class": "fc-form-fieldset fc-filter-editable-fields" })
					.insertAfter(this.element)
					.sortable();

				var selector = new $.fc.form.field.selectbox({
						labelStyle: null,
						name: "reportType",
						type: "select",
						placeholder: "+ Add filter",
						css: { width: 227, "background-color": "#F7F7F7" },
						options: $.extend({
								map: function (item) {
									if (typeof (item.setup) !== undefined && $.isArray(item.setup)) {
										item.setup = $.fc.toObject(item.setup, function (value) {
											this[value.name] = value;
										});
									}
									return  $.isArray(item) ?
										[ item ] :
										item;
								}
							},
							$.isArray(this.options.editableFilters) ?
								{ predefinedData: this.options.editableFilters } :
								this.options.editableFilters
						),
						change: function () {
							self._createEditableField(this.rawValue());
							this.value("");
						}
					}, $("<select></select>")
					.insertAfter(this.editableFields));

				this.options.editableFilters = selector.options.options;
			}
		},

		_serialize: function (preventEncodeNested) {
			var field,
				editableFieldsSerializeParam = this.options.editableFieldsSerializeParam,
				result = {};

			preventEncodeNested = !!preventEncodeNested;

			this.element.find(':input').not('button').each(function () {
				field = $(this).data('fcFieldWidget');
				if (!field) {
					return;
				}

				if (typeof (result[field.name]) === "undefined") {
					result[field.name] = field.value();
				} else if ($.isArray(result[field.name])) {
					result[field.name].push(result[field.name]);
				} else {
					result[field.name] = [ result[field.name], field.value() ];
				}
			});

			if (this.options.editable && this.editableFields) {
				result[editableFieldsSerializeParam] = [];
				var filterValue;

				this.editableFields.children('.fc-filter-fieldset').each(function () {
					filterValue = {};
					$(this).find(':input').not('button').each(function () {
						field = $(this).data('fcFieldWidget');
						if (!field) {
							return;
						}

						filterValue[field.name] = field.value();
					});

					result[editableFieldsSerializeParam].push(filterValue);
				});

				if (!preventEncodeNested) {
					result.filter = JSON.stringify(result[editableFieldsSerializeParam]);
				}
			}

			return result;
		},

		_destroy: function () {
			this.overlay._destroy();

			this.element.unwrap();

			delete this.body;

			$.fc.form.wrapped.prototype._destroy.call(this);
		},

		load: function (values) {
			if (typeof (values) === "undefined" || !values) {
				values = {};
			}

			var field, fieldName, fieldValue;

			this.element.find(':input').each(function () {
				field = $(this).data('fcFieldWidget');
				if (!field) {
					return;
				}

				field.reset();
			});

			if (this.editableFields) {
				this.editableFields.empty();
			}

			for (fieldName in values) {
				fieldValue = values[fieldName];

				if (fieldName === this.options.editableFieldsSerializeParam && this.editableFields && $.fc.isJSON(fieldValue)) {
					this._loadEditables(JSON.parse(fieldValue));
					continue;
				}

				field = this.getField(fieldName);

				if (!field) {
					continue;
				}

				field.value(values[fieldName]);
			}
		},

		toggleView: function (preventAnimation) {
			var tool = this.toggle.find('.ui-icon');

			if (!!this.options.collapsed) {
				this.options.collapsed = false;
				if (!preventAnimation) {
					this.options.animations.expand.call(this.body[0]);
				} else {
					this.body.show();
				}
				tool.removeClass('ui-icon-triangle-1-n').addClass('ui-icon-triangle-1-s');
			} else {
				this.options.collapsed = true;
				if (!preventAnimation) {
					this.options.animations.collapse.call(this.body[0]);
				} else {
					this.body.hide();
				}
				tool.removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-n');
			}
		},

		valid: function () {
			var field, result = $.fc.form.prototype.valid.call(this);

			if (this.editableFields) {
				this.editableFields.find(':input').not('button').each(function () {
					field = $(this).data('fcFieldWidget');
					if (!field) {
						return;
					}

					if (!field.valid()) {
						result = false;
					}
				});
			}

			return result;
		}
	});
})(jQuery);