(function ($) {
	$.fc.widget('fc.overlay', {
		defaultElement: document.body,

		implement: { hidable: $.fc.hidable },

		options: {
			text: 'Loading...',
			visible: false,
			template:
				'<div class="fc-overlay">' +
					'<div class="ui-widget-overlay"></div>' +
					'<div class="ui-widget ui-widget-content ui-corner-all"><%=options.text%></div>' +
				'</div>'
		},

		_constructor: function (options, element) {
			if (!arguments.length) {
				return;
			}

			element = arguments.length === 2 ?
				$(element) :
				arguments.length === 1 && !$.isPlainObject(options) ?
					$(options) :
					options.parent ? // backward compatibility
						$(options.parent) :
						$(this.defaultElement);

			this._createWidget($.isPlainObject(options) ? options : {}, element[0]);

			this._implement();
		},

		_create: function () {
			var self = this;

			this.wrapper = $($.fc.tmpl(this.options.template, this))
				.prependTo(this.element);

			this.overlay = this.wrapper.find('.ui-widget-overlay');

			this.resize();

			this.element.bind('resize.' + this.widgetFullName, function () {
				self.resize(arguments);
			});
		},

		_height: function () {
			return this.element.innerHeight();
		},

		_width: function () {
			return this.element.innerWidth();
		},

		_destroy: function () {
			this.wrapper.remove();
		},

		resize: function () {
			var width =  this._width(),
				height = this._height();

			this.wrapper.css({
				width: width,
				height: height
			});

			this.overlay.css({
				width: width,
				height: height
			});

			return this;
		},

		widget: function () {
			return this.wrapper;
		}
	});
})(jQuery);