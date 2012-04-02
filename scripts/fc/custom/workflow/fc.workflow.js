(function ($) {
	$.fc.widget("fc.workflow", {
		options: {
			api: {

			}
		},

		_create: function () {
			this.element
				.addClass(this.widgetBaseClass);

			this.load();
		},

		_destroy: function () {
			this.element
				.removeClass(this.widgetBaseClass);
		},

		addBlock: function (sender) {
			var	self = this,
				parent = sender.parent,
				branch = sender.parentBranch;

			$.fc.dialog.prompt("New condition block", "Condition block name", "New condition block", function (blockName) {
				if (!blockName) {
					return;
				}

				parent.addChild(branch,
					new $.fc.workflow.add().addChild({
						left: new $.fc.workflow.iconblock({
							text: blockName,
							workflow: self
						}).addChild({
							left: sender,
							right: new $.fc.workflow.add({ workflow: self })
						})
					})
				);

				parent.render(branch);
			});
		},

		load: function () {
			this.root = new $.fc.workflow.iconblock({
				text: 'Capturing: All new subscribers<br><a href="#">Specify new subscribers</a>',
				className: 'fc-workflow-root',
				iconDirection: "bottom",
				workflow: this
			}).addChild({
				left: new $.fc.workflow.add({ workflow: this }).addChild({
					left: new $.fc.workflow.iconblock({
						text: 'Condition block #1<br><a href="#">edit</a>',
						workflow: this
					}).addChild({
						left: new $.fc.workflow.add({ workflow: this }).addChild({
							left: new $.fc.workflow.iconblock({
								text: 'Condition block #2<br><a href="#">edit</a>',
								workflow: this
							}).addChild({
								left: new $.fc.workflow.add({ workflow: this }),
								right: new $.fc.workflow.add({ workflow: this }).addChild({
									left: new $.fc.workflow.iconblock({
										text: 'Condition block #4<br><a href="#">edit</a>',
										workflow: this
									}).addChild({
										left: new $.fc.workflow.add({ workflow: this }),
										right: new $.fc.workflow.add({ workflow: this })
									})
								})
							})
						}),
						right: new $.fc.workflow.add({ workflow: this }).addChild({
							left: new $.fc.workflow.iconblock({
								text: 'Condition block #3<br><a href="#">edit</a>',
								workflow: this
							}).addChild({
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

					connection
						.css({
							height: topOffset.top - blockOffset.top - (isIe ? block.height() + topBlock.height() : 0),
							left: blockOffset.left + block.width() / 2 - (block.outerWidth(true) - block.width()) + (isIe ? -1 : 1),
							top: blockOffset.top - (isIe ? 36 : 6)
						});
				});
		}
	});
})(jQuery);