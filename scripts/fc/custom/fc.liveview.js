(function ($) {
	$.fc.widget("fc.liveview", {
		options: {
			api: {
				getUsers: "",
				getActions: "",
				getData: "",

				leadDetails: ""
			},

			channel: "",

			maxZoom: 10,
			gridSize: 20,

			template: '<h3><a href="#section2"><%=index%>. User <%=row.leadid%> did <%=row.action%> at <%=new Date()%></a></h3>' +
					   '<div><p>' +
					        '<%=formatedParams%>' +
					        '<p><a href="<%=options.api.leadDetails%><%=row.leadid%>" target="_blank">View user</a></p>' +
					   '</p></div>'
		},

		_create: function () {
			this.element
				.wrap('<div></div>');

			this.container = this.element
				.parent()
				.css({
					"position": "relative"
				})
				.addClass(this.widgetBaseClass);

			this._addFilterBlock();
		},

		_addMap: function () {
			if (!this.mapWrapper) {
				this.mapWrapper = $('<div></div>', {
					"id": $.fc.getId(),
					"class": this.widgetFullName + "-map",
					"css": {
						height: 400,
						"margin-bottom": 20
					}
				})
				.insertBefore(this.element);

				this.map = new google.maps.Map(this.mapWrapper[0], {
					zoom: 4,
					center: new google.maps.LatLng(40, -90),
					mapTypeId: google.maps.MapTypeId.ROADMAP
				});

				this.mapCluster = new MarkerClusterer(this.map, [], { maxZoom: this.options.maxZoom, gridSize: this.options.gridSize });
			}
		},

		_addFilterBlock: function () {
			var self = this,
				xhrCount = 0;

			this.filter = new $.fc.filter({
				title: "Settings",
				collapsed: false,
				animations: {
					expand: function () {
						$(this).slideDown(200);
					},
					collapse: function () {
						$(this).slideUp(200);
					}
				},
				fields: [/*{
						label: "Apikey",
						name: "apikey",
						type: "select",
						css: { "vertical-align": "top" },
						options: {
							url: self.options.api.getUsers,
							root: "users",
							map: [
								{ name: "value", mapping: "apikey" },
								{ name: "text", mapping: function () { return [ this.fname,  this.lname ].join(' '); } }
							]
						},
						required: true,
						render: function () {
							xhrCount++;
						},
						renderOptions: function () {
							$(this)
								.css("height", 100)
								.attr('multiple', true)
								.find('option')
									.attr('selected', true);

							if (--xhrCount > 0) {
								self.overlay.resize();
							} else {
								self.overlay.hide();
							}
						}
					}, */{
						label: "Apikey",
						name: "apikey",
						type: "text",
						required: true,
						value: "22b29980-81b9-4b3b-a50f-0c6ea7bc522b"
					}, {
						label: "Action",
						name: "action",
						type: "multiple",
						css: { "vertical-align": "top" },
						source: {
							store: {
								read: {
									url: self.options.api.getActions,
									root: "actions",
									map: [
										{ name: "value", mapping: "name" },
										{ name: "text", mapping: "title" }
									]
								}
							}
						},
						required: true
					}
				],

				buttons: {
					"Apply": function() {
						self.reset();
						self.filter.toggleView();
						self.applyFilters();
					}
				}
			});

			this.filter
				.widget()
				.prependTo(this.container);
		},

		_destroy: function () {
			this.element
				.unwrap();

			this.filter
				.widget()
				.remove();

			this.mapWrapper.remove();

			delete this.container;
			delete this.filter;
			delete this.mapCluster;
			delete this.map;
			delete this.mapWrapper;
		},

		applyFilters: function () {
			this.requestData(this.filter.element.serialize());
		},

		append: function (data) {
			if (this.element.text() === 'Waiting for actions...') {
				this.element.empty();
			}

			this.element
				.prepend($.fc.tmpl(this.options.template, {
					options: this.options,
					index: this.index++,
					row: data,
					formatedParams: $.map(data, function (item, key) {
						if (key === "leadid" || key === "action") {
							return null;
						}
						return "<b>" + key + "</b>: " + item;
					}).join('<br>')
				}))
				.accordion('destroy')
				.accordion({
					autoHeight: false,
					navigation: true
				});

			if (typeof (data.latitude) !== "undefined" && typeof (data.longitude) !== "undefined") {
				this.mapCluster.addMarker(
					new google.maps.Marker({
						position: new google.maps.LatLng(data.latitude, data.longitude),
						title: data.leadid
					}));
			}
		},

		requestData: function (filters) {
			var self = this;

			this.xhr = $.getJSON(this.options.api.getData, {
				channel: this.options.channel,
				filter: filters
			}, function(data) {
				if (data) {
					self.append(data);
				}
				self.applyFilters();
			});
		},

		reset: function () {
			this.index = 1;

			this._addMap();
			this.mapCluster.clearMarkers();

			this.element.html('Waiting for actions...');
		}
	});
})(jQuery);