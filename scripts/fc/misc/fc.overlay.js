(function ($) {
	$.fc.define('fc.overlay', {
		options: {
			text: 'Loading...',
			parent: document.body,
			template:
				'<div class="fc-overlay">' +
					'<div class="ui-widget-overlay"></div>' +
					'<div class="ui-widget ui-widget-content ui-corner-all"><%=options.text%></div>' +
				'</div>'
		},

		_constructor: function (parent) {
			this.options = $.extend(true, {}, this.options, $.isPlainObject(parent) ? parent : { parent: $(parent) });
			this._create();
			this._implement();
		},

		_create: function () {
			var self = this;

			this.wrapper = $($.fc.tmpl(this.options.template, this))
				.prependTo(this.options.parent);

			this.element = this.wrapper.find('.ui-widget-overlay');

			this.resize();

			this.options.parent.bind('resize.' + this.widgetFullName, function () {
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
			this.options.parent.unbind('.' + this.widgetFullName);

			this.wrapper.remove();

			delete this.element;
			delete this.wrapper;
		},

		show: function () {
			this.wrapper.show();
			return this;
		},

		hide: function () {
			this.wrapper.hide();
			return this;
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