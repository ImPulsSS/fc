(function ($) {
	var __fc_workflow_nextBlock = {
		__ClassName: "Fc.LeadsManage.Library.Objects.Workflow.CampaignActions.NextBlockItem"
	};

	$.fc.define("fc.workflow.leadsmanage.block", $.fc.workflow.block, {
		options: {
			record: {}
		},

		_create: function () {
			$.fc.workflow.block.prototype._create.call(this);

			this.record = this.options.record;
		},

		serialize: function () {
			this._trigger("beforeserialize");

			var result = $.extend(true, {
						__ClassName: "Fc.LeadsManage.Library.Objects.Workflow.ConditionBlockItem",
						Uid: null,
						ID: 0,
						Name : "New condition block",
						IsActive: true,
						ConditionFilters: [],
						TrueActions: [],
						FalseActions: [],
						HigherImportanceLevel: 0,
						Debug : {
							__ClassName: "Fc.LeadsManage.Library.Objects.Workflow.ConditionBlockDebugItem",
							Uid: null,
							ID: 0,
							IsActive: true,
							PreventDoAction: true,
							MaxProcessedLeadCount: 100
						}
					}, this.record),
				trueBranches = this.branches.left ?
					this.branches.left.serialize() || [] :
					[],
				falseBranches = this.branches.right ?
					this.branches.right.serialize() || [] :
					[];

			if (trueBranches.length) {
				result.TrueActions.push($.extend(true, { Name: trueBranches[0].Name }, __fc_workflow_nextBlock));
			}

			if (falseBranches.length) {
				result.FalseActions.push($.extend(true, { Name: falseBranches[0].Name }, __fc_workflow_nextBlock));
			}

			result = [ result ].concat(trueBranches, falseBranches);

			this._trigger("serialize", result);

			return result;
		}
	});
})(jQuery);