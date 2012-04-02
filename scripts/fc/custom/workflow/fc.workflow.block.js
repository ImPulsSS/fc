(function ($) {
	$.fc.define("fc.workflow.block", {
		options: {
			template:  '<div id="<%=id%>" class="ui-state-default ui-corner-all fc-workflow-block <%=options.className%>">\
							<span class="fc-workflow-block-content"><%=options.text%></span>\
							<%=renderControls()%>\
						</div>\
						<div id="<%=id%>_branch_left" class="fc-workflow-branch fc-workflow-branch-left">\
							<%=branches.left ? branches.left.render() : "" %>\
						</div>\
						<div id="<%=id%>_branch_right" class="fc-workflow-branch fc-workflow-branch-right">\
							<%=branches.right ? branches.right.render() : "" %>\
						</div>\
						<div class="ui-helper-clearfix"></div>',

			controlTemplate: '<div class="fc-workflow-control <%=(obj.className || "fc-workflow-control-left")%>" data-control="<%=name%>"><div class="fc-workflow-control-inner ui-state-default ui-corner-all"><span class="ui-icon <%=icon%>"><%=title%></span></div></div>',

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
				},
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
		},

		_create: function () {
			this.id = $.fc.getId();
			this.branches = {};
		},

		_destroy: function () {
			(this.element || $('#' + this.id))
				.unbind("." + this.id)
				.find('.fc-workflow-control')
				.unbind("." + this.id);

			this.options.workflow.element
				.find('[data-block="' + this.id + '"]')
				.remove();

			$.each(this.branches, function (branch, child) {
				child._destroy();
			});
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

		afterRender: function () {
			this.element = $('#' + this.id);

			this.bindEvents();

			this.afterRenderControls();

			$.each(this.branches, function (index, branch) {
				branch.afterRender();
			});
		},

		afterRenderControls: function () {
			var self = this;

			this.element
				.find('.fc-workflow-control')
				.each(function () {
					var control = $(this),
						name = control.data('control');

					if (control.data('block')) {
						return;
					}

					control
						.bind("mouseenter." + self.id, function () {
							$(this).children(".ui-state-default").addClass("ui-state-hover");
						})
						.bind("mouseleave." + self.id, function () {
							$(this).children(".ui-state-default").removeClass("ui-state-hover");
						})
						.data('block', self);

					if (!self.options.controls[name]) {
						return;
					}

					$.each(self.options.controls[name], function (index, value) {
						if (index in $.fc.attrFn) {
							control[index].apply(control, $.isArray(value) ? value : [ value ]);
						}
					});
				});
		},

		bindEvents: function () {
			var self = this;

			this.element
				.bind("click." + this.id, function () {
					self.options.workflow
						.widget()
						.find(".ui-state-active")
						.removeClass("ui-state-active fc-workflow-shadow");

					self.element
						.addClass("ui-state-active fc-workflow-shadow");
				})
				.bind("mouseenter." + this.id, function () {
					self.element
						.addClass('ui-state-hover fc-workflow-shadow');
				})
				.bind("mouseleave." + this.id, function () {
					self.element
						.removeClass('ui-state-hover');

					if (!self.element.hasClass("ui-state-active")) {
						self.element.removeClass("fc-workflow-shadow");
					}
				});
		},

		removeChild: function (branch) {
			this.branches[branch]._destroy();

			delete this.branches[branch];

			$('#' + this.id + '_branch_' + branch).empty();

			this.options.workflow.refreshConnections();
		},

		render: function (branch) {
			if (typeof (branch) !== "undefined" && branch && this.branches[branch]) {
				$('#' + this.id + '_branch_' + branch)
					.html(this.branches[branch].render());

				this.branches[branch].afterRender();

				this.options.workflow.refreshConnections();
			} else {
				return $.fc.tmpl(this.options.template, this);
			}
		},

		renderControls: function () {
			if (!this.options.controls) {
				return;
			}

			var self = this,
				result = [];

			$.each(this.options.controls, function (index, control) {
				result.push($.fc.tmpl(self.options.controlTemplate, control));
			});

			return result.join('');
		},

		swapBranches: function () {
			var leftBranch = this.branches.left;

			this.branches.left = this.branches.right;
			if (this.branches.left) {
				this.branches.left.parentBranch = "left";
			}

			this.render("left");

			this.branches.right = leftBranch;
			if (this.branches.right) {
				this.branches.right.parentBranch = "right";
			}

			this.render("right");
		}
	});
})(jQuery);