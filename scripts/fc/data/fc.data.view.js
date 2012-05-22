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

			localFilter: function (data, filter) {
				return data;
			},

			localSort: function (data, sort) {
				var direction,
					result = data;

				$.each(sort, function (index, sortingParam) {
					direction = sortingParam.direction ? sortingParam.direction.toLowerCase() : "asc";
					result = data.sort(function (first, second) {
						if (direction === "desc") {
							return first[sortingParam.property].toLowerCase() < second[sortingParam.property].toLowerCase();
						} else {
							return second[sortingParam.property].toLowerCase() < first[sortingParam.property].toLowerCase();
						}
					});
				});

				return result;
			},

			localPaging: function (data, page, offset, limit) {
				if (offset > data.length) {
					return [];
				}

				return data.slice(offset, Math.min(offset + limit, data.length));
			},

			getTotal: function (rawData) {
				return $.fc.data.getField(rawData, this.options.totalProperty);
			}
		},

		_create: function () {
			var self = this;

			this.data = new $.fc.observableArray([]);
			this.data.bind('beforechange', function (e, value) {
				self._trigger('beforechange', e, value);
			});
			this.data.bind('change', function (e, value) {
				self._trigger('change', e, value);
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

			this.filter = new $.fc.observable(this.options.filter);
			this.filter.bind('change', function (e, value) {
				self.refresh();
			});

			this.store = this.options.store && this.options.store.widgetName === "fcDataStore" ?
				this.options.store:
				new $.fc.data.store(this.options.store || this.options.data);
		},

		_destroy: function () {
			this.data.unbind();
			this.page.unbind();
			this.limit.unbind();
			this.offset.unbind();
			this.total.unbind();
			this.totalPages.unbind();
			this.sort.unbind();
			this.filter.unbind();

			delete this.data;
			delete this.page;
			delete this.limit;
			delete this.offset;
			delete this.total;
			delete this.totalPages;
			delete this.sort;
			delete this.filter;

			this.store.destroy();
			delete this.store;
		},

		_done: function (data, rawData) {
			if (!this.options.remoteFilter) {
				data = this.options.localFilter(data, this.filter());
			}

			if (!this.options.remoteSort) {
				data = this.options.localSort(data, this.sort());
			}

			if (!this.options.remotePaging) {
				data = this.options.localPaging(data, this.page(), this.offset(), this.limit());
			}

			this.data((data || []).slice(0));

			this.total(this.options.getTotal.call(this, rawData) || this.offset() + data.length);

			this._trigger("refresh");
		},

		_fail: function () {
			this.data([]);
			this._trigger("refresh");
		},

		refresh: function () {
		    var self = this;

			this._trigger("beforerefresh");

			this.store.get({
				data: $.extend(true,
						this.options.request || {},
						this.options.remotePaging ? this.options.encodePaging(this.page(), this.offset(), this.limit()) : {},
						this.options.remoteSort ? this.options.encodeSorting(this.sort()) : {},
						this.options.remoteFilter ? this.options.encodeFilters(this.filter()) : {}),
				done: function () { self._done.apply(self, arguments); },
				fail: function () { self._fail.apply(self, arguments); }
			});
		},

		reset: function () {
			this.data([]);
			this.page(this.options.page);
			this.offset(this.options.offset);
			this.limit(this.options.limit);
			this.total(this.options.total);
		}
	});
})(jQuery);