(function ($) {
	$.fc = $.fc || {};

	$.fc.basePrefix = 'fc_';

	$.fc.getTextDimensions = function (text) {
		var $ruler = $('#__get_dimensions_dummy_span');
		if ($ruler.length === 0) {
			$ruler = $('<span></span>', {
				"id": "__get_dimensions_dummy_span",
				"css": {
					display: "inline-block",
					position: "absolute",
					left: -9999,
					top: -9999,
					zoom: 1
				}
			})
				.appendTo(document.body);
		}

		$ruler.removeClass()
			.addClass(arguments[2] || "")
				.css($.extend({
				"width": "",
				"min-width": "",
				"max-width": "",
				"height": "",
				"min-height": "",
				"max-height": ""
			}, arguments[1]))
			.html(text);

		return { width: $ruler.outerWidth(), height: $ruler.outerHeight() };
	};

	var __fc_lastId = 0;

	$.fc.getId = function () {
		return $.fc.basePrefix + (__fc_lastId++);
	};

	$.fc.toObject = function(arr) {
		var i, current,
			skipNulls = typeof (arguments[1]) === "boolean" ?
				arguments[1] :
				!!arguments[2],
			map = $.isFunction(arguments[1]) ?
				arguments[1] :
				null,
			result = {};

		arr = arr || this;

		for (i in arr) {
			current = arr[i];
			if (map) {
				map.call(result, current, i);
			} else {
				if (!skipNulls || (typeof (current) !== "undefined" && current !== null)) {
					result[i] = current;
				}
			}
		}
		return result;
	};

	$.fc.isJSON = function (str) {
		return !!str.match(/["\[\],:]/);
	}
})(jQuery);