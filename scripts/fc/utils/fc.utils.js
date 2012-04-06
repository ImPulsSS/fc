(function ($) {
	$.fc = $.fc || {};

	$.fc.basePrefix = 'fc_';

	var __fc_lastId = 0,
		__fc_scrollbarWidth = 0,
		__fc_primitiveTypes = { 'undefined': true, 'boolean': true, 'number': true, 'string': true };

	$.fc.attrFn = $.attrFn || {
		val: true,
		css: true,
		html: true,
		text: true,
		data: true,
		width: true,
		height: true,
		offset: true,
		click: true,
		bind: true
	};

	$.fc.getTextDimensions = function (text) {
		var $ruler = $('#__get_dimensions_dummy_span');
		if ($ruler.length === 0) {
			$ruler = $('<div></div>', {
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

	$.fc.scrollbarWidth = function () {
		if (!__fc_scrollbarWidth) {
			if ($.browser.msie) {
				var $textarea1 = $('<textarea></textarea>', {
							cols: 10,
							rows: 2,
							css: {
								position: "absolute",
								top: -1000,
								left: -1000
							}
						})
						.appendTo('body'),
					$textarea2 = $('<textarea></textarea>', {
							cols: 10,
							rows: 2,
							css: {
								overflow: "hidden",
								position: "absolute",
								top: -1000,
								left: -1000
							}
						})
						.appendTo('body');

				__fc_scrollbarWidth = $textarea1.width() - $textarea2.width();

				$textarea1.add($textarea2).remove();
			} else {
				var $div = $('<div />', { css: { width: 100, height: 100, overflow: 'auto', position: 'absolute', top: -1000, left: -1000 } })
					.prependTo('body')
					.append('<div />')
					.find('div')
					.css({ width: '100%', height: 200 });

				__fc_scrollbarWidth = 100 - $div.width();

				$div.parent().remove();
			}
		}

		return __fc_scrollbarWidth;
	};

	$.fc.getId = function () {
		return $.fc.basePrefix + (++__fc_lastId);
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
	};

	$.fc.dump = function (object) {
		if (object === null || typeof(object) in __fc_primitiveTypes) {
			return object;
		}

		var level = arguments[1] || 0;
		if (level > 5)
			return;

		var dump = new $.fc.stringBuilder();
		for (var field in object)
		{
			dump.append(field, ':', object[field], ';');

			if (typeof object[field] === 'object') {
				dump.append($.fc.dump(object[field], level + 1));
			}
		}
		return dump.toString("");
	};
})(jQuery);