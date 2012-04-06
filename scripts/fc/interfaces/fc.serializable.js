(function ($) {
	$.fc.serializable = {
		_serialize: function () {
		},

		_deserialize: function () {
		},

		serialize: function () {
			this._trigger("beforeserialize");

			var result = this._serialize.apply(this, arguments);

			this._trigger("serialize", null, result);

			return result;
		},

		deserialize: function () {
			this._trigger("beforedeserialize");

			this._deserialize.apply(this, arguments);

			this._trigger("deserialize");
		}
	};
})(jQuery);