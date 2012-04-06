(function ($) {
	$.fc.hidable = {
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

		_implement: function () {
			var self = this;

			this.isVisible = $.fc.observable(this.options.visible);

			this.widget().hide();

			if (this.isVisible()) {
				this.show();
			}

			this.isVisible.change(function (e, value) {
				if (value) {
					self.show();
				} else {
					self.hide();
				}
			});
		},

		hide: function () {
			var self = this;

			this._trigger('beforehide', null, this);

			this.options.animations.hide.call(this.widget()[0], function () {
				self._trigger('hide', null, self);
			});

			this.isVisible.set(false);
		},

		show: function () {
			var self = this;

			this._trigger('beforeshow', null, this);

			this.options.animations.show.call(this.widget()[0], function () {
				self._trigger('show', null, self);
			});

			this.isVisible.set(true);
		}
	};
})(jQuery);