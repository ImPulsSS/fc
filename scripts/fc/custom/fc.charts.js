(function ($) {
	$.fc.widget("fc.charts", $.fc.reportpanel, {
		options: {
			api: {
				getData: "/Analytics.rest/GetReportData",

				getCharts: "/Analytics.rest/GetAvailableReports",

				getReports: "/Misc.rest/GetReports?reportType=charts",
				saveReport: "/Misc.rest/SaveReport?reportType=charts",
				removeReport: "/Misc.rest/RemoveReport?reportType=charts"
			},
			reportTemplateName: "<%=widget.options.charts[filters.reportname]%>",
			applyfilter: function (e, params) {
				var self = $(this).data("fc-charts");

				self.options.filter = params.filters || {};
				self.options.data = params.data || [];
			}
		},

		_create: function () {
			if (typeof (this.options.fields) === "undefined") {
				this.options.fields = [{
						label: "Report",
						name: "reportname",
						type: "select",
						placeholder: "Select report",
						options: {
							url: this.options.api.getCharts,
							root: "reports",
							map: [
								{ name: "value", mapping: "name" },
								{ name: "text", mapping: "title" }
							]
						},
						required: true
					}
				];
			}

			$.fc.reportpanel.prototype._create.apply(this, arguments);

			this.overlay.resize().show();

			var self = this;

			$.fc.data.store.current.get({
				url: this.options.api.getCharts,
				root: "reports"
			}, function (data) {
				var result = {};
				$.each(data, function () {
					result[this.name] = this.title;
				});
				self.options.charts = result;

				self.overlay.hide();
			});
		},

		_render: function () {
			if ($.fc.reportpanel.prototype._render.call(this) === false) {
				return;
			}

			var self = this,
				series = this.options.data.series;

			if (!$.isArray(series) || series.length === 0) {
				this.header.text("No results found.");
				return;
			}

			this.header.text((this.options.charts[this.options.filter.reportname] || this.options.filter.reportname) +
				(this.options.filter.startdate && this.options.filter.enddate ?
					" between " + this.options.filter.startdate + " and " + this.options.filter.enddate :
					this.options.filter.startdate ?
						" after " + this.options.filter.startdate :
						this.options.filter.enddate ?
							" before " + this.options.filter.enddate :
							""));

			var tooltipFormat = (series[0].type === "pie") ?
				function () { return '<b>' + this.point.name + ':</b> ' + this.y + ' (' + Math.round(this.percentage * 10) / 10 +'%)' } :
				function () { return '<b>'+ this.series.name +'</b>: '+ this.y };

			if (series.length > 1 && series[0].type === "pie") {
				var i, j, k, n = 0,
					currentSeries,
					currentSeriesData,
					newSeries = [{
						type: 'pie',
						size: '60%',
						data: [],
						dataLabels: {
							formatter: function() {
								return this.percentage > 5 ? this.point.name : null;
							},
							color: 'white',
							distance: -30
						}
					}, {
						type: 'pie',
						innerSize: '60%',
						data: [],
						dataLabels: {
							formatter: function() {
								return this.percentage > 1 ? '<b>'+ this.point.name +':</b> ' +  Math.round(this.percentage * 10) / 10 + '%' : null;
							}
						}
					}];

				for (i = 0; i < series.length; i++) {
					currentSeries = series[i];

					k = 0;
					for (j = 0; j < currentSeries.data.length; j++) {
						currentSeriesData = currentSeries.data[j];
						k += currentSeriesData[1];
						newSeries[1].data.push({
							"name" : currentSeriesData[0],
							"y" : currentSeriesData[1]
						});
					}

					n += k;
					newSeries[0].data.push({
						"name" : currentSeries.name,
						"y" : k
					});
				}

				series = newSeries;
			}

			new Highcharts.Chart({
				chart: {
					renderTo: this.body[0],
					type: 'column'
				},
				title: { text: '' },
				credits: { enabled: false },
				tooltip: {
					formatter: tooltipFormat
				},
				plotOptions: {
					pie: {
						shadow: false
					}
				},
				xAxis: { type: 'datetime' },
				yAxis: { title: { text: '' } },
				series: series
			});
		}
	});
})(jQuery);