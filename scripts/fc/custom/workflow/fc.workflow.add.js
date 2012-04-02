(function ($) {
	$.fc.define("fc.workflow.add", $.fc.workflow.block, {
		options: {
			template:  '<div id="<%=id%>" class="fc-workflow-block fc-workflow-add">\
							<span class="fc-workflow-block-inner">\
								<span class="fc-workflow-block-content">+</span>\
							</span>\
						</div>\
						<div id="<%=id%>_branch_left" class="fc-workflow-branch fc-workflow-branch-left">\
							<%=branches.left ? branches.left.render() : "" %>\
						</div>\
						<div id="<%=id%>_branch_right" class="fc-workflow-branch fc-workflow-branch-right">\
							<%=branches.right ? branches.right.render() : "" %>\
						</div>\
						<div class="ui-helper-clearfix"></div>',

			controls: null
		},

		afterRender: function () {
			var self = this;

			$('#' + this.id)
				.find('.fc-workflow-block-inner')
				.click(function () {
					self.options.workflow.addBlock(self);
				});

			$.each(this.branches, function (index, branch) {
				branch.afterRender();
			});
		}
	});
})(jQuery);