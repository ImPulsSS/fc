(function ($) {
	$.fc.define("fc.workflow.iconblock", $.fc.workflow.block, {
		options: {
			icon: "",
			iconDirection: "left",
			template:  '<div id="<%=id%>" class="fc-workflow-block fc-workflow-iconblock fc-workflow-iconblock-<%=options.iconDirection%> <%=options.className%>">' +
				            '<div class="ui-state-default ui-corner-all fc-workflow-block-inner">' +
								'<span class="fc-workflow-block-content"><%=options.text%></span>' +
								'<%=renderControls()%>' +
							'</div>' +
							'<div class="fc-workflow-iconblock-icon ui-state-default"><span class="fc-workflow-icon <%=options.icon%>"></span></div>' +
						'</div>' +
						'<div id="<%=id%>_branch_left" class="fc-workflow-branch fc-workflow-branch-left">' +
							'<%=branches.left ? branches.left.render() : "" %>' +
						'</div>' +
						'<div id="<%=id%>_branch_right" class="fc-workflow-branch fc-workflow-branch-right">' +
							'<%=branches.right ? branches.right.render() : "" %>' +
						'</div>' +
						'<div class="ui-helper-clearfix"></div>'
		},

		bindEvents: function () {
			var self = this;

			this.element
				.click(function () {
				self.options.workflow
					.widget()
					.find(".ui-state-active")
					.removeClass("ui-state-active fc-workflow-shadow");

				self.element
					.children(".ui-state-default")
					.addClass("ui-state-active")
					.filter(".fc-workflow-block-inner")
					.addClass("fc-workflow-shadow");
			})
				.hover(function () {
					self.element
						.children(".ui-state-default")
						.addClass('ui-state-hover')
						.filter(".fc-workflow-block-inner")
						.addClass("fc-workflow-shadow");
				}, function () {
					var element = self.element
						.children(".ui-state-default");

					element.removeClass("ui-state-hover");

					if (!element.hasClass("ui-state-active")) {
						element.removeClass("fc-workflow-shadow");
					}
				});
		}
	});
})(jQuery);