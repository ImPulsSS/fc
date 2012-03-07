(function ($) {
	$.fc.define("fc.data.cache", {
		_create: function () {
			this.container = {};
		},

		clear: function () {
			for (var i in this.container) {
				delete this.container[i];
			}

			this.container = {};
		},

		contains: function (hash) {
			return typeof (this.container[hash]) !== "undefined" && !this.container[hash].readyState;
		},

		get: function (hash) {
			return this.container[hash];
		},

		set: function (hash, value) {
			return this.container[hash] = value;
		}
	});
})(jQuery);