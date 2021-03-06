(function ($) {
	$.fc.widget("fc.charts", $.fc.reportpanel, {
		options: {
			api: {
				getData: "",

				getAvailableReports: "",

				getReports: "",
				saveReport: "",
				removeReport: ""
			},

			reportTemplateName: "<%=widget.filter.getField('reportname').rawValue().text%>",

			preloadfilters: function (e, widget) {
				return false;
			}
		},

		_create: function () {
			var self = this;

			if (!this._trigger("preloadfilters", null, this)) {
				if (typeof (this.options.fields) === "undefined") {
					this.options.fields = [{
							label: "Report",
							name: "reportname",
							type: "select",
							placeholder: "Select report",
							options: {
								url: this.options.api.getAvailableReports,
								root: "reports",
								map: [
									{ name: "value", mapping: "name" },
									{ name: "text", mapping: "title" }
								]
							},
							required: true,
							renderOptions: function () {
								self.overlay.hide();

								self._callMethod("_render");
							}
						}
					];
				}
			}

			$.fc.reportpanel.prototype._create.apply(this, arguments);

			this.overlay.resize().show();
		},

		_render: function () {
			if ($.fc.reportpanel.prototype._render.call(this) === false) {
				return false;
			}

			var self = this,
				series = this.options.data.series;

			if (!$.isArray(series) || series.length === 0) {
				this.header.text("No results found.");
				return false;
			}

			this.header.text($.fc.tmpl(self.options.reportTemplateName, { widget: self, filters: this.options.filter }));

			var tooltipFormat = (series[0].type === "pie") ?
				function () { return '<b>' + this.point.name + ':</b> ' + this.y + ' (' + Math.round(this.percentage * 10) / 10 +'%)' } :
				function () { return '<b>'+ this.series.name +'</b>: '+ this.y };

			var i, j,
				currentSeries,
				currentSeriesData,
				dataType = "categories";

			if (series.length > 1 && series[0].type === "pie") {
				var k, n = 0,
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
			} else {
				for (i = 0; i < series.length; i++) {
					currentSeries = series[i];

					for (j = 0; j < currentSeries.data.length; j++) {
						currentSeriesData = currentSeries.data[j];
						if (!currentSeriesData[0].match(/\/Date\((.*?)\)\//)) {
							break;
						}

						dataType = "datetime";
						currentSeriesData[0] = Number(currentSeriesData[0].substring(6, 19));
					}
				}
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
				xAxis: { type: dataType },
				yAxis: { title: { text: '' } },
				series: series
			});

			return true;
		}
	});
})(jQuery);