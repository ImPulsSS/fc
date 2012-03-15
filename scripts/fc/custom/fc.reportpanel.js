(function ($) {
	$.fc.widget("fc.reportpanel", {
		options: {
			api: {
				getReports: "",
				saveReport: "",
				removeReport: ""
			},

			reportTemplateName: "new report template"
		},

		_create: function () {
			this.element.addClass(this.widgetBaseClass);

			this.overlay = new $.fc.overlay({ parent: this.element });
			
			this.options.reportTemplates = new $.fc.data.store({
					useLocalStorage: true,
					read: {
						url: this.options.api.getReports,
						root: "reports",
						map: [
							{ name: "value", mapping: "id" },
							{ name: "text", mapping: "reportName" },
							{ name: "filters" }
						]
					},
					write: {
						url: this.options.api.saveReport
					},
					remove:{
						url: this.options.api.removeReport
					}
				});

			this._addHeader();

			this._addBody();

			this._addTemplatesBlock();

			this._addFilterBlock();
		},

		_addBody: function () {
			this.body = $('<div></div>', { "class": this.widgetFullName + "-body" })
				.appendTo(this.element);
		},

		_addHeader: function () {
			this.header = $('<div></div>', { "class": this.widgetFullName + "-header" })
				.appendTo(this.element);
		},

		_addFilterBlock: function () {
			if (this.filters) {
				return;
			}

			var self = this;

			this.filter = new $.fc.filter($.extend(true, {
					title: "Settings",
					collapsed: false,
					action: self.options.api.getData,
					overlay: self.overlay,
					animations: {
						expand: function () {
							$(this).slideDown(200);
						},
						collapse: function () {
							$(this).slideUp(200);
						}
					},
					buttons: {
						"Run report": function() {
							self.applyFilter();
						},
						"Save setting as template": function() {
							self.saveFilter();
						}
					},

					apply: function (e, params) {
						if (!params.data.success) {
							return;
						}

						self.options.filter = params.filters || {};
						self.options.data = params.data || [];

						self._trigger("applyfilter", e, params);

						self._callMethod("_render");
					}
				}, this.options));

			self.filter
				.widget()
				.prependTo(self.element);
		},

		_addTemplatesBlock: function () {
			if (this.templates) {
				return;
			}

			var self = this;

			self.options.reportTemplates.get(function (data) {
				self.templates = new $.fc.filter({
						title: "Standard reports",
						editable: false,
						collapsed: false,
						visible: false,
						overlay: self.overlay,
						animations: {
							hide: function () {
								var that = $(this);

								that.wrap('<div></div>');

								var height = that.outerHeight() + 20,
									width = that.outerWidth();

								self.element.trigger('resize');

								that.parent()
									.css({
										width: width,
										height: height,
										"padding-left": 23,
										position: "relative",
										left: -23,
										overflow: "hidden"
									})
									.animate({ height: 0 }, 500, function () {
										that.unwrap()
											.hide();
									});
							},

							show: function () {
								var that = $(this);

								that.css("display", "block")
									.wrap('<div></div>');

								var height =  that.outerHeight() + 20,
									width = that.outerWidth();

								self.element.trigger('resize');

								that.parent()
									.css({
										width: width,
										height: 0,
										"padding-left": 23,
										position: "relative",
										left: -23,
										overflow: "hidden"
									})
									.animate({ height: height }, 500, function () {
										that.unwrap();
									});
							},

							expand: function () {
								$(this).slideDown(200);
							},

							collapse: function () {
								$(this).slideUp(200);
							}
						},
						fields: [{
							label: "Display",
							name: "reportTemplate",
							type: "select",
							options: self.options.reportTemplates,
							css: { width: 300 },
							required: true
						}],
						buttons: {
							"Run report": function() {
								var filters = this.getField("reportTemplate").rawValue().filters;

								self.applyFilter(filters);
							},
							"Remove template": function() {
								var field = this.getField("reportTemplate"),
									reportId = field.value();

								self.removeFilter(reportId, function (reportId) {
									field.removeOption(reportId);
									if (field.optionsCount() === 0) {
										self.templates.hide();
									}
								});
							}
						}
					});

				self.templates
					.widget()
					.prependTo(self.element);

				if (!!data.length) {
					self.templates.show();
				}
			});
		},

		_render: function () {
			if (typeof (this.options.data) === "undefined" || !this.options.data) {
				return false;
			}
		},

		_destroy: function () {
			this.element.removeClass(this.widgetBaseClass);
		},

		applyFilter: function (filters, preventEventTrigger) {
			if (arguments.length) {
				this.filter.load(filters);
			}

			if (!preventEventTrigger) {
				this._trigger("beforefilter", null, filters || this.filter._serialize());
			}

			this.filter.submit();
		},

		removeFilter: function (reportId, callback) {
			if (!reportId) {
				$.fc.dialog.alert("Template removing", "Unable to find selected template");
				return;
			}

			var self = this;

			$.fc.dialog.confirm("Template removing", "Are you sure you want to delete this template?", function (ok) {
				if (!ok) {
					return;
				}

				self.options.reportTemplates.remove(reportId, function (response) {
					if (!response.success) {
						return;
					}

					if ($.isFunction(callback)) {
						callback(reportId);
					}
				});
			});
		},

		saveFilter: function (filters) {
			if (!arguments.length) {
				if (!this.filter.valid()) {
					return;
				}

				filters = this.filter._serialize();
			}

			var self = this;

			$.fc.dialog.prompt(
				"Save report template",
				"Please enter report name:",
				$.fc.tmpl(this.options.reportTemplateName, { widget: this, filters: filters }),
				function (reportName) {
					if (!reportName) {
						return;
					}

					self.options.reportTemplates.set({ reportName: reportName, filters: JSON.stringify(filters) }, function (response) {
						if (!response.success) {
							return;
						}

						var field = self.templates.getField("reportTemplate");
						field.addOption({ text: reportName, value: response.id, filters: filters });
						if (field.optionsCount() === 1) {
							self.templates.show();
						}
					});
				}
			);
		},

		widget: function () {
			return this.panel;
		}
	});
})(jQuery);