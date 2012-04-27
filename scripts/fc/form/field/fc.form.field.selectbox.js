(function ($) {
	$.fc.widget("fc.form.field.selectbox", $.fc.form.field, {
		defaultElement: '<select>',

		options: {
			loading: "Loading...",
			autoRefresh: true,
			displayField: 'text',
			valueField: 'value'
		},

		_destroy: function () {
			if (this.overlay) {
				this.overlay.destroy();
			}

			this._base._destroy.call(this);

			if (!this.externalSource) {
				this.source.destroy();
			}
		},

		_init: function () {
			$.fc.form.field.prototype._init.call(this);

			var self = this,
				data = this.element
					.find('option')
					.each(function () {
						$(this).attr("value", this.value);
					})
					.map(function (index, option) {
						return { text: option.innerHTML, value: option.value };
					})
					.get();

			if (!this.options.source && this.options.options) {
				this.options.source = $.isArray(this.options.options) ? this.options.options : { store: this.options.options };
			}

			if (this.options.source && this.options.source.widgetName === "fcDataView") {
				this.source = this.options.source;
				this.externalSource = true;
			} else {
				var sourceOptions = {
						remotePaging: false,
						data: $.isArray(this.options.source) ? $.merge(data, this.options.source) : data
					};

				this.source = new $.fc.data.view(
						$.isPlainObject(this.options.source) ?
							$.extend(true, sourceOptions, this.options.source) :
							sourceOptions
					);
			}

			this.source._bind({
				change: function (records) {
					self._callMethod("_renderOptions");
				},
				beforerefresh: function () {
					if (self.overlay) {
						self.overlay.resize().show();
					}
				},
				refresh: function () {
					if (self.overlay) {
						self.overlay.hide();
					}
				}
			});

			if (this.options.autoRefresh) {
				this.source.refresh();
			}
		},

		_render: function () {
			if (this.options.decorate) {
				if (!this.wrapper) {
					this.element.wrap("<div></div>");

					this.wrapper = this.element.parent().addClass(this.widgetBaseClass);
				}

				if (!this.overlay) {
					this.overlay = new $.fc.overlay({
						template: '<div class="fc-overlay ui-widget ui-widget-overlay"></div>',
						parent: this.wrapper
					});
				}

				if (this.options.label && !this.wrapper.find('label').length) {
					$("<label></label>", { "text": this.options.label})
						.css(this.options.labelStyle || {})
						.prependTo(this.wrapper);
				}
			}
		},

		_renderOptions: function () {
			var data = this.source.data(),
				options = {},
				value = this.options.value || this.element.val(),
				self = this;

			if (!data || !$.isArray(data)) {
				return;
			}

			this.element.empty();

			if (this.options.placeholder) {
				self.addOption({ text: this.options.placeholder, value: "" });
			}

			$.each(data, function (index, record) {
				record = typeof (record) === "string" ?
					{ text: record, value: record } :
					$.isArray(record) ?
						{ text: record[0] || "", value: record[1] || record[0] } :
						record;

				self.addOption(record);

				options[record.value] = record;
			});

			this.options.options = options;

			this.value(value);
		},
		
		addOption: function (record) {
			$('<option></option>', { text: record[this.options.displayField], value: record[this.options.valueField] })
				.appendTo(this.element)
				.data('record', record);
		},

		optionsCount: function () {
			return this.element.find('option').length;
		},

		rawValue: function () {
			return this.element.find(':selected').data('record');
		},

		removeOption: function (value) {
			this.element
				.find('option[value="' + value + '"]')
				.remove();
		}
	});
})(jQuery);