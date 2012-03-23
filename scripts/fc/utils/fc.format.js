(function ($) {
	$.fc = $.fc || {};

	$.fc.format = {
		"boolean": function (value) {
			return typeof (value) !== "undefined" && value ?
				"true" :
				"false";
		},
		usNumber: function (source) {
			source += '';
			x = source.split('.');
			x1 = x[0];
			x2 = x.length > 1 ? '.' + x[1] : '';
			var rgx = /(\d+)(\d{3})/;
			while (rgx.test(x1)) {
				x1 = x1.replace(rgx, '$1' + ',' + '$2');
			}
			return x1 + x2;
		}
	};
})(jQuery);