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

		load: function (values) {
			this._base.load.call(this, values);

			if (this.activities) {
				this.activities.empty();

				if (values.activities) {
					var activities = values.activities.split(",");
					for (var i = 0; i < activities.length; i++) {
						this._addActivity(activities[i]);
					}
				}
			}
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

			reportTemplateName: "<% var activities = filters.activities.split(','); for (var i = 0; i < activities.length; i++) { %><%=i > 0 ? ', ' : ''%><%=widget.options.actions[Number(activities[i])]%><% } %> since <%=filters.fromDate%><%=filters.toDate ? ' till ' + filters.toDate : ''%>",
			filterClassName: "fc.funnel.filter",

			negativeConversion: true,

			template: 	'<% var zoom = Math.min(4, (options.data.funnel.length > 1 ? options.data.funnel[0].value / options.data.funnel[1].value : 1)) * 100, prev = 1, current = 1, next = 1, value; %>' +
						'<% for (var i = 0; i < options.data.funnel.length; i++) { %>' +
							'<% current = options.data.funnel[i + (i < options.data.funnel.length - 1 ? 1 : 0)].value / options.data.funnel[0].value; %>' +
							'<% value = $.fc.format.usNumber(options.data.funnel[i].value); %>' +
							'<div class="fc-funnel-block" style="height: <%=Math.floor(current * zoom)%>px; line-height: <%=Math.floor(current * zoom)%>px; border-top-width: <%=((prev - current) * zoom / 2).toFixed(1)%>px; border-bottom-width: <%=((prev - current) * zoom / 2).toFixed(1)%>px;">' +
								'<b style="left: -<%=(0.3 * String(value).length).toFixed(1)%>em;"><%=value%></b>' +
								'<div class="fc-funnel-block-title" style="top: <%=((current - 1) * zoom / 2 - 10).toFixed(1)%>px;"><%=options.actions[Number(options.data.funnel[i].activity)]%></div>' +
							'</div>' +
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

			this.bodyWrapper = this.body
				.wrap('<div></div>')
				.parent()
				.addClass(this.widgetFullName + "-body-wrapper");

			this.dataview = new $.fc.data.view({
				remotePaging: true,
				remoteFilter: true,
				remoteSort: false,
				limit: 20,
				store: {
					read: {
						url: this.options.api.getData,
						root: "segments"
					}
				}
			});

			var self = this,
				segmentView = $('<div></div>').addClass(this.widgetFullName + "-segmentview").insertAfter(this.bodyWrapper);

			this.grid = new $.fc.grid({
					source: this.dataview,
					overlay: this.overlay,
					statTemplate: '<div class="<%=widgetFullName%>-stat">Displaying <span class="<%=widgetFullName%>-offset"><%=source.offset() + 1%></span> - <span class="<%=widgetFullName%>-limit"><%=source.offset() + source.limit()%></span></div>',
					getPager: function () {
						return new $.fc.pager({
								source: this.source,
								endLessPager: true
							});
					},
					beforerender: function () {
						if (!self.options.data) {
							return;
						}

						var i, columns = [{
									text: "Property",
									property: "property",
									sortable: false,
									css: { width: 150 }
							}];

						for (i = 0; i < self.options.data.funnel.length; i++) {
							columns.push({
								text: self.options.actions[self.options.data.funnel[i].activity],
								property: "values."+ i,
								sortable: false,
								css: { width: 215 }
							});
						}

						self.grid.columns(columns);
					},
					appendTo: segmentView
				});

			this.grid.widget().hide();

			this.gridWrapper = this.grid
				.widget()
				.wrap('<div></div>')
				.parent()
				.addClass(this.widgetFullName + "-grid-wrapper");

			this.dataview.bind("change", function (e, data) {
				if (typeof (data) !== "undefined" && data && data.length) {
					self.grid.widget().show();
				} else {
					self.grid.widget().hide();
				}
			});

			var segmentFilter = new $.fc.form.field.selectbox({
				label: "Property",
				labelStyle: null,
				placeholder: "Select property",
				options: [
					["score","score"],
					["createdate","createdate"],
					["cyear","cyear"],
					["cmonth","cmonth"],
					["cday","cday"],
					["updatedate","updatedate"],
					["uyear","uyear"],
					["umonth","umonth"],
					["uday","uday"],
					["fname","fname"],
					["lname","lname"],
					["email","email"],
					["phone1","phone1"],
					["uid","uid"],
					["ip","ip"],
					["emaildomain","emaildomain"],
					["gender","gender"],
					["birthdate","birthdate"],
					["zip","zip"],
					["city","city"],
					["country","country"],
					["areacode","areacode"],
					["phone2","phone2"],
					["tr1","tr1"],
					["tr2","tr2"],
					["tr3","tr3"],
					["tr4","tr4"],
					["tr5","tr5"],
					["cid","cid"],
					["sid","sid"],
					["lid","lid"],
					["siteid","siteid"],
					["sourcedomain","sourcedomain"],
					["code","code"],
					["actionpath","actionpath"],
					["lm1","lm1"],
					["lm2","lm2"],
					["lm3","lm3"],
					["lm4","lm4"],
					["lm5","lm5"],
					["host","host"],
					["browser","browser"],
					["osname","osname"],
					["jobcategory","jobcategory"],
					["landing","landing"],
					["emailsMasterList","emailsMasterList"],
					["productsprice","productsprice"],
					["__ahcost","__ahcost"],
					["productid","productid"]
				],
				prependTo: segmentView,
				change: function () {
					var filter = self.filter.serialize();
					filter["segment"] = this.value();

					self.dataview.filter(filter);
				}
			});

			$('<div></div>', { text: "Segment view", "class": this.widgetFullName + "-header" }).prependTo(segmentView);

			this.filter._bind('beforesubmit', function () {
				self.dataview.reset();
				self.overlay.resize();
				segmentFilter.value('');
				segmentView.hide();
			});

			this._bind('render.segmentview', function (renderSuccessful) {
				if (!renderSuccessful) {
					segmentView.hide();
				} else {
					segmentView.show();
				}
			});

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

			this.body
				.css({ width: 215 * this.options.data.funnel.length + 5 })
				.html($.fc.tmpl(this.options.template, this));

			var innerWidth = this.body.innerWidth(),
				outerWidth = this.bodyWrapper.innerWidth();

			this.grid.widget().width(innerWidth);

			var self = this,
				slider = this.element.find("." + this.widgetFullName + "-slider"),
				handleHelper = slider.find('.ui-handle-helper-parent');

			if (!slider.length) {
				slider = $('<div></div>', { "class": this.widgetFullName + "-slider"  })
					.insertBefore(this.bodyWrapper)
					.add($('<div></div>', { "class": this.widgetFullName + "-slider"  })
						.insertAfter(self.gridWrapper));

				slider.slider({
						orientation: "horizontal",
						value: 0,
						min: 0,
						step: 1,
						slide: function (event, ui) {
							self.bodyWrapper.scrollLeft(ui.value);
							self.gridWrapper.scrollLeft(ui.value);

							slider.not(this).slider("option", "value", ui.value);
						}
					})
					.wrap($('<div></div>', { "class": this.widgetFullName + "-slider-wrapper" }));

				handleHelper = slider
					.find( ".ui-slider-handle" )
					.mousedown(function() {
						slider.width(handleHelper.width());
					})
					.mouseup(function() {
						slider.width("100%");
					})
					.wrap('<div class="ui-slider-handle-wrapper"></div>')
					.parent();
			}

			if (innerWidth > outerWidth) {
				var handleWidth = outerWidth * outerWidth / innerWidth;

				slider
					.slider("option", "max", innerWidth - outerWidth)
					.slider("option", "value", 0)
					.show()
					.find('.ui-slider-handle').css({
						width: handleWidth,
						marginLeft: - handleWidth / 2
					});

				handleHelper.width( "" ).width(outerWidth - handleWidth);
			} else {
				slider.hide();
			}

			return true;
		}
	});
})(jQuery);