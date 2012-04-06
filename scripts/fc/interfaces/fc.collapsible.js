(function ($) {
	$.fc.collapsible = {
		options: {
			collapsed: false,

			animations: {
				expand: function (callback) {
					$(this).show();
					if ($.isFunction(callback)) {
						callback();
					}
				},
				collapse: function (callback) {
					$(this).hide();
					if ($.isFunction(callback)) {
						callback();
					}
				}
			}
		},

		_implement: function () {
			var self = this;

			this.isCollapsed = $.fc.observable(this.options.collapsed);

			if (this.isCollapsed()) {
				this._collapsible().hide();
			}

			this.isCollapsed.change(function (e, value) {
				if (value) {
					self.collapse();
				} else {
					self.expand();
				}
			});
		},

		_collapsible: function () {
			return this.widget();
		},

		collapse: function () {
			var self = this;

			this._trigger('beforecollapse', null, this);

			this.options.animations.collapse.call(this._collapsible()[0], function () {
				self._trigger('collapse', null, self);
			});

			this.isCollapsed.set(true);
		},

		expand: function () {
			var self = this;

			this._trigger('beforeexpand', null, this);

			this.options.animations.expand.call(this._collapsible()[0], function () {
				self._trigger('expand', null, self);
			});

			this.isCollapsed.set(false);
		}
	};
})(jQuery);