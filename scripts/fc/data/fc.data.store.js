(function ($) {
	$.fc.namespace("fc.data.store");

	$.fc.data.store.types = {
		json: "json",
		xml: "xml",
		array: "array"
	};

	$.fc.data.getRoot = function (obj, root) {
		var type = typeof (root);

		if (typeof (obj) === "undefined" || type === "undefined") {
			return obj || {};
		}

		if (type === "string") {
			root = root.split(".");
		}

		var i, result = obj;

		for (i = 0; i < root.length; i++) {
			result = result[root[i]];

			if (!result) {
				return {};
			}
		}

		return result;
	};

	$.fc.data.getField = function (obj, field) {
		var type = typeof (field);

		if (typeof (obj) === "undefined" || type === "undefined") {
			return obj || {};
		}

		if (type === "string" && field.match(/\./)) {
			var root = field.split(".");

			field = root.pop();
			root = $.fc.data.getRoot(obj, root);

			return typeof (root) !== "undefined" && typeof (root) !== "null" ?
					root[field] :
					null;
		} else {
			return obj[field];
		}
	};

	$.fc.data.map = function (arr, map) {
		if (typeof (arr) === "undefined" || !arr) {
			return [];
		}

		if (typeof (map) === "undefined" || !map) {
			return arr;
		}

		var isFunction = $.isFunction(map);
		if (!isFunction) {
			map = $.map(map, function (value, key) {
				return typeof (value) === "string" ?
					{ name: value, mapping: key } :
					value;
			});
		}

		var result;

		return $.map(arr, function (item, key) {
			if (isFunction) {
				return map.call(item, item, key);
			}

			result = { _rawData: item };

			$.each(map, function (index, mapping) {
				result[mapping.name] = $.isFunction(mapping.mapping) ?
					mapping.mapping.call(item, item) :
					$.fc.data.getField(item, mapping.mapping || mapping.name) || mapping.defaultValue;

				if (typeof (result[mapping.name]) === "undefined") {
					result[mapping.name] = null;
				}

				if ($.isFunction(mapping.format)) {
					result[mapping.name] = mapping.format(result[mapping.name]);
				}
			});

			return result;
		});
	};

	$.fc.define("fc.data.store", {
		options: {
			type: $.fc.data.store.types.json,
			data: [],
			read: {
				predefinedData: null,
				type: "GET",
				dataType: "json",
				cached: true
			},
			write: {
				type: "POST",
				dataType: "json"
			},
			remove: {
				type: "GET",
				dataType: "json",
				idField: "id"
			}
		},

		_constructor: function (options) {
			this.options = $.extend(true,
				{},
				this.options,
				$.isPlainObject(options) ?
					(!options.read && !options.write && !options.remove ?
						{ read: options } :
						options) :
					arguments.length ?
						{
							data: $.map(arguments, function (value) {
								return value;
							}),
							type: $.fc.data.store.types.array
						} :
						{}
			);

			this._create();
			this._implement();
		},

		_create: function () {
			this.cache = this.options.cache || $.fc.data.cache.current;
		},

		_prepareData: function (data, options) {
			data = $.fc.data.getRoot(data, options.root);

			return $.fc.data.map(data, options.map);
		},

		get: function () {
			var self = this,
				data = null,
				options  = $.extend({}, this.options.read);

			if (arguments.length === 0) {
				return false;
			}

			if (typeof (arguments[0]) !== "undefined") {
				if (typeof (arguments[0]) === "string") {
					options.url = arguments[0];
				} else if ($.isArray(arguments[0])) {
					options.predefinedData = arguments[0];
				} else if ($.isFunction(arguments[0])) {
					options.done = arguments[0];
				} else {
					$.extend(options, arguments[0]);
				}

				if ($.isFunction(arguments[1])) {
					if (!$.isFunction(options.done)) {
						options.done = arguments[1];
					} else {
						options.startLoading = arguments[1];
					}
				}

				if ($.isFunction(arguments[2])) {
					options.startLoading = arguments[2];
				}
			}

			if (!$.isFunction(options.done)) {
				return false;
			}

			if (!$.isFunction(options.fail)) {
				options.fail = options.done;
			}

			// memory
			if (this.options.type === $.fc.data.store.types.array) {
				if (this.options.data) {
					options.done(this._prepareData(this.options.data, options), this.options.data);
				} else {
					options.fail(null);
				}

				return true;
			}

			if ($.isArray(options.predefinedData)) {
				options.done(this._prepareData(options.predefinedData, options), options.predefinedData);

				return true;
			}

			//cached ajax
			if (options.cached) {
				var hash = $.fc.dump({
						url: options.url,
						data: options.data
					});

				if (this.cache.contains(hash)) {
					data = this.cache.get(hash);
					options.done(this._prepareData(data, options), data);

					return true;
				}

				var cache = this.cache.get(hash);

				if (!cache) {
					cache = this.cache.set(hash, $.ajax(options));
				}

				if ($.isFunction(options.startLoading)) {
					options.startLoading();
				}

				cache
					.done(function (data) {
						options.done(self._prepareData(data, options), data);
					})
					.fail(function () {
						options.fail(null);
					});

				return true;
			}

			//ajax
			$.ajax(options)
				.done(function (data) {
					options.done(self._prepareData(data, options), data);
				})
				.fail(function () {
					options.fail(null);
				});

			return true;
		},

		set: function () {
			var options  = $.extend({}, this.options.write);

			if (arguments.length === 0) {
				return false;
			}

			if (typeof (arguments[0]) === "string") {
				options.url = arguments[0];
			} else if ($.isFunction(arguments[0])) {
				options.done = arguments[0];
			}  else if ($.isPlainObject(arguments[0])) {
				if (arguments[0].url || arguments[0].data || arguments[0].done) {
					$.extend(options, arguments[0]);
				} else {
					options.data = arguments[0];
				}
			} else {
				options.data = arguments[0];
			}

			if (typeof (arguments[1]) !== "undefined") {
				if ($.isFunction(arguments[1])) {
					options.done = arguments[1];
				} else {
					options.data = arguments[1];
				}
			}

			if (typeof (arguments[2]) !== "undefined" && $.isFunction(arguments[2])) {
				options.done = arguments[2];
			}

			$.ajax(options)
				.done(function (data) {
					options.done(data);
				})
				.fail(function () {
					options.done(null);
				});
		},

		remove: function () {
			var options  = $.extend({}, this.options.remove);

			if (arguments.length === 0) {
				return false;
			}

			if (typeof (arguments[1]) !== "undefined") {
				if ($.isFunction(arguments[1])) {
					options.done = arguments[1];
				} else {
					options.data = arguments[1];
				}
			}

			if (typeof (arguments[2]) !== "undefined" && $.isFunction(arguments[2])) {
				options.done = arguments[2];
			}

			if (options.data && typeof (arguments[0]) === "string") {
				options.url = arguments[0];
			} else if ($.isFunction(arguments[0])) {
				options.done = arguments[0];
			}  else if ($.isPlainObject(arguments[0])) {
				if (arguments[0].url || arguments[0].data || arguments[0].done) {
					$.extend(options, arguments[0]);
				} else {
					options.data = arguments[0];
				}
			} else {
				options.data = options.data || {};
				options.data[options.idField] = arguments[0];
			}

			$.ajax(options)
				.done(function (data) {
					options.done(data);
				})
				.fail(function () {
					options.done(null);
				});
		}
	});

	$.fc.data.store.current = new $.fc.data.store();
})(jQuery);