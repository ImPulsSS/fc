(function ($) {
	$.fc.define("fc.workflow.block", {
		options: {
			template:  '<div id="<%=id%>" class="ui-state-default ui-corner-all fc-workflow-block fc-workflow-connectible <%=options.class%>">\
							<span class="fc-workflow-block-content"><%=options.text%></span>\
						</div>\
						<div id="<%=id%>_branch_left" class="fc-workflow-branch fc-workflow-branch-left">\
							<%=branches.left ? branches.left.render() : "" %>\
						</div>\
						<div id="<%=id%>_branch_right" class="fc-workflow-branch fc-workflow-branch-right">\
							<%=branches.right ? branches.right.render() : "" %>\
						</div>\
						<div class="ui-helper-clearfix"></div>'
		},

		_create: function () {
			this.id = $.fc.getId();
			this.branches = {};
		},

		addChild: function (branch, child) {
			if ($.isPlainObject(branch)) {
				var self = this;
				$.each(branch, function (branch, child) {
					self.addChild(branch, child);
				});
			} else {
				this.branches[branch] = child;
				child.parent = this;
				child.parentBranch = branch;
			}

			return this;
		},

		render: function (branch) {
			var self = this;
			if (typeof (branch) !== "undefined" && branch && this.branches[branch]) {
				$('#' + this.id + '_branch_' + branch)
					.html('<div class="fc-workflow-connection fc-workflow-connection-' + branch + '"></div>' + this.branches[branch].render());

				this.branches[branch].afterRender();

				this.options.workflow.refreshConnections();
			} else {
				return $.fc.tmpl(this.options.template, this);
			}
		},

		afterRender: function () {
			$.each(this.branches, function (index, branch) {
				branch.afterRender();
			});
		}
	});
})(jQuery);