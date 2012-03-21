(function ($) {
	$.fc = $.fc || {};

	$.fc.stringBuilder = function () {
		this.container = [];

		var i,
		arglen = arguments.length;
		for (i = 0; i < arglen; i++) {
			this.container[this.container.length] = arguments[i];
		}
	};

	$.fc.stringBuilder.prototype = {
		append: function () {
			var i,
				arglen = arguments.length;

			for (i = 0; i < arglen; i++) {
				this.container[this.container.length] = arguments[i];
			}
		},

		appendFormat: function (template) {
			this.container[this.container.length] = $.fc.stringBuilder.format.apply(template, arguments);
		},

		appendTemplate: function (template, values) {
			this.container[this.container.length] = $.fc.tmpl(template, values);
		},

		empty: function () {
			this.container = [];
		},

		length: function () {
			return this.container.length;
		},

		toString: function (delimiter) {
			if (delimiter) {
				return this.container.join(delimiter);
			} else {
				return this.container.join('');
			}
		}
	};

	$.fc.stringBuilder.format = function(template) {
		var replacer,
			arglist = arguments;

		return template.replace(/\{(\d+)\}/g, function (str, index) {
				replacer = arglist[~~index + 1];
				return replacer !== null && typeof (replacer) !== "undefined" ?
					replacer :
					"";
			});
	};

	// Simple JavaScript Templating
	// John Resig - http://ejohn.org/ - MIT Licensed
	var _tmpl_cache = {};

	$.fc.tmpl = function (str, data) {
		var fn = !(/\W/.test(str)) ?
			_tmpl_cache[str] = _tmpl_cache[str] ||
				$.fc.tmpl(document.getElementById(str).innerHTML) :

			new Function("obj",
				"var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('" +

					str
						.replace(/[\r\t\n]/g, " ")
						.split("<%").join("\t")
						.replace(/((^|%>)[^\t]*)'/g, "$1\r")
						.replace(/\t=(.*?)%>/g, "',$1,'")
						.split("\t").join("');")
						.split("%>").join("p.push('")
						.split("\r").join("\\'")

					+ "');}return p.join('');");

		return data ? fn(data) : fn;
	};

})(jQuery);
