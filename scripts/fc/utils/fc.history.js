(function ($) {
	$.fc.define('fc.history', {
		options: {
			state: {},
			handlers: {}
		},

		_create: function () {
		},

		init: function () {
			var self = this;

			$(window).bind('hashchange', function (e) {
				var state = self.getState();

				$.each(self.options.handlers, function (key, handlers) {
					if ($.fc.dump(state[key]) === $.fc.dump(self.options.state[key])) {
						return;
					}

					$.each(handlers, function (index, handler) {
						handler(state[key]);
					});
				});

				self.options.state = state;
			});

			$(window).trigger('hashchange');
		},

		addHandler: function (key, handler) {
			if (!key || !$.isFunction(handler)) {
				return false;
			}

			if (!this.options.handlers[key]) {
				this.options.handlers[key] = [];
			}

			this.options.handlers[key].push(handler);
		},

		removeHandler: function (key) {
			delete this.options.handlers[key];
		},

		getState: function () {
			var hash = window.location.hash.toString();
			if (hash.indexOf('#') === 0) {
				hash = hash.slice(1);
			}

			return JSON.parse(decodeURIComponent(hash || "{}"));
		},

		removeState: function (key) {
			delete this.options.state[key];

			this.update();
		},

		pushState: function (key, params, refresh) {
			if (!!refresh) {
				this.options.state = {};
			}

			this.options.state[key] = params;

			this.update();
		},

		update: function () {
			window.location.href = window.location.href.split('#')[0] + '#' +
				encodeURIComponent(JSON.stringify(this.options.state));
		}
	});

	$.fc.history.current = new $.fc.history();
})(jQuery);