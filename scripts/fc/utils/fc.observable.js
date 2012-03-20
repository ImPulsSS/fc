(function ($) {
	$.fc.namespace("fc.observable");

	$.fc.observable = function (value) {
		var _lastValue = value,
			observable = function () {
				if (!arguments.length) {
					return _lastValue;
				}

				if (!observable.equal(_lastValue, arguments[0])) {
					observable.trigger('beforechange');

					_lastValue = arguments[0];

					observable.trigger("change");
				}

				return observable;
			};

		return $.extend(true, observable, {
				equal: function (oldValue, newValue) {
					return $.fc.dump(oldValue) === $.fc.dump(newValue);
				},
				bind: function () {
					var wrapper = $([ this ]);
					wrapper.bind.apply(wrapper, arguments);
				},
				unbind: function () {
					var wrapper = $([ this ]);
					wrapper.unbind.apply(wrapper, arguments);
				},
				trigger: function (eventName) {
					this._trigger(eventName || "change", [ _lastValue ]);
				},
				_trigger: function () {
					var wrapper = $([ this ]);
					wrapper.triggerHandler.apply(wrapper, arguments);
				}
			});
	};

	$.fc.observableArray = function () {
		var observable = $.fc.observable($.map(arguments, function (value) { return value; }));

		$.each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (index, methodName) {
			observable[methodName] = function () {
				observable.trigger('beforechange');

				var items = this(),
					result = items[methodName].apply(items, arguments);

				observable.trigger();

				return result;
			};
		});

		return $.extend(true, observable, {
			indexOf: function (item) {
				var items = this();

				return $.inArray(item, items);
			},
			remove: function (value) {
				var i, item,
					items = this(),
					removedValues = [];

				for (i = 0; i < items.length; i++) {
					item = items[i];
					if (($.isFunction(value) && value(item)) || this.equal(item, value)) {
						if (removedValues.length === 0) {
							this.trigger("beforechange");
						}
						removedValues.push(item);
						items.splice(i, 1);
						i--;
					}
				}

				if (removedValues.length) {
					this.trigger();
				}

				return removedValues;
			},
			removeAll: function () {
				if (!arguments.length) {
					var items = this(),
						allValues = items.slice(0);

					this.trigger("beforechange");

					items.splice(0, items.length);

					this.trigger();

					this.trigger("removeAll");

					return allValues;
				}

				var values = $.map(arguments, function (value) { return value; });

				return this.remove(function (value) {
						var valueDump = $.fc.dump(value);
						for (var i = 0; i < values.length; i++) {
							if (valueDump === $.fc.dump(values[i])) {
								return true;
							}
						}
					});
			},
			replace: function (index, newItem) {
				if (index >= 0) {
					this.trigger('beforechange');

					this()[index] = newItem;

					this.trigger();
				}
			},
			replaceAll: function () {
				var items = this(),
					allValues = items.slice(0);

				this($.map(arguments, function (value) { return value; }));

				this.trigger("replaceAll");

				return allValues;
			}
		});
	}
})(jQuery);