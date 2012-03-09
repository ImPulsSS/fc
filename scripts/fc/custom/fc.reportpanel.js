(function ($) {
	$.fc.widget("fc.reportpanel", {
		options: {
			api: {
				getReports: "/GetReports?reportType=?",
				saveReport: "/SaveReport?reportType=?",
				removeReport: "/RemoveReport?reportType=?"
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


			this._addTemplatesBlock();

			this._addFilterBlock();
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
							this.submit();
						},
						"Save setting as template": function() {
							if (!this.valid()) {
								return;
							}

							var filters = this._serialize();

							$.fc.dialog.prompt(
								"Save report template",
								"Please enter report name:",
								$.fc.tmpl(self.options.reportTemplateName, { widget: self, filters: filters }),
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
						}
					},
					apply: function (e, params) {
						if (!params.data.success) {
							return;
						}

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

								self.filter.load(filters);

								self.filter.submit();
							},
							"Remove template": function() {
								var field = this.getField("reportTemplate"),
									reportId = field.value();

								if (!reportId) {
									$.fc.dialog.alert("Template removing", "Unable to find selected template");
									return;
								}

								$.fc.dialog.confirm("Template removing", "Are you sure you want to delete this template?", function (ok) {
									if (!ok) {
										return;
									}

									self.options.reportTemplates.remove(reportId, function (response) {
										if (!response.success) {
											return;
										}

										field.removeOption(reportId);
										if (field.optionsCount() === 0) {
											self.templates.hide();
										}
									});
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
			this._addHeader();

			this._addBody();

			if (typeof (this.options.data) === "undefined" || !this.options.data) {
				this.header.text("No results found.");
				return false;
			}
		},

		_addHeader: function () {
			if (!this.header) {
				this.header = $('<div></div>', { "class": this.widgetFullName + "-header" })
					.appendTo(this.element);
			}
		},

		_addBody: function () {
			if (!this.body) {
				this.body = $('<div></div>', { "class": this.widgetFullName + "-body" })
					.appendTo(this.element);
			}
		},

		_destroy: function () {
			this.element.removeClass(this.widgetBaseClass);
		},

		widget: function () {
			return this.panel;
		}
	});
})(jQuery);