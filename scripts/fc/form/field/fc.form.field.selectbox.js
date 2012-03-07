(function ($) {
	$.fc.widget("fc.form.field.selectbox", $.fc.form.field, {
		defaultElement: '<select>',

		options: {
			loading: "Loading...",
			options: []
		},

		_init: function () {
			$.fc.form.field.prototype._init.call(this);

			var self = this,
				callback =  function (data) {
					self.options.options = data;
					self._callMethod("_renderOptions");
				},
				startLoading = function () {
					self.addOption({ text: self.options.loading, value: "" });
				};

			if (this.options.options.widgetName === "fcDataStore") {
				this.options.options.get(callback, startLoading);
			} else {
				$.fc.data.store.current.get(this.options.options, callback, startLoading);
			}
		},

		_renderOptions: function () {
			if (!this.options.options || !$.isArray(this.options.options)) {
				return;
			}

			var options = {},
				self = this;

			this.element.empty();

			if (this.options.placeholder) {
				self.addOption({ text: this.options.placeholder, value: "" });
			}

			$.each(this.options.options, function (index, record) {
				record = typeof (record) === "string" ?
					{ text: record, value: record } :
					$.isArray(record) ?
						{ text: record[0] || "", value: record[1] || record[0] } :
						record;

				self.addOption(record);

				options[record.value] = record;
			});

			this.options.options = options;

			this.value(this.options.value || null);
		},
		
		addOption: function (record) {
			$('<option></option>', { text: record.text, value: record.value })
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