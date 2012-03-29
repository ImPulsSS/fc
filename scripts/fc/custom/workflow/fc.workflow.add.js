(function ($) {
	$.fc.define("fc.workflow.add", $.fc.workflow.block, {
		options: {
			template:  '<div id="<%=id%>" class="fc-workflow-block fc-workflow-add fc-workflow-connectible">\
							<span class="fc-workflow-add-inner">\
								<span class="fc-workflow-block-content">+</span>\
							</span>\
						</div>\
						<div id="<%=id%>_branch_left" class="fc-workflow-branch fc-workflow-branch-left">\
							<%=branches.left ? branches.left.render() : "" %>\
						</div>\
						<div id="<%=id%>_branch_right" class="fc-workflow-branch fc-workflow-branch-right">\
							<%=branches.right ? branches.right.render() : "" %>\
						</div>\
						<div class="ui-helper-clearfix"></div>'
		},

		afterRender: function () {
			var self = this,
				parent = self.parent,
				branch = self.parentBranch;

			$('#' + this.id)
				.find('.fc-workflow-add-inner')
				.click(function () {
					$.fc.dialog.prompt("New condition block", "Condition block name", "New condition block", function (blockName) {
						if (!blockName) {
							return;
						}

						parent.addChild(branch,
							new $.fc.workflow.add().addChild({
								left: new $.fc.workflow.block({
										text: blockName,
										workflow: parent.options.workflow
									}).addChild({
										left: self,
										right: new $.fc.workflow.add({ workflow: parent.options.workflow })
									})
							})
						);

						parent.render(branch);
					});
				});

			$.each(this.branches, function (index, branch) {
				branch.afterRender();
			});
		}
	});
})(jQuery);