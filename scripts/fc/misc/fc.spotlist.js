(function ($) {
	$.fc.widget("fc.spotlist", {
		options: {
			items: "li",
			handle: null,

			animationSpeed: 500,

			itemClass: "fc-spotlist-item",
			spotClass: "fc-spotlist-selected",
			shadowClass: "fc-spotlist-shadow",
			overClass: "fc-spotlist-over"
		},

		_create: function () {
			var self = this;

			this.element
				.addClass(this.widgetBaseClass);

			this.items = this.element
				.find(this.options.items)
				.addClass(this.options.itemClass);

			this.handles = (this.options.handle ?
				this.items.find(this.options.handle) :
				this.items)
					.bind("click.fcSpotlist", function (e) {
						return self.spot.call(self, e, this, $(this).closest(self.options.items).get(0));
					});
		},

		_destroy: function() {
			this.element
				.removeClass(this.widgetBaseClass);

			this.items
				.removeClass([
								this.options.shadowClass,
								this.options.itemClass
							 ].join(' '));

			this.selected
				.removeClass(this.options.spotClass);

			this.handles
				.unbind(".fcSpotlist");

			delete this.selected;
			delete this.handles;
			delete this.items;
		},

		_uiHash: function () {
			return {
				item: this.selected.get(0),
				handle: (this.options.handle ?
					this.selected.find(this.options.handle) :
					this.selected).get(0)
			};
		},

		reset: function () {
			this.items
				.removeClass([
								this.options.shadowClass,
								this.options.spotClass,
								this.options.overClass
							 ].join(' '), this.options.animationSpeed);

			!this.selected || this._trigger("losespot", null, this._uiHash());

			this._trigger("reset", null);
		},

		shadow: function (items) {
			if (!items) {
				return;
			}

			var self = this;

			if (items.length > 1) {
				items.addClass(this.options.shadowClass, this.options.animationSpeed);
			} else {
				items.switchClass(this.options.spotClass, this.options.shadowClass, this.options.animationSpeed);

				this._trigger("losespot", null, this._uiHash());
			}

			items.bind("mouseenter.fcSpotlist", function (e) {
					$(this).addClass(self.options.overClass);
				})
				.bind("mouseleave.fcSpotlist", function (e) {
					$(this).removeClass(self.options.overClass);
				});
		},

		spot: function (e, handle, item) {
			var $item = $(item);

			if ($item.hasClass(this.options.spotClass)) {
				return;
			}

			this.shadow(this.items
				.not(item)
				.not(this.selected)
				.not('.' + this.options.shadowClass));

			this.shadow(this.selected);

			this.selected = $item
				.unbind(".fcSpotlist");

			if (this.selected.hasClass(this.options.overClass)) {
				this.selected.removeClass([
					this.options.shadowClass,
					this.options.overClass
				].join(' '))
					.addClass(this.options.spotClass);
			} else {
				this.selected.switchClass(this.options.shadowClass, this.options.spotClass, this.options.animationSpeed);
			}

			return this._trigger("getspot", e, { item: item, handle: handle });
		}
	});
})(jQuery);