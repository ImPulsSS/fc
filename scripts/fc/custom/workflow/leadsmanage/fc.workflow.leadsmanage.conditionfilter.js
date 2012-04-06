(function ($) {
	$.fc.widget("fc.workflow.leadsmanage.conditionfilter", $.fc.workflow, {
		options: {
		},

		_create: function () {
			this._base._create.call(this);

			this.record = this.options.record;
		},

		_init: function () {
			this.ifblock = new $.fc.workflow.iconblock({
				text: 'if block description',
				className: "fc-workflow-root",
				iconDirection: "left",
				icon: "fc-workflow-icon-if",
				workflow: this
			});

			this.thenblock = new $.fc.workflow.iconblock({
				text: 'then block description',
				className: "fc-workflow-root",
				iconDirection: "left",
				icon: "fc-workflow-icon-then",
				workflow: this
			});

			this.elseblock = new $.fc.workflow.iconblock({
				text: 'else block description',
				className: "fc-workflow-root",
				iconDirection: "left",
				icon: "fc-workflow-icon-else",
				workflow: this
			});

			this.ifblock.addChild("left", new $.fc.workflow.add({ workflow: this }));
			this.thenblock.addChild("left", new $.fc.workflow.add({ workflow: this }));
			this.elseblock.addChild("left", new $.fc.workflow.add({ workflow: this }));
		},

		_render: function () {
			this.element.empty();

			this.element.append(this.ifblock.render());
			this.ifblock.afterRender();

			this.element.append(this.thenblock.render());
			this.thenblock.afterRender();

			this.element.append(this.elseblock.render());
			this.elseblock.afterRender();

			this.refreshConnections();
		},

		_addBlock: function (record, parent, branch, nextBlock) {
			var	self = this,
				result = new $.fc.workflow.leadsmanage.block($.extend(true, {}, self.options.defaultBlockOptions, {
						text: record.Name,
						record: record,
						workflow: self
					})).addChild({
						left: nextBlock || new $.fc.workflow.add({ workflow: self })
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

			$.fc.dialog.prompt("New condition", "Block name", "New condition", function (blockName) {
				if (!blockName) {
					return;
				}

				self._addBlock({ Name: blockName }, parent, branch, sender);

				parent.render(branch);
			});
		},

		refreshConnections: function () {
			var ifblock = document.getElementById(this.ifblock.id),
				thenblock = document.getElementById(this.thenblock.id),
				elseblock = document.getElementById(this.elseblock.id);

			this._base.refreshConnections.call(this, ifblock, thenblock);
			this._base.refreshConnections.call(this, thenblock, elseblock);
			this._base.refreshConnections.call(this, elseblock);
		},

		_serialize: function () {
			return this.record;
		},

		_deserialize: function (data) {
			var self = this,
				block = null,
				children = {};

		}
	});
})(jQuery);