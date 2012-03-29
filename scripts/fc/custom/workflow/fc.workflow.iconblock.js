(function ($) {
	$.fc.define("fc.workflow.iconblock", $.fc.workflow.block, {
		options: {
			icon: "",
			iconDirection: "left",
			template:  '<div id="<%=id%>" class="fc-workflow-iconblock fc-workflow-iconblock-<%=options.iconDirection%> fc-workflow-connectible <%=options.class%>">\
				            <div class="ui-state-default ui-corner-all fc-workflow-block">\
								<span class="fc-workflow-block-content"><%=options.text%></span>\
								<div class="fc-workflow-iconblock-icon ui-state-default "></div>\
							</div>\
						</div>\
						<div id="<%=id%>_branch_left" class="fc-workflow-branch fc-workflow-branch-left">\
							<%=branches.left ? branches.left.render() : "" %>\
						</div>\
						<div id="<%=id%>_branch_right" class="fc-workflow-branch fc-workflow-branch-right">\
							<%=branches.right ? branches.right.render() : "" %>\
						</div>\
						<div class="ui-helper-clearfix"></div>'
		}
	});
})(jQuery);