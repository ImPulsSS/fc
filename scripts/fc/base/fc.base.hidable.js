(function ($) {
	$.fc.widget("fc.base.hidable", {
		options: {
			visible: true,

			animations: {
				hide: function (callback) {
					$(this).hide();
					if ($.isFunction(callback)) {
						callback();
					}
				},
				show: function (callback) {
					$(this).show();
					if ($.isFunction(callback)) {
						callback();
					}
				}
			}
		},

		_init: function () {
			this.widget().hide();

			if (this.options.visible) {
				this.show();
			}
		},

		hide: function () {
			var self = this;

			this._trigger('beforehide', null, this);

			this.options.animations.hide.call(this.widget()[0], function () {
				self._trigger('afterhide', null, self);
			});
		},

		show: function () {
			var self = this;

			this._trigger('beforeshow', null, this);

			this.options.animations.show.call(this.widget()[0], function () {
				self._trigger('aftershow', null, self);
			});
		}
	});
})(jQuery);