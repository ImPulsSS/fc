(function ($) {
	$.fc.widget("fc.workflow", {
		implement: { serializable: $.fc.serializable },

		options: {
			api: {

			},

			defaultBlockOptions: {
				icon: "fc-workflow-icon-block",
				controls: {
					edit: {
						name: "edit",
						title: "Edit",

						icon: "ui-icon-pencil",
						click: function () {
							alert($(this).data('block').id);
						}
					},
					remove: {
						name: "remove",
						title: "Remove",
						className: "fc-workflow-control-right",
						icon: "ui-icon-close",
						click: function () {
							var self = $(this).data('block');
							$.fc.dialog.confirm("Condition block removing", "Are you sure you want to delete this condition block?", function (ok) {
								if (!ok) {
									return;
								}

								self.parent.removeChild(self.parentBranch);
							});
						}
					}
				}
			}
		},

		_create: function () {
			var self = this;

			this.element
				.addClass(this.widgetBaseClass);
		},

		_init: function () {
			this.root = new $.fc.workflow.iconblock({
				text: 'Capturing: All new subscribers<br><a href="#">Specify new subscribers</a>',
				className: 'fc-workflow-root',
				iconDirection: "bottom",
				icon: "fc-workflow-icon-start",
				workflow: this
			});

			this.top = new $.fc.workflow.iconblock({
				text: 'Capturing: All new subscribers<br><a href="#">Specify new subscribers</a>',
				className: 'fc-workflow-root',
				iconDirection: "top",
				icon: "fc-workflow-icon-complete",
				workflow: this
			});
		},

		_destroy: function () {
			this.element
				.removeClass(this.widgetBaseClass);
		},

		_render: function () {
			this.element.empty();

			this.element.append(this.root.render());
			this.root.afterRender();

			this.element.append(this.top.render());
			this.top.afterRender();

			this.refreshConnections();
		},

		_addBlock: function (text, parent, branch, nextBlock) {
			var	self = this,
				result = new $.fc.workflow.iconblock($.extend(true, {}, self.options.defaultBlockOptions, {
						text: text,
						workflow: self
					})).addChild({
						left: nextBlock,
						right: null
					});

			parent.addChild(branch, result);

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

				self._addBlock("blockName", parent, branch, sender);

				parent.render(branch);
			});
		},

		load: function () {
			this.root = new $.fc.workflow.iconblock({
				text: 'Capturing: All new subscribers<br><a href="#">Specify new subscribers</a>',
				className: 'fc-workflow-root',
				iconDirection: "bottom",
				icon: "fc-workflow-icon-start",
				workflow: this
			}).addChild({
				left: new $.fc.workflow.add({ workflow: this }).addChild({
					left: new $.fc.workflow.iconblock($.extend(true, {}, this.options.defaultBlockOptions, {
						text: 'Condition block #1<br><a href="#">edit</a>',
						workflow: this
					})).addChild({
						left: new $.fc.workflow.add({ workflow: this }).addChild({
							left: new $.fc.workflow.iconblock($.extend(true, {}, this.options.defaultBlockOptions, {
								text: 'Condition block #2<br><a href="#">edit</a>',
								workflow: this
							})).addChild({
								left: new $.fc.workflow.add({ workflow: this }),
								right: new $.fc.workflow.add({ workflow: this }).addChild({
									left: new $.fc.workflow.iconblock($.extend(true, {}, this.options.defaultBlockOptions, {
										text: 'Condition block #4<br><a href="#">edit</a>',
										workflow: this
									})).addChild({
										left: new $.fc.workflow.add({ workflow: this }),
										right: new $.fc.workflow.add({ workflow: this })
									})
								})
							})
						}),
						right: new $.fc.workflow.add({ workflow: this }).addChild({
							left: new $.fc.workflow.iconblock($.extend(true, {}, this.options.defaultBlockOptions, {
								text: 'Condition block #3<br><a href="#">edit</a>',
								workflow: this
							})).addChild({
								left: new $.fc.workflow.add({ workflow: this }),
								right: new $.fc.workflow.add({ workflow: this })
							})
						})
					})
				})
			});

			this.element.append(this.root.render());
			this.root.afterRender();

			this.top = new $.fc.workflow.iconblock({
				text: 'Capturing: All new subscribers<br><a href="#">Specify new subscribers</a>',
				className: 'fc-workflow-root',
				iconDirection: "top",
				icon: "fc-workflow-icon-complete",
				workflow: this
			});

			this.element.append(this.top.render());
			this.top.afterRender();

			this.refreshConnections();
		},

		refreshConnections: function () {
			var self = this,
				topBlock = $('#' + self.top.id),
				topOffset = topBlock.offset(),
				isIe = $.browser.msie && $.browser.version < 8;

			this.element
				.find('.fc-workflow-block')
				.not('.fc-workflow-root')
				.each(function () {
					var block = $(this),
						branch = block.closest('.fc-workflow-branch'),
						branchName = branch.hasClass('fc-workflow-branch-left') ?
							"left" :
							"right",
						connection = block.siblings('.fc-workflow-connection'),
						blockOffset = block.offset(),
						parentOffset = branch.siblings('.fc-workflow-block').offset();

					if (!connection.length) {
						connection = $('<div></div>', { id: this.id + "_connection_" + branchName, "data-block": this.id, "class": "fc-workflow-connection fc-workflow-connection-" + branchName })
							.insertBefore(block);
					}

					if (branchName === "right") {
						connection
							.addClass("ui-corner-tr")
							.css({
								width: blockOffset.left - parentOffset.left,
								left: parentOffset.left - blockOffset.left + block.outerWidth(true) / 2 - 1
							});
					}

					connection = $("#" + this.id + "_connection_top");
					if (!connection.length && !block.siblings('.fc-workflow-branch').children().length) {
						if (!connection.length) {
							connection = $('<div></div>', { id: this.id + "_connection_top", "data-block": this.id, "class": "fc-workflow-connection fc-workflow-connection-left" })
								.insertBefore(topBlock);
						}
					}

					connection.css({
						height: topOffset.top - blockOffset.top - (isIe ? topBlock.height() : 0),
						left: blockOffset.left + block.width() / 2 - (block.outerWidth(true) - block.width()) + (isIe ? -1 : 1),
						top: blockOffset.top - self.element.offset().top + block.outerHeight() / 2 - (isIe ? 36 : 0)
					});
				});
		}
	});
})(jQuery);