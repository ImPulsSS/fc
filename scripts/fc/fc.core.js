(function ($) {
	$.fc = $.fc || {};

	$.fc.namespace = function (root, name) {
		if (typeof (name) === "undefined") {
			name = root;
			root = $.fc;
		}

		if (typeof (name) === "string") {
			name = name.split(".");
		}

		if (root == $.fc && name[0] === "$") {
			name.shift();
		}

		if (root == $.fc && name[0] === "fc") {
			name.shift();
		}

		var i,
			namespaceLength = name.length;

		for (i = 0; i < namespaceLength; i++) {
			root = root[name[i]] = root[name[i]] || {};
		}

		return root;
	};

	$.fc.define = function (name, base, prototype) {
		var namespace = name.split("."),
			className = namespace.join("-"),
			fullName = $.camelCase(className);

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
					this._implement();
				};

		namespace[name] = $.extend(true, constructor, namespace[name]);

		$.each(prototype, function(prop, value) {
			if ($.isFunction(value)) {
				prototype[prop] = (function() {
					return function() {
						var __base = this._base,
							returnValue;

						this._base = base.prototype;

						returnValue = value.apply(this, arguments);

						this._base = __base;

						return returnValue;
					};
				})();
			}
		});

		var implementation = {};
		$.each(prototype.implement || [], function (index, mixin) {
			implementation = $.extend(true, implementation, mixin);
		});

		namespace[name].prototype = $.extend(true,
			implementation,
			basePrototype,
			{
				namespace: namespace,
				widgetName: fullName,
				widgetFullName: className
			},
			prototype);
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
					if (typeof (options) !== "undefined" && options) {
						$.each(["appendTo", "prependTo", "insertAfter", "insertBefore"], function (index, manipulation) {
							if (!options[manipulation]) {
								return;
							}

							element[manipulation].call(element, options[manipulation]);

							return false;
						});
					}

					this._createWidget(options, element[0]);
				}

				this._implement();
			};

		namespace[name] = $.extend(true, constructor, namespace[name]);

		$.each(prototype, function(prop, value) {
			if ($.isFunction(value)) {
				prototype[prop] = (function() {
					return function() {
						var __base = this._base,
							returnValue;

						this._base = base.prototype;

						returnValue = value.apply(this, arguments);

						this._base = __base;

						return returnValue;
					};
				})();
			}
		});

		var implementation = {};
		$.each(prototype.implement || [], function (index, mixin) {
			implementation = $.extend(true, implementation, mixin);
		});

		namespace[name].prototype = $.extend(true,
			implementation,
			basePrototype,
			{
				namespace: namespace,
				widgetName: fullName,
				widgetEventPrefix: fullName,
				widgetFullName: className,
				widgetBaseClass: (basePrototype.widgetBaseClass || "ui-widget") + " " + className,
				destroy: function() {
					this._trigger("destroy");

					this._destroy();

					$.Widget.prototype.destroy.call(this);
				},
				_destroy: function () {},
				_bind : function (type, handler) {
					this.element
						.bind((this.widgetEventPrefix + type).toLowerCase(), function () {
							return handler.apply(this, Array.prototype.slice.call(arguments, 1));
						});
				},
				_trigger: function(type, event, data) {
					var callback = this.options[type];

					event = $.Event(event);
					event.type = (type === this.widgetEventPrefix ?
						type :
						this.widgetEventPrefix + type).toLowerCase();
					data = arguments.length > 3 ?
							Array.prototype.slice.call(arguments, 2) :
							[ typeof (data) !== "undefined" ? data : {} ];

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
				_implement: function () {
					if (!this.implement) {
						return;
					}

					var self = this;

					$.each(this.implement, function (index, mixin) {
						if ($.isFunction(mixin._implement)) {
							mixin._implement.call(self);
						}
					});
				},
				_callMethod: function (methodName) {
					if (typeof (this[methodName]) === "undefined") {
						return;
					}

					if (arguments.length > 2) {
						this._trigger(arguments[1]);
					}

					var result = this[methodName](this);

					this._trigger(arguments.length > 2 ?
						arguments[2] :
						arguments.length > 1 ?
							arguments[1] :
							methodName.replace(/^_/, ""), null, result);
				}
			},
			prototype);

		$.widget.bridge(fullName, namespace[name]);
	};

	$.fc.base = function () {};

	$.fc.base.prototype = {
		options: {},
		_create: function () {},
		_destroy: function () {},
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
		_trigger: function (type) {
			var data = Array.prototype.slice.apply(arguments).slice(1) || [],
				callback = this.options[type];

			if ($.isFunction(callback)) {
				return callback.apply(this, data) !== false;
			} else if (callback) {
				this.options[type].fireWith(this, data);
			}
		},
		_implement: function () {
			if (!this.implement) {
				return;
			}

			var self = this;

			$.each(this.implement, function (index, mixin) {
				if ($.isFunction(mixin._implement)) {
					mixin._implement.call(self);
				}
			});
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
		destroy: function() {
			this._destroy();
		}
	};
})(jQuery);