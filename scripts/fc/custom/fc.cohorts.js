(function ($) {
	$.fc.widget("fc.cohorts", $.fc.reportpanel, {
		options: {
			api: {
				getData: "",
				
				getReports: "",
				saveReport: "",
				removeReport: "",
				
				getActions: ""
			},
			reportTemplateName: "<%=widget.options.actions[filters.activity1]%>/<%=widget.options.actions[filters.activity2]%> since <%=filters.fromDate%><%=filters.toDate ? ' till ' + filters.toDate : ''%>",
			maxDifference: 12,
			reportType: 1,
			template: 
				'<thead>\
					<tr>\
						<th colspan="2" class="fc-cohorts-header-1 fc-cohorts-activity1"><b><%=(options.actions[options.filter.activity1] || options.filter.activity1)%></b></th>\
						<th colspan="13" class="fc-cohorts-header-1 fc-cohorts-activity2"><b><%=(options.actions[options.filter.activity2] || options.filter.activity2)%></b> by <%=options.filter.activity2Buckets%></th>\
					</tr>\
					<tr>\
						<th class="fc-cohorts-title fc-cohorts-header-2">Time</th>\
						<th class="fc-cohorts-total fc-cohorts-header-2">People</th>\
						<% for (var i = 1; i <= options.maxDifference + 1; i++) { %>\
							<th class="fc-cohorts-header-2 fc-cohorts-col-<%=i%>"><%=(i < 13 ? i : ">" + (i - 1))%></th>\
						<% } %>\
					</tr>\
				</thead>\
				<tbody>\
					<% for (var i = 0; i < options.data.data.length; i++) { %>\
					<tr>\
						<th class="fc-cohorts-title fc-cohorts-header-2 fc-cohorts-row-<%=(i + 1)%>"><%=options.data.data[i].title%></th>\
						<th class="fc-cohorts-total fc-cohorts-header-2 fc-cohorts-row-<%=(i + 1)%>"><%=$.fc.format(options.data.data[i].total)%></th>\
						<% var cellValue; %>\
						<% for (var j = 1; j <= options.maxDifference + 1; j++) { %>\
							<% cellValue = _getCellValue(i, options.data.data[i].diffs[j]); %>\
							<td class="fc-cohorts-value fc-cohorts-row-<%=(i + 1)%> fc-cohorts-col-<%=j%>"><div <%=_getCellStyle(cellValue, options.data.data[i].total)%>><%=_getFormattedValue(cellValue, options.data.data[i].total)%></div></td>\
						<% } %>\
					</tr>\
					<% } %>\
				</tbody>'
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

			$.fc.reportpanel.prototype._create.apply(this, arguments);

			this.overlay.resize().show();

			var self = this;

			$.fc.data.store.current.get({
				url: this.options.api.getActions,
				root: "actions"
			}, function (data) {
				var result = {};
				$.each(data, function () {
					result[this.id] = this.title;
				});
				self.options.actions = result;

				self.overlay.hide();
			});
		},

		_addBody: function () {
			this.body = $('<table></table>', { "cellspacing": 1, "cellpadding": 0, "class": this.widgetFullName + "-body" })
				.appendTo(this.element);
		},

		_bindActions: function () {
			var self = this;
			this.body.find('.fc-cohorts-value')
				.mouseenter(function () {
					var cross = $.map($(this).attr('class').split(' '), function (value) {
							if (value.indexOf('fc-cohorts-col-') !== 0 && value.indexOf('fc-cohorts-row-') !== 0)
								return null;

							return "." + value;
						})
						.join(',');

					self.body.find(cross)
						.addClass('selected');
				})
				.mouseleave(function () {
					self.body.find('.selected')
						.removeClass('selected');
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

			var percentage = Math.max(1 - ~~value * 3 / this.options.maxValue, 0);
			if (percentage > 0.9) {
				percentage -= 0.1
			} else if (percentage > 0.8) {
				percentage -= 0.05
			}
			return $.fc.stringBuilder.format(' style="background-color: rgba(240, 240, 240, {0});"', percentage.toFixed(2));
		},

		_getFormattedValue: function (value, total) {
			if (!value) {
				return "-";
			}
			return this.options.reportType === 1 || this.options.reportType === 3 ? 
				(value * 100 / total).toFixed(1) + '%' : 
				$.fc.format(value);
		},
		
		_getCellValue: function (hash, value) {		
			this.cumulativeValues[hash] = ~~this.cumulativeValues[hash] + ~~value;
			
			return this.options.reportType > 1 ?
					this.cumulativeValues[hash] :
					value;
		},

		_render: function () {
			if ($.fc.reportpanel.prototype._render.call(this) === false) {
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
					.appendTo(this.element);

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
					change: function () {
						self.options.reportType = ~~this.value();
						self._callMethod("_render");
					}
				}, $("<select></select>").appendTo(this.toolbar));
			}

			this.cumulativeValues = {};

			this.body.html($.fc.tmpl(this.options.template, this));

			this._bindActions();
		}
	});
})(jQuery);