(function ($) {
	$.fc.widget("fc.workflow", {
		options: {
			api: {

			}
		},

		_create: function () {
			var self = this;

			this.element
				.addClass(this.widgetBaseClass);

			this.load();
		},

		_destroy: function () {
			this.element
				.removeClass(this.widgetBaseClass);
		},

		load: function () {
			this.root = new $.fc.workflow.iconblock({
				text: 'Capturing: All new subscribers<br><a href="#">Specify new subscribers</a>',
				"class": 'fc-workflow-root',
				iconDirection: "bottom",
				workflow: this
			}).addChild({
				left: new $.fc.workflow.add({ workflow: this }).addChild({
					left: new $.fc.workflow.block({
						text: 'Condition block #1<br><a href="#">edit</a>',
						workflow: this
					}).addChild({
						left: new $.fc.workflow.add({ workflow: this }).addChild({
							left: new $.fc.workflow.block({
								text: 'Condition block #2<br><a href="#">edit</a>',
								workflow: this
							}).addChild({
								left: new $.fc.workflow.add({ workflow: this }),
								right: new $.fc.workflow.add({ workflow: this }).addChild({
									left: new $.fc.workflow.block({
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
							left: new $.fc.workflow.block({
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
				"class": 'fc-workflow-root',
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
				topOffset = topBlock.offset();

			this.element
				.find('.fc-workflow-connectible')
				.not('.fc-workflow-root')
				.each(function () {
					var block = $(this),
						branch = block.closest('.fc-workflow-branch'),
						branchName = branch.hasClass('fc-workflow-branch-left') ?
							"left" :
							"right",
						connection = block.siblings('.fc-workflow-connection'),
						blockOffset = block.offset(),
						parentOffset = branch.siblings('.fc-workflow-connectible').offset();

					if (!connection.length) {
						connection = $('<div></div>', { "class": "fc-workflow-connection fc-workflow-connection-" + branchName })
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

					connection = $("#" + this.id + "_top");
					if (!connection.length && !block.siblings('.fc-workflow-branch').children().length) {
						if (!connection.length) {
							connection = $('<div></div>', { id: this.id + "_top", "class": "fc-workflow-connection fc-workflow-connection-left" })
								.insertBefore(topBlock);
						}
					}

					connection
						.css({
							height: topOffset.top - blockOffset.top,
							left: blockOffset.left + block.width() / 2 - (block.outerWidth(true) - block.width()) + 1,
							top: blockOffset.top - 6
						});
				});
		}
	});
})(jQuery);