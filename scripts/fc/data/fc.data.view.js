(function ($) {
	$.fc.define("fc.data.view", {
		options: {
			store: null,

			data: [],

			page: 1,
			offset: 0,
			limit: 25,
			total: 0,
			remotePaging: true,
			totalProperty: "total",

			sort: [],
			remoteSort: false,
			filter: [],
			remoteFilter: false,

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
				return filter;
			},

			localFilter: function (data) {
				var result = data;

				return result;
			},

			localSort: function (data, sort) {
				var result = data;

				$.each(sort, function (index, sortingParam) {
					result = data.sort(function (first, second) {
						if (sortingParam.direction === "desc") {
							return first[sortingParam.property] < second[sortingParam.property];
						} else {
							return second[sortingParam.property] < first[sortingParam.property];
						}
					});
				});

				return result;
			},

			localPaging: function () {
				var result = data;

				return result;
			}
		},

		_create: function () {
			var self = this;

			this.data = new $.fc.observableArray(this.options.data);
			this.data.bind('change', function (e, value) {
				self._trigger('change');
			});

			this.page = new $.fc.observable(this.options.page);
			this.page.bind('change', function (e, value) {
				self.offset((value - 1) * self.limit());
			});

			this.limit = new $.fc.observable(this.options.limit);
			this.limit.bind('change', function (e, value) {
				self.offset.set((self.page() - 1) * value);
				self.totalPages(Math.ceil(self.total() / value));
				self.refresh();
			});

			this.offset = new $.fc.observable(this.options.offset);
			this.offset.bind('change', function (e, value) {
				self.page.set(Math.floor(value / self.limit() + 1));
				self.refresh();
			});

			this.total = new $.fc.observable(this.options.total);
			this.total.bind('change', function (e, value) {
				self.totalPages(Math.ceil(value / self.limit()));
			});

			this.totalPages = new $.fc.observable(Math.ceil(this.total() / this.limit()));

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
				new $.fc.data.store($.isArray(this.options.store) ?
					{
						read: {
							predefinedData: this.options.store
						}
					} :
					this.options.store);
		},

		refresh: function () {
		    var self = this;

			this._trigger("beforerefresh");

			this.store.get({
				data: $.extend(true,
						this.options.remotePaging ? this.options.encodePaging(this.page(), this.offset(), this.limit()) : {},
						this.options.remoteSort ? this.options.encodeSorting(this.sort()) : {},
						this.options.remoteFilter ? this.options.encodeFilters(this.filter()) : {}),
				done: function (data, rawData) {
					self.total($.fc.data.getField(rawData, self.options.totalProperty) || data.length);

					if (!self.options.remoteFilter) {
						data = self.options.localFilter(data, self.filter());
					}

					if (!self.options.remoteSort) {
						data = self.options.localSort(data, self.sort());
					}

					if (!self.options.remotePaging) {
						data = self.options.localPaging(data, self.page(), this.offset(), this.limit());
					}

					self.data(data.slice(0));
					self._trigger("refresh");
				},
				fail: function () {
					self._trigger("refresh");
				}
			});
		}
	});
})(jQuery);