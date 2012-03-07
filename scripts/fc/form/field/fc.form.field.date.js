(function ($) {
	$.fc.widget("fc.form.field.date", $.fc.form.field, {
		options: {
			datepicker: {}
		},

		_render: function () {
			var self  = this;

			if ($.fn.datepicker) {
				if (this.options.dateRangeTo || this.options.dateRangeFrom) {
					this.options.datepicker.onSelect = function (selectedDate) {
						return self._restrictDateRange.call(self, selectedDate);
					}
				}

				this.element.datepicker(this.options.datepicker);
			}

			$.fc.form.field.prototype._render.call(this);
		},

		_restrictDateRange: function (selectedDate) {
			if (!$.fn.datepicker || !selectedDate) {
				return;
			}

			var instance, date;

			if (this.options.dateRangeTo) {
					instance = $(this.element).data("datepicker");
					date = $.datepicker.parseDate(instance.settings.dateFormat || $.datepicker._defaults.dateFormat,
							selectedDate, instance.settings);

					this.options.form.element.find("input[name = '" + this.options.dateRangeTo + "']")
						.datepicker("option", "minDate", date);
			}

			if (this.options.dateRangeFrom) {
					instance = $(this.element).data("datepicker");
					date = $.datepicker.parseDate(instance.settings.dateFormat || $.datepicker._defaults.dateFormat,
							selectedDate, instance.settings);

					this.options.form.element.find("input[name = '" + this.options.dateRangeFrom + "']")
						.datepicker("option", "maxDate", date);
			}
		},

		value: function () {
			var result = $.fc.form.field.prototype.value.apply(this, arguments);

			if (result) {
				this._restrictDateRange(result);
			}

			return result;
		}
	});
})(jQuery);