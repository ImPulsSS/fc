(function ($) {
	$.fc.widget("fc.form", {
		defaultElement: '<form>',

		implement: { serializable: $.fc.serializable },

		options: {
			type: "ajax",
			method: "POST",
			fieldSetClass: "fc-form-fieldset",

			labelStyle: {
				"display": "inline-block",
				"min-width": 70
			},

			fields: []
		},

		_create: function () {
			var self = this;
			
			if (typeof (this.options.action) === "undefined" || !this.options.action) {
				this.options.action = this.element[0].action;
			}
			
			if (typeof (this.options.method) === "undefined" || !this.options.method) {
				this.options.method = this.element[0].method;
			}
			
			this.element.submit(function () {
				return self.submit();
			});
		},

		_init: function () {
			//$.fc.interfaces.hidable._init.call(this);

			var self = this;

			$.fc.data.store.current.get(this.options.fields, function (data) {
				self.options.fields = data;
				self._callMethod("_render");
			});
		},

		_render: function () {
			if (!this.options.fields || !$.isArray(this.options.fields)) {
				return;
			}

			this._wrapExistingFields();
			
			this._renderFields(this.options.fields).appendTo(this.element);
		},

		_renderField: function (fieldOptions) {
			fieldOptions = $.extend({ form: this, labelStyle: this.options.labelStyle }, fieldOptions);
			switch (fieldOptions.type) {
				case "select":
					return new $.fc.form.field.selectbox(fieldOptions);
				case "checkbox":
					return new $.fc.form.field.checkbox(fieldOptions);
				case "radio":
					return new $.fc.form.field.radio(fieldOptions);
				case "date":
					return new $.fc.form.field.date(fieldOptions);
				case "textarea":
					return new $.fc.form.field.textarea(fieldOptions);
				case "hidden":
					return new $.fc.form.field.hidden(fieldOptions);
				default:
					return new $.fc.form.field(fieldOptions);
			}
		},

		_renderFields: function (fields) {
			var field, fieldWrapper,
				self = this,
				fieldSet = $('<div>', { "class": self.options.fieldSetClass });

			$.each(fields, function (index, fieldOptions) {
				if ($.isArray(fieldOptions)) {
					fieldWrapper = self._renderFields(fieldOptions);
				} else {
					field = self._renderField(fieldOptions);

					fieldWrapper = $(field.widget());
				}

				fieldWrapper.appendTo(fieldSet);
			});
			
			return fieldSet;
		},
		
		_wrapExistingFields: function () {
			var $this, options;
			this.element
				.find(':input')
				.each(function () {
					$this = $(this);
					options = {
						name: this.name,
						required: $this.attr("required"),
						pattern: $this.attr("pattern"),
						placeholder: $this.attr("placeholder"),
						decorate: false
					};
					
					switch (this.nodeName) {
						case "select":
							new $.fc.form.field.selectbox(options, this);
							break;
						case "textarea":
							new $.fc.form.field.textarea(options, this);
							break;
						case "input":
							switch (this.type) {
								case "image":
								case "button":
									break;
								case "checkbox":
									new $.fc.form.field.checkbox(options, this);
									break;
								case "radio":
									new $.fc.form.field.radio(options, this);
									break;
								case "date":
									new $.fc.form.field.date(options, this);
									break;
								default:
									new $.fc.form.field(options, this);
									break;
							}
					}
				});
		},

		_serialize: function () {
			return $(this.element[0]).serialize();
		},

		getField: function (fieldName) {
			return this.element
				.find(':input[name = "' + fieldName + '"]')
				.data('fcFieldWidget');
		},

		submit: function () {
			if (!this.valid()) {
				return;
			}

			var postData = this.serialize();

			this._trigger("beforesubmit", null, postData);

			if (this.options.type !== "ajax") {
				this.element[0].submit();
			} else {
				$.ajax({
					url: this.options.action,
					type: this.options.method,
					dataType: this.options.dataType || null,
					context: this,
					data: postData,
					success: function (data) {
						this._trigger("submit", null, { success: true, request: postData, response: data });
					},
					error: function () {
						this._trigger("submit", null, { success: false, request: postData });
					}
				});
				
				return false;
			}
		},

		valid: function () {
			this._trigger("beforevalidate", null, this);

			var field, result = true;

			this.element.find(':input').not('button').each(function () {
				field = $(this).data('fcFieldWidget');
				if (!field) {
					return;
				}

				if (!field.valid()) {
					result = false;
				}
			});

			return result;
		}
	});
})(jQuery);