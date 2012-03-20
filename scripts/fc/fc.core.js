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
			fullName = $.camelCase(namespace.join("-")),
			constructor = function () {
				this.options = $.extend(true, {}, this.options, arguments[0] || {});
				this._create();
			};

		name = namespace.pop();
		namespace = $.fc.namespace(namespace);

		if (!prototype) {
			prototype = base;
			base = $.fc.base;
		}

		namespace[name] = $.extend(true, constructor, namespace[name]);

		var basePrototype = new base();

		basePrototype.options = $.extend(true, {}, basePrototype.options);

		namespace[name].prototype = $.extend(true, basePrototype, {
			namespace: namespace,
			widgetName: fullName
		}, prototype);
	};

	$.fc.widget = function (name, base, prototype) {
		var namespace = name.split("."),
			className = namespace.join("-"),
			fullName = $.camelCase(className),
			constructor = function (options, element) {
				if (!arguments.length) {
					return;
				}

				element = $(element || this.defaultElement);

				if (element.length > 0) {
					this._createWidget(options, element[0]);
				}
			};

		name = namespace.pop();
		namespace = $.fc.namespace(namespace);

		if (!prototype) {
			prototype = base;
			base = $.Widget;
		}

		$.expr[":"][className] = function(elem) {
			return !!$.data(elem, fullName);
		};

		namespace[name] = $.extend(true, constructor, namespace[name]);

		var basePrototype = new base();

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
						return handler.apply(this, Array.prototype.slice.apply(arguments, 1));
					});
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
		_trigger: function(type) {
			var callback = this.options[type];

			if (!$.isFunction(callback)) {
				return true;
			}

			return callback.apply(this, Array.prototype.slice.apply(arguments, 1)) !== false;
		},
		bind: function () {

		},
		destroy: function() {}
	}
})(jQuery);