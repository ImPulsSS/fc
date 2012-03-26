(function ($) {
	$.fc.widget("fc.workflow.add", $.fc.workflow.block, {
		options: {
			text: "+",
			css: {
				width: null
			}
		},

		_init: function () {
			$.fc.workflow.block.prototype._init.call(this);

			this.element.click(function () {
				$.fc.dialog.alert("New condition block", "Condition block creation will be here");
			});
		}
	});
})(jQuery);