(function ($) {
	$.fc.widget("fc.funnel.filter", $.fc.filter, {
		_addActivity: function (value) {
			var self = this;

			this._renderFields([{
				    label: 'Activity ' + (this.activities.children().length + 1),
					placeholder: 'Select activity',
					type: 'select',
					source: this.options.activitiesFilters,
					value: value,
					css: { width: 250 },
					required: true
				}, {
					type: "plain",
					html: '<a href="#" class="ui-widget fc-form-field ui-corner-all fc-filter-remove"><span class="ui-icon ui-icon-closethick">close</span></a>',
					click: function (e) {
						var remover = $(this);

						if (self.activities.children().length === 1) {
							$.fc.dialog.alert("Activity removing", "Report need at least one action selected");
						} else {
							$.fc.dialog.confirm("Activity removing", "Are you sure you want to delete this action?", function (ok) {
								if (!ok) {
									return;
								}

								remover.closest('.fc-filter-fieldset').remove();
							});
						}

						e.preventDefault();
					},
					mouseenter: function () {
						$(this).addClass('ui-state-hover');
					},
					mouseleave: function () {
						$(this).removeClass('ui-state-hover');
					}
				}])
				.appendTo(this.activities);
		},

		_render: function () {
			this._base._render.call(this);

			var self = this;

			this.activities = $('<div></div>', { "class": "fc-form-fieldset fc-filter-editable-fields" })
				.insertBefore(this.element)
				.sortable({
					stop: function () {
						self.activities.find('label').each(function (index) {
							$(this).text('Activity ' + (index + 1));
						});
					}
				});

			this._addActivity('');

			new $.fc.form.field.selectbox({
					labelStyle: null,
					name: "activitySelector",
					type: "select",
					placeholder: "+ Add new activity",
					css: { width: 227, "background-color": "#F7F7F7" },
					source: this.options.activitiesFilters,
					change: function () {
						self._addActivity(this.value());
						this.value("");
					},
					insertAfter: this.activities
				});

			this.overlay.resize();
		},

		_serialize: function (preventEncodeNested) {
			var field, result = this._base._serialize.call(this);

			if (this.activities) {
				result.activities = [];

				this.activities.find(':input').not('button').each(function () {
					field = $(this).data('fcFieldWidget');
					if (!field) {
						return;
					}

					result.activities.push(field.value());
				});

				if (!preventEncodeNested) {
					result.activities = result.activities.join(',');
				}
			}

			return result;
		},

		valid: function () {
			var field, result = this._base.valid.call(this);

			if (this.activities) {
				this.activities.find(':input').not('button').each(function () {
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

	$.fc.widget("fc.funnel", $.fc.reportpanel, {
		options: {
			api: {
				getData: "",

				getActions: "",

				getReports: "",
				saveReport: "",
				removeReport: ""
			},

			reportTemplateName: "тест",
			filterClassName: "fc.funnel.filter",

			negativeConversion: true,

			template: 	'<% var zoom = Math.min(4, (options.data.funnel.length > 1 ? options.data.funnel[0].value / options.data.funnel[1].value : 1)) * 100, prev = 1, current = 1, next = 1, value; %>' +
						'<% for (var i = 0; i < options.data.funnel.length; i++) { %>' +
							'<% current = options.data.funnel[i + (i < options.data.funnel.length - 1 ? 1 : 0)].value / options.data.funnel[0].value; %>' +
							'<% value = $.fc.format.usNumber(options.data.funnel[i].value); %>' +
							'<div class="fc-funnel-block" style="height: <%=Math.floor(current * zoom)%>px; line-height: <%=Math.floor(current * zoom)%>px; border-top-width: <%=((prev - current) * zoom / 2).toFixed(1)%>px; border-bottom-width: <%=((prev - current) * zoom / 2).toFixed(1)%>px;"><b style="left: -<%=0.3 * String(value).length%>em;"><%=value%></b></div>' +
							'<% if (i < options.data.funnel.length - 1) { %>' +
								'<div class="fc-funnel-separator"><%=((options.data.funnel[i + 1].value / options.data.funnel[i].value - (options.negativeConversion ? 1 : 0)) * 100).toFixed(1)%>%</div>' +
							'<% } %>' +
							'<% prev = current; %>' +
						'<% } %>' +
						'<div class="fc-funnel-final"><%=(current * 100).toFixed(1)%>%</div>',

			preloadfilters: function (e, widget) {
				return false;
			}
		},

		_create: function () {
			var self = this;

			if (!this._trigger("preloadfilters", null, this)) {
				if (typeof (this.options.fields) === "undefined") {
					this.options.activitiesFilters = {
						store: {
							read: {
								url: this.options.api.getActions,
								root: "actions",
								map: [
									{ name: "value", mapping: "id" },
									{ name: "text", mapping: "title" }
								]
							}
						}
					};

					this.options.fields = [[{
								label: "Show from",
								type: "date",
								name: "fromDate",
								required: true,
								dateRangeTo: "toDate"
							}, {
								label: "to",
								labelStyle: {
									"display": "inline-block",
									"min-width": 14
								},
								type: "date",
								name: "toDate",
								dateRangeFrom: "fromDate"
							}
						]
					];
				}
			}

			this._base._create.apply(this, arguments);

			this.overlay.resize().show();

			$.fc.data.store.current.get({
				url: this.options.api.getActions,
				root: "actions"
			}, function (data) {
				var result = {};

				$.each(data || [], function () {
					result[this.id] = this.title;
				});
				self.options.actions = result;

				self.overlay.hide();

				self._callMethod("_render");
			});
		},

		_init: function () {
			this._base._init.call(this);

			this.overlay.resize();
		},

		_render: function () {
			if (this._base._render.call(this) === false) {
				return false;
			}

			if (!this.options.data.success || !$.isArray(this.options.data.funnel) || this.options.data.funnel.length === 0) {
				this.header.text("No results found.");
				return;
			}

			this.header.text("Funnel for activity" +
				(this.options.filter.toDate ?
					" between " + this.options.filter.fromDate + " and " + this.options.filter.toDate :
					" after " + this.options.filter.fromDate));

			this.body.html($.fc.tmpl(this.options.template, this));

			return true;
		}
	});
})(jQuery);