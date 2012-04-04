(function ($) {
	var __fc_workflow_nextBlockClassName = "Fc.LeadsManage.Library.Objects.Workflow.CampaignActions.NextBlockItem";

	$.fc.widget("fc.workflow.leadsmanage", $.fc.workflow, {
		options: {
			defaultBlockOptions: {
				controls: {
					swap: {
						name: "swap",
						title: "Swap branches",
						className: "fc-workflow-control-bottom-right",
						icon: "ui-icon-refresh",
						click: function () {
							var self = $(this).data('block');
							$.fc.dialog.confirm("Condition block branches swapping", "Are you sure you want to swap branches?", function (ok) {
								if (!ok) {
									return;
								}

								self.swapBranches();
							});
						}
					}
				}
			}
		},

		_create: function () {
			$.fc.workflow.prototype._create.call(this);

			this.record = this.options.record;
		},

		_init: function () {
			this.root = new $.fc.workflow.leadsmanage.iconblock({
				text: 'Capturing: All new subscribers<br><a href="#">Specify new subscribers</a>',
				className: "fc-workflow-root",
				iconDirection: "bottom",
				icon: "fc-workflow-icon-start",
				workflow: this
			});

			this.top = new $.fc.workflow.leadsmanage.iconblock({
				text: 'Capturing: All new subscribers<br><a href="#">Specify new subscribers</a>',
				className: "fc-workflow-root",
				iconDirection: "top",
				icon: "fc-workflow-icon-complete",
				workflow: this
			});
		},

		_addBlock: function (record, parent, branch, nextBlock) {
			var	self = this,
				result = new $.fc.workflow.leadsmanage.iconblock($.extend(true, {}, self.options.defaultBlockOptions, {
						text: record.Name,
						record: record,
						workflow: self
					})).addChild({
						left: nextBlock || new $.fc.workflow.add({ workflow: self }),
						right: new $.fc.workflow.add({ workflow: self })
					});

			parent.addChild(branch,
				new $.fc.workflow.add({ workflow: self }).addChild({
					left: result
				})
			);

			return result;
		},

		addBlock: function (sender) {
			var	self = this,
				parent = sender.parent,
				branch = sender.parentBranch;

			$.fc.dialog.prompt("New condition block", "Condition block name", "New condition block", function (blockName) {
				if (!blockName) {
					return;
				}

				self._addBlock({ Name: blockName }, parent, branch, sender);

				parent.render(branch);
			});
		},

		serialize: function () {
			return $.extend(true, {
				Uid: null,
				ID: 0,
				CampaignID: 0,
				Title: "New workflow",
				IsActive: true,
				__ClassName: "Fc.LeadsManage.Library.Objects.Workflow.WorkFlowCampaignItem",
				ConditionBlocks: this.root.branches.left.serialize()
			}, this.record);
		},

		deserialize: function (data) {
			var self = this,
				block = null,
				children = {};

			this.record = data;

			$.each(data.ConditionBlocks, function (index, record) {
				if (children[record.Name]) {
					block = self._addBlock(record, children[record.Name].parent, children[record.Name].parentBranch);
					delete children[record.Name];
				} else {
					block = self._addBlock(record, self.root, "left");
				}

				$.each(record.TrueActions, function (key, action) {
					if (action.__ClassName === __fc_workflow_nextBlockClassName) {
						children[action.Name] = block.branches.left;
						block.record.TrueActions.splice(key, 1);
						return true;
					}
				});

				$.each(record.FalseActions, function (key, action) {
					if (action.__ClassName === __fc_workflow_nextBlockClassName) {
						children[action.Name] = block.branches.right;
						block.record.FalseActions.splice(key, 1);
						return true;
					}
				});
			});

			this.record.ConditionBlocks = [];

			this._render();
		}
	});
})(jQuery);