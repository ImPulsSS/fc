(function ($) {
	$.fc.define('fc.overlay', {
		options: {
			text: 'Loading...',
			parent: document.body,
			template:
				'<div class="fc-overlay">' +
					'<div class="ui-widget-overlay"></div>' +
					'<div class="ui-widget-shadow ui-corner-all"></div>' +
					'<div class="ui-widget ui-widget-content ui-corner-all"><%=options.text%></div>' +
				'</div>'
		},

		_create: function () {
			var self = this;

			this.wrapper = $($.fc.tmpl(this.options.template, this))
				.prependTo(this.options.parent);

			this.element = this.wrapper.find('.ui-widget-overlay');

			this.resize();

			this.options.parent.bind('resize.fc-overlay', function () {
				self.resize(arguments);
			});
		},

		_height: function () {
			return this.options.parent.innerHeight();
		},

		_width: function () {
			return this.options.parent.innerWidth();
		},

		_destroy: function () {
			this.options.parent.unbind('.fc-overlay');

			this.wrapper.remove();

			delete this.element;
			delete this.wrapper;
		},

		show: function () {
			this.wrapper.show();
		},

		hide: function () {
			this.wrapper.hide();
		},

		resize: function () {
			this.wrapper.css({
				width: this._width(),
				height: this._height()
			});

			this.element.css({
				width: this._width(),
				height: this._height()
			});

			return this;
		}
	});
})(jQuery);