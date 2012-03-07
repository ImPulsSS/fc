(function ($) {
	$.fc.widget("fc.charts", $.fc.reportpanel, {
		options: {
			api: {
				getData: "/Metrics.rest/GetData",

				getReports: "/Misc.rest/GetReports?reportType=charts",
				saveReport: "/Misc.rest/SaveReport?reportType=charts",
				removeReport: "/Misc.rest/RemoveReport?reportType=charts"
			}
		},

		_create: function () {

		},

		_render: function () {

		}
	});
})(jQuery);