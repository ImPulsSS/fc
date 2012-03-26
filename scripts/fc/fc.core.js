(function ($) {
	$.fc = $.fc || {};

	$.fc.namespace = function (name) {
		if (typeof (name) === "string") {
			name = name.split(".");
		}

		if (name[0] === "fc") {
			name.shift();
		}

		var i,
			root = $.fc,
			namespaceLength = name.length;

		for (i = 0; i < namespaceLength; i++) {
			root = root[name[i]] = root[name[i]] || {};
		}

		return root;
	};

	$.fc.define = function (name, base, prototype) {
		var namespace = name.split("."),
			fullName = $.camelCase(namespace.join("-"));

		name = namespace.pop();
		namespace = $.fc.namespace(namespace);

		if (!prototype) {
			prototype = base;
			base = $.fc.base;
		}

		var basePrototype = new base(),
			constructor = prototype._constructor || function () {
				this.options = $.extend(true, {}, this.options, arguments[0] || {});
				this._create();
			};

		namespace[name] = $.extend(true, constructor, namespace[name]);

		basePrototype.options = $.extend(true, {}, basePrototype.options);

		namespace[name].prototype = $.extend(true, basePrototype, {
			namespace: namespace,
			widgetName: fullName
		}, prototype);
	};

	$.fc.widget = function (name, base, prototype) {
		var namespace = name.split("."),
			className = namespace.join("-"),
			fullName = $.camelCase(className);

		name = namespace.pop();
		namespace = $.fc.namespace(namespace);

		if (!prototype) {
			prototype = base;
			base = $.Widget;
		}

		$.expr[":"][className] = function(elem) {
			return !!$.data(elem, fullName);
		};

		var basePrototype = new base(),
			constructor = prototype._constructor || function (options, element) {
				if (!arguments.length) {
					return;
				}

				element = $(element || this.defaultElement);

				if (element.length > 0) {
					$.each(["appendTo", "prependTo", "insertAfter", "insertBefore"], function (index, manipulation) {
						if (!options[manipulation]) {
							return;
						}

						element[manipulation].call(element, options[manipulation]);

						return false;
					});

					this._createWidget(options, element[0]);
				}
			};

		namespace[name] = $.extend(true, constructor, namespace[name]);

		basePrototype.options = $.extend(true, {}, basePrototype.options);

		namespace[name].prototype = $.extend(true, basePrototype, {
			namespace: namespace,
			widgetName: fullName,
			widgetEventPrefix: fullName,
			widgetFullName: className,
			widgetBaseClass: (basePrototype.widgetBaseClass || "ui-widget") + " " + className,
			_bind : function (type, handler) {
				this.element
					.bind((this.widgetEventPrefix + type).toLowerCase(), function () {
						return handler.apply(this, Array.prototype.slice.apply(arguments).slice(1));
					});
			},
			_trigger: function(type, event, data) {
				var callback = this.options[type];

				event = $.Event(event);
				event.type = (type === this.widgetEventPrefix ?
					type :
					this.widgetEventPrefix + type).toLowerCase();
				data = arguments.length > 3 ?
						Array.prototype.slice.apply(arguments).slice(2) :
						[ data || {} ];

				if ( event.originalEvent ) {
					for ( var i = $.event.props.length, prop; i; ) {
						prop = $.event.props[ --i ];
						event[prop] = event.originalEvent[prop];
					}
				}

				this.element.trigger(event, data);

				return !($.isFunction(callback) &&
					callback.apply(this.element[0], $.merge([ event ], data)) === false ||
					event.isDefaultPrevented());
			},
			_callMethod: function (methodName) {
				if (typeof (this[methodName]) === "undefined") {
					return;
				}

				if (arguments.length > 2) {
					this._trigger(arguments[1]);
				}

				this[methodName](this);

				this._trigger(arguments.length > 2 ?
					arguments[2] :
					arguments.length > 1 ?
						arguments[1] :
						methodName.replace(/^_/, ""));
			}
		}, prototype);

		$.widget.bridge(fullName, namespace[name]);
	};

	$.fc.base = function () {};

	$.fc.base.prototype = {
		options: {},
		_create: function () {},
		_trigger: function (type) {
			var data = Array.prototype.slice.apply(arguments).slice(1) || [],
				callback = this.options[type];

			if ($.isFunction(callback)) {
				return callback.apply(this, data) !== false;
			} else if (callback) {
				this.options[type].fireWith(this, data);
			}
		},
		_bind: function (type) {
			if ($.isPlainObject(type)) {
				var self = this;
				$.each(type, function (key, callback) {
					self.bind(key, callback);
				});
			} else {
				this.bind(type, arguments[1]);
			}
		},
		bind: function (type, callback) {
			if (typeof (this.options[type]) === "undefined") {
				this.options[type] = $.Callbacks("stopOnFalse");
			}
			if ($.isFunction(this.options[type])) {
				callback = [ this.options[type], callback ];

				this.options[type] = $.Callbacks("stopOnFalse");
			}

			this.options[type].add(callback);
		},
		unbind: function (type, fn) {
			if (typeof (this.options[type]) !== "undefined" && !$.isFunction(this.options[type])) {
				this.options[type].remove(fn);
			}
		},
		destroy: function() {}
	};
})(jQuery);