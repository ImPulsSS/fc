(function ($) {
	$.fc.define("fc.data.view", {
		options: {
			data: [],

			page: 1,
			offset: 0,
			limit: 25,
			total: 0,

			sort: [],
			filter: [],

			encodePaging: function (page, offset, limit) {
				return {
					page: page,
					start: offset,
					limit: limit
				};
			},

			encodeSorting: function (sort) {
				return { sort: JSON.stringify(sort) };
			},

			encodeFilters: function (filter) {
				return { filter: JSON.stringify(filter) };
			},

			store: null
		},

		_create: function () {
			var self = this;

			this.data = new $.fc.observableArray(this.options.data);
			this.data.bind('change', function (e, value) {
				self._trigger('change');
			});

			this.page = new $.fc.observable(this.options.page);
			this.page.bind('change', function (e, value) {
				self.offset.set((value - 1) * self.limit());
				self.refresh();
			});

			this.limit = new $.fc.observable(this.options.limit);
			this.limit.bind('change', function (e, value) {
				self.offset.set((self.page() - 1) * value);
				self.refresh();
			});

			this.offset = new $.fc.observable(this.options.offset);
			this.offset.bind('change', function (e, value) {
				self.page.set(Math.floor(value / self.limit() + 1));
				self.refresh();
			});

			this.sort = new $.fc.observableArray(this.options.sort);
			this.sort.bind('change', function (e, value) {
				self.refresh();
			});

			this.filter = new $.fc.observableArray(this.options.filter);
			this.filter.bind('change', function (e, value) {
				self.refresh();
			});

			this.store = (this.options.store !== null && this.options.store.widgetName === "fcDataStore") ?
				this.options.store :
				new $.fc.data.store(this.options.store);
		},

		refresh: function () {
		    var self = this;

			this._trigger("beforerefresh");

			this.store.get({
				data: $.extend(true,
						this.options.encodePaging(this.page(), this.offset(), this.limit()),
						this.options.encodeSorting(this.sort()),
						this.options.encodeFilters(this.filter())),
				done: function (data) {
					self.data(data);
				}
			});
		}
	});
})(jQuery);