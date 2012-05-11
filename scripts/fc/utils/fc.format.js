(function ($) {
	$.fc = $.fc || {};

	$.fc.format = {
		dateTimeFormat: "d/m/yyyy h:MM:ss TT",

		"boolean": function (value) {
			return typeof (value) !== "undefined" && value ?
				"true" :
				"false";
		},

		usNumber: function (source) {
			source += '';

			var x = source.split('.'),
				x1 = x[0],
				x2 = x.length > 1 ? '.' + x[1] : '',
				rgx = /(\d+)(\d{3})/;

			while (rgx.test(x1)) {
				x1 = x1.replace(rgx, '$1' + ',' + '$2');
			}

			return x1 + x2;
		},

		date: function (value, format) {
			value = new Date(value);

			return value.format(format || $.fc.format.dateTimeFormat);
		},

		jsonDate: function (value) {
			value = Number(value.replace(/\/Date\(([\-\d]+)\)\//, "$1"));
			return value > 0 ? $.fc.format.date(value) : "-";
		}
	};
})(jQuery);