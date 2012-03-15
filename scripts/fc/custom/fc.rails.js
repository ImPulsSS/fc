(function ($) {
	$.fc.widget("fc.rails", $.fc.reportpanel, {
		options: {
			api: {
				getData: "",

				getReports: "",
				saveReport: "",
				removeReport: ""
			}
		},

		_create: function () {
			$.fc.reportpanel.prototype._create.apply(this, arguments);
		},

		_render: function () {
			if ($.fc.reportpanel.prototype._render.call(this) === false) {
				return;
			}
		}
	});
})(jQuery);