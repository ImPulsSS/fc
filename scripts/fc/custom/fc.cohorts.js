(function ($) {
	$.fc.widget("fc.cohorts", $.fc.reportpanel, {
		options: {
			api: {
				getData: "",
				getLeads: "",

				leadDetails: "",

				getReports: "",
				saveReport: "",
				removeReport: "",

				getActions: ""
			},
			tooltipDelay: 300,
			reportTemplateName: "<%=widget.options.actions[filters.activity1]%>/<%=widget.options.actions[filters.activity2]%> since <%=filters.fromDate%><%=filters.toDate ? ' till ' + filters.toDate : ''%>",
			maxDifference: 12,
			reportType: 1,
			template:
				'<thead>' +
					'<tr>' +
						'<th colspan="2" class="fc-cohorts-header-1 fc-cohorts-activity1"><b><%=(options.actions[options.filter.activity1] || options.filter.activity1)%></b></th>' +
						'<th colspan="13" class="fc-cohorts-header-1 fc-cohorts-activity2"><b><%=(options.actions[options.filter.activity2] || options.filter.activity2)%></b> by <%=options.filter.activity2Buckets%></th>' +
					'</tr>' +
					'<tr>' +
						'<th class="fc-cohorts-title fc-cohorts-header-2">Time</th>' +
						'<th class="fc-cohorts-total fc-cohorts-header-2">People</th>' +
						'<% for (var i = 1; i <= options.maxDifference + 1; i++) { %>' +
							'<th class="fc-cohorts-header-2 fc-cohorts-col-<%=i%>"><%=(i < 13 ? i : ">" + (i - 1))%></th>' +
						'<% } %>' +
					'</tr>' +
				'</thead>' +
				'<tbody>' +
					'<% for (var i = 0; i < options.data.data.length; i++) { %>' +
					'<tr>' +
						'<th class="fc-cohorts-title fc-cohorts-header-2 fc-cohorts-row-<%=(i + 1)%>"><%=options.data.data[i].title%></th>' +
						'<th class="fc-cohorts-total fc-cohorts-header-2 fc-cohorts-row-<%=(i + 1)%>"><%=$.fc.format.usNumber(options.data.data[i].total)%></th>' +
						'<% var cellValue; %>' +
						'<% for (var j = 1; j <= options.maxDifference + 1; j++) { %>' +
							'<% cellValue = _getCellValue(i, options.data.data[i].diffs[j]); %>' +
							'<td data-date="<%=$.fc.format.jsonDate(options.data.data[i].date, "m/d/yyyy")%>" data-title="<%=options.data.data[i].title%>" data-difference="<%=j%>" data-units="<% switch (options.filter.activity2Buckets) { case "Days": p.push("day"); break; case "Weeks":  p.push("week"); break; case "Months":  p.push("month"); break; } %>" data-absolute="<%=_getFormattedValue(cellValue, options.data.data[i].total, options.reportType > 1 ? 2 : 0)%>" data-relative="<%=_getFormattedValue(cellValue, options.data.data[i].total, options.reportType > 1 ? 3 : 1)%>" class="fc-cohorts-value fc-cohorts-row-<%=(i + 1)%> fc-cohorts-col-<%=j%>">' +
								'<div class="fc-cohorts-value-inner" <%=_getCellStyle(cellValue, options.data.data[i].total)%>><%=_getFormattedValue(cellValue, options.data.data[i].total)%></div>' +
							'</td>' +
						'<% } %>' +
					'</tr>' +
					'<% } %>' +
				'</tbody>',
			leadsCaptionTemplate: 'People who did <%=(options.actions[options.filter.activity2] || options.filter.activity2)%> <% if (difference === 1 || options.reportType > 1) { %>within <%=difference%><% if (difference > options.maxDifference) { %> or more<% }%> <%=units%><%=difference > 1 ? "s" : ""%><% } else if (difference > options.maxDifference) { %>at or after <%=difference%> <%=units%><%=difference > 1 ? "s" : ""%><% } else { %>between <%=difference-1%>-<%=difference%> <%=units%>s<% } %> of doing <%=(options.actions[options.filter.activity1] || options.filter.activity1)%> at <%=title%>',
			tooltipTemplate: '<b><%=title%></b><br>' +
				'<%=relative%> (<%=absolute%> peolpe) did <%=(options.actions[options.filter.activity2] || options.filter.activity2)%> <% if (difference === 1 || options.reportType > 1) { %>within <%=difference%><% if (difference > options.maxDifference) { %> or more<% }%> <%=units%><%=difference > 1 ? "s" : ""%><% } else if (difference > options.maxDifference) { %>at or after <%=difference%> <%=units%><%=difference > 1 ? "s" : ""%><% } else { %>between <%=difference-1%>-<%=difference%> <%=units%>s<% } %> of doing <%=(options.actions[options.filter.activity1] || options.filter.activity1)%><br>' +
				'<a href="#<%=date%>__<%=difference%><%=units%>" data-action="viewleads">View leads</a>'
		},

		_create: function () {
			if (typeof (this.options.fields) === "undefined") {
				this.options.fields = [
					[{
							label: "Activity 1",
							name: "activity1",
							type: "select",
							placeholder: "Select activity",
							options: {
								url: this.options.api.getActions,
								root: "actions",
								map: [
									{ name: "value", mapping: "id" },
									{ name: "text", mapping: "title" }
								]
							},
							required: true
						}, {
							label: "by",
							labelStyle: {
								"display": "inline-block",
								"min-width": 14
							},
							name: "activity1Buckets",
							type: "select",
							options: [ "Days", "Weeks", "Months" ],
							required: true
						}
					], [{
							label: "Activity 2",
							name: "activity2",
							type: "select",
							placeholder: "Select activity",
							options: {
								url: this.options.api.getActions,
								root: "actions",
								map: {
									id: "value",
									title: "text"
								}
							},
							required: true
						}, {
							label: "by",
							labelStyle: {
								"display": "inline-block",
								"min-width": 14
							},
							name: "activity2Buckets",
							type: "select",
							options: [ "Days", "Weeks", "Months" ],
							required: true
						}
					], [{
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

			this._base._create.apply(this, arguments);

			this.overlay.resize().show();

			var self = this;

			this.dataview = new $.fc.data.view({
				remotePaging: true,
				remoteFilter: true,
				remoteSort: false,
				limit: 20,
				store: {
					read: {
						url: this.options.api.getLeads,
						root: "leads",
						map: {
							"_id": "_id",
							"cdate": { name: "cdate", format: $.fc.format.jsonDate },
							"fname": "fname",
							"lname": "lname",
							"email": "email",
							"ip": "ip"
						}
					}
				}
			});

			this.grid = new $.fc.grid({
				source: this.dataview,
				overlay: this.overlay,
				css: { width: "100%" },
				captionClass: this.widgetFullName + "-header",
				columns: [{
					text: "Uid",
					property: "_id",
					sortable: false,
					cellTemplate: '<div class="{0}-cell-inner{3}"><a href="' + self.options.api.leadDetails + '<%=$.fc.data.getField(row, {2})%>"><%=$.fc.data.getField(row, {2})%></a></div>'
				}, {
					text: "Create date",
					property: "cdate"
				}, {
					text: "First name",
					property: "fname",
					sortable: false
				}, {
					text: "Last name",
					property: "lname",
					sortable: false
				}, {
					text: "Email",
					property: "email"
				}, {
					text: "Ip",
					property: "ip",
					sortable: false
				}],
				statTemplate: '<div class="<%=widgetFullName%>-stat">Displaying <span class="<%=widgetFullName%>-offset"><%=source.offset() + 1%></span> - <span class="<%=widgetFullName%>-limit"><%=source.offset() + source.limit()%></span></div>',
				getPager: function () {
					return new $.fc.pager({
							source: this.source,
							endLessPager: true
						});
				},
				rowdblclick: function (e, record) {
					document.location.href = self.options.api.leadDetails + record._id;
				},
				appendTo: this.element
			});

			this.grid.widget().hide();

			this.filter._bind('beforesubmit', function () {
				self.dataview.reset();
			});

			this.dataview.bind("change", function (e, data) {
				if (typeof (data) !== "undefined" && data && data.length) {
					self.grid.widget().show();
				} else {
					self.grid.widget().hide();
				}
			});

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

		_addBody: function () {
			this.body = $('<table></table>', { "cellspacing": 1, "cellpadding": 0, "class": this.widgetFullName + "-body" })
				.appendTo(this.element)
				.hide();

			this._bindActions();
		},

		_bindActions: function () {
			var self = this,
				timer = null;

			this.body.on("mouseenter." + this.widgetName, '.fc-cohorts-value', function (e) {
					var td = this,
						$td = $(td),
						cross = $.map($td.attr('class').split(' '), function (value) {
							if (value.indexOf('fc-cohorts-col-') !== 0 && value.indexOf('fc-cohorts-row-') !== 0)
								return null;

							return "." + value;
						})
						.join(',');

					self.body.find(cross)
						.addClass('selected');

					if ($td.data('absolute')) {
						timer = setTimeout(function () {
							var tooltip = $td.find('.fc-tooltip'),
								align = $td.data('difference') > 5 ? "fc-tooltip-right" : "",
								data = {
									title: $td.data('title'),
									date: $td.data('date'),
									absolute: $td.data('absolute'),
									relative: $td.data('relative'),
									difference: $td.data('difference'),
									units: $td.data('units'),
									options: self.options
								};

							if (!tooltip.length) {
								tooltip = $('<div></div>', {
										"class": "fc-tooltip" + " " + align,
										css: { opacity: 0, zIndex: -1 }
									})
									.appendTo(td);
							}

							tooltip
								.html($.fc.tmpl(self.options.tooltipTemplate, data))
									.find('a[data-action="viewleads"]').click(function (e) {
										self.grid.caption($.fc.tmpl(self.options.leadsCaptionTemplate, data));
										self.dataview.filter($.extend({}, self.options.filter, { date: data.date, difference: data.difference }));
										e.preventDefault();
									})
									.end()
								.css({ height: tooltip.height() }) // strange opera bug fix
								.position({
									of: td,
									my: align === "fc-tooltip-right" ? "right bottom" : "left bottom",
									offset: "0 -15",
									at: align === "fc-tooltip-right" ? "right top" : "left top",
									collision: "flip flip"
								})
								.css({ zIndex: 20 })
								.animate({ opacity: 1, top: "+=15" }, 200);
						}, self.options.tooltipDelay);
					}
				})
				.on("mouseleave." + this.widgetName, '.fc-cohorts-value', function () {
					self.body
						.find('.selected').removeClass('selected').end()
						.find('.fc-tooltip').css({ opacity: 0, zIndex: -1 });

					if (timer) {
						clearTimeout(timer);
					}
				});
		},

		_getMaxValue: function () {
			this.options.maxValue = 0;
			var i, j, diffs;
			
			for (i = 0; i < this.options.data.data.length; i++) {
				diffs = this.options.data.data[i].diffs;
				for (j in diffs) {
					if (diffs[j] > this.options.maxValue) {
						this.options.maxValue = diffs[j];
					}
				}
			}
		},

		_getCellStyle: function (value) {
			if (typeof (value) === "undefined" || !value) {
				return ' style="background-color: #F0F0F0;"';
			}

			var percentage = Math.max(1 - Number(value) * 3 / this.options.maxValue, 0);
			if (percentage > 0.9) {
				percentage -= 0.1;
			} else if (percentage > 0.8) {
				percentage -= 0.05;
			}

			var hex = Math.floor(percentage*255).toString(16);

			return $.fc.stringBuilder.format(' style="background-color: rgba(240, 240, 240, {0}); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#{1}F0F0F0,endColorstr=#{1}F0F0F0);"', percentage.toFixed(2), hex.length === 1 ? "0" + hex : hex);
		},

		_getFormattedValue: function (value, total, type) {
			if (!value) {
				return typeof(type) !== "undefined" ? null : "-";
			}
			if (typeof(type) === "undefined") {
				type = this.options.reportType;
			}

			return type === 1 || type === 3 ?
				(value * 100 / total).toFixed(1) + '%' : 
				$.fc.format.usNumber(value);
		},
		
		_getCellValue: function (hash, value) {		
			this.cumulativeValues[hash] = ~~this.cumulativeValues[hash] + ~~value;
			
			return this.options.reportType > 1 ?
					this.cumulativeValues[hash] :
					value;
		},

		_render: function () {
			if (this._base._render.call(this) === false) {
				return;
			}

			var self = this;

			if (!this.options.data.success || !$.isArray(this.options.data.data) || this.options.data.data.length === 0) {
				this.header.text("No results found.");
				return;
			}

			this._getMaxValue();

			this.header.text((this.options.actions[this.options.filter.activity1] || this.options.filter.activity1) +
				(this.options.filter.toDate ?
					" between " + this.options.filter.fromDate + " and " + this.options.filter.toDate :
					" after " + this.options.filter.fromDate));

			if (!this.toolbar) {
				this.toolbar = $('<div></div>', { "class": "fc-cohorts-toolbar" })
					.insertAfter(this.body);

				new $.fc.form.field.selectbox({
					label: "Display",
					labelStyle: null,
					name: "reportType",
					type: "select",
					css: { width: 225 },
					options: [{
							text: "Number of people", value: 0
						}, {
							text: "Percentage of people", value: 1
						}, {
							text: "Cumulative number of people", value: 2
						}, {
							text: "Cumulative percentage of people", value: 3
						}
					],
					value: this.options.reportType,
					appendTo: this.toolbar,
					change: function () {
						self.options.reportType = Number(this.value());
						self.dataview.reset();
						self._callMethod("_render");
					}
				});
			} else {
				this.toolbar.show();
			}

			this.cumulativeValues = {};

			this.body.html($.fc.tmpl(this.options.template, this));
		}
	});
})(jQuery);