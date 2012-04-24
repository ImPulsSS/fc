(function ($) {
	$.fc.widget("fc.inlineeditable", {
		options: {
			dialog: {
				width: 640,
				height: "auto",
				modal: true
			},

			getDialogTitle: function (element) {
				return element[0].name;
			},

			beforewrap: function (e, element) {
				return element.data("fcFieldWidget") || !element.closest('.fc-form-field').length;
			},

			commit: function (element) {
				return true;
			}
		},

		_create: function () {
			this.element.addClass(this.widgetBaseClass);

			var self = this;

			this.element
				.find(':input')
				.not(':button')
				.each(function () {
					self._wrap(this);
				});
		},

		_destroy: function () {
			this.element
				.find("." + this.widgetFullName + "-control")
					.remove()
					.end()
				.find("." + this.widgetFullName + "-wrapped")
					.unwrap()
					.removeClass(this.widgetBaseClass)
					.show();
		},

		_getTextValue: function (element) {
			if (!element.length) {
			   return "";
		   }

			if (element.is("input:checkbox,input:radio")) {
			    return element[0].checked ? element.val() : "-";
			}

		   if (element.is("select")) {
			   return element.find('option:selected').slice(0, 5).map(function() {
					   return $(this).text();
				   }).get().join(", ");
		   }

		   return element.val();
		},

		_wrap: function (element) {
			element = $(element);

			if (element.is('[type="hidden"]') || this._trigger('beforewrap', null, element) === false) {
				return;
			}

			var field = element.data("fcFieldWidget");

			(field ? field.widget() : element)
				.addClass(this.widgetFullName + "-wrapped")
				.wrap('<div class="' + this.widgetFullName + "-wrapper" + '"></div>');

			var self = this,
				wrapper = (field ? field.widget() : element).parent().hide(),
				currentValue = element.val(),
				value = $('<span></span>', {
						text: this._getTextValue(element),
						css: { marginRight: 10 },
						"class": this.widgetFullName + "-control"
					})
					.insertAfter(wrapper),
				edit = $('<a></a>', {
						href: "#",
						text: "Edit",
						"class": this.widgetFullName + "-control"
					})
					.insertAfter(value),
				commit = function (parent, callback) {
					if (self._trigger("beforesubmit", null, element, parent) === false) {
						return false;
					}

					$.when(self.options.commit(element))
						.done(function (result) {
							currentValue = element.val();

							wrapper.hide();

							value.text(self._getTextValue(element)).show();
							edit.show();

							if ($.isFunction(callback)) {
								callback();
							}

							self._trigger("submit", null, element, true, result);
						})
						.fail(function (result) {
							self._trigger("submit", null, element, false, result);
						});
				},
				reject = function () {
					element.val(currentValue).trigger('change');

					wrapper.hide();

					value.show();
					edit.show();

					return self._trigger("cancel", null, element) !== false;
				};

			if (element.data('modal')) {
				edit.click(function (e) {
					edit.hide();

					wrapper
						.children()
						.wrap('<div></div>')
						.parent()
						.dialog({
							title: self.options.getDialogTitle(element),
							modal: self.options.dialog.modal,
							width: self.options.dialog.width,
							height: self.options.dialog.height,
							close: function () {
								var dialog = $(this);

								if (reject() === false) {
									return;
								}

								dialog.children().detach().appendTo(wrapper);
								dialog.remove();
							},
							buttons: {
								"Ok": function () {
									var dialog = $(this);

									commit(dialog, function () {
										dialog.children().detach().appendTo(wrapper);
										dialog.remove();
									});
								},
								"Cancel": function () {
									var dialog = $(this);

									if (reject() === false) {
										return;
									}

									dialog.children().detach().appendTo(wrapper);
									dialog.remove();
								}
							}
						});

					e.preventDefault();
				});
			} else {
				var ok = $('<button></button>', { text: "Ok", "class": this.widgetFullName + "-control" })
						.appendTo(wrapper)
						.button(),
					cancel = $('<button></button>', { text: "Cancel", "class": this.widgetFullName + "-control" })
						.appendTo(wrapper)
						.button();

				edit.click(function (e) {
					value.hide();
					$(this).hide();

					wrapper.show();

					e.preventDefault();
				});

				ok.click(function (e) {
					commit(wrapper);

					e.preventDefault();
				});

				cancel.click(function (e) {
					reject(wrapper);

					e.preventDefault();
				});
			}
		}
	});
})(jQuery);