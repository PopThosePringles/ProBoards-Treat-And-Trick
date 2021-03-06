"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

$.widget("ui.treat_and_trick", $.ui.dialog, {
	_create: function _create() {
		$.ui.dialog.prototype._create.call(this);

		this.uiDialog.addClass("treat-and-trick-dialog");

		if (this.options.buttonPaneExtra) {
			this.uiDialog.find(".ui-dialog-buttonset").addClass("treat-and-trick-buttonset").prepend(this.options.buttonPaneExtra);
		}
	}
});

var Treat_And_Trick = function () {
	function Treat_And_Trick() {
		_classCallCheck(this, Treat_And_Trick);
	}

	_createClass(Treat_And_Trick, null, [{
		key: "init",
		value: function init() {
			this.PLUGIN_ID = "pd_treat_and_trick";
			this.PLUGIN_USER_KEY = "pd_treat_and_trick_user";
			this.PLUGIN_POST_KEY = "pd_treat_and_trick_post";

			this._USER_KEY_DATA = new Map();
			this._POST_KEY_DATA = new Map();

			this._inventory_icon_displayed = false;
			this._shop_icon_displayed = false;

			this.IMAGES = {};
			this.SETTINGS = {};

			this.inventory = null;

			this.setup();
			this.setup_user_data();
			this.setup_posts_data();

			this.ITEMS.init();

			this.api.init();

			$(this.ready.bind(this));
		}
	}, {
		key: "ready",
		value: function ready() {
			var location_check = yootil.location.search_results() || yootil.location.message_thread() || yootil.location.thread() || yootil.location.recent_posts();

			if (location_check) {
				Treat_And_Trick_Mini_Profile.init();
			}

			if (yootil.user.logged_in()) {
				if (!this.permissions.member_banned()) {
					if (yootil.location.posting() || yootil.location.thread()) {
						Treat_And_Trick_Post_Chance.init();
					}

					this.create_icon_wrapper();

					Treat_And_Trick_User_Settings.init();

					if (this.api.user.get(yootil.user.id()).tokens() > 0) {
						this.display_shop_icon();
					}

					if (this.api.user.has(yootil.user.id()).inventory_items()) {
						this.display_inventory_icon();
					}

					Treat_And_Trick_User_Settings.display_settings_icon();

					Treat_And_Trick_Droppables.init();
				}
			}
		}
	}, {
		key: "setup",
		value: function setup() {
			var plugin = pb.plugin.get(this.PLUGIN_ID);

			if (plugin && plugin.settings) {
				this.SETTINGS = plugin.settings;
				this.IMAGES = plugin.images;

				this.SETTINGS.starting_tokens = parseInt(this.SETTINGS.starting_tokens, 10);
			}
		}
	}, {
		key: "setup_user_data",
		value: function setup_user_data() {
			var user_data = proboards.plugin.keys.data[this.PLUGIN_USER_KEY];

			for (var key in user_data) {
				var _id = parseInt(key, 10) || 0;

				if (_id && !this._USER_KEY_DATA.has(_id)) {
					var value = !user_data[key] ? {

						// Tricks received

						t: {},

						// Starting sweets (tokens)

						s: this.SETTINGS.starting_tokens,

						// Inventory

						i: {}

					} : user_data[key];

					this._USER_KEY_DATA.set(_id, value);
				}
			}
		}
	}, {
		key: "setup_posts_data",
		value: function setup_posts_data() {
			this._POST_KEY_DATA.clear();

			var posts = pb.data("proboards.post");

			if (posts) {
				for (var key in posts) {
					var _id2 = parseInt(key, 10) || 0;

					if (_id2 && !this._POST_KEY_DATA.has(_id2)) {
						this._POST_KEY_DATA.set(_id2, {

							created_by: parseInt(posts[_id2].created_by, 10),
							key: yootil.key.value(this.PLUGIN_POST_KEY, _id2) || {}

						});
					}
				}
			}
		}
	}, {
		key: "create_icon_wrapper",
		value: function create_icon_wrapper() {
			$("<div class='treat-and-trick-icon-wrapper'></div>").appendTo($("body"));
		}
	}, {
		key: "display_shop_icon",
		value: function display_shop_icon() {
			if (this._shop_icon_displayed) {
				return;
			}

			this._shop_icon_displayed = true;

			var $icon = $("<div class='treat-and-trick-shop-icon'><img src='" + this.IMAGES.shopicon + "' title='Spend your treats at the shop' /></div>");

			$icon.on("click", function () {
				return new Treat_And_Trick_Shop();
			});
			$icon.appendTo(".treat-and-trick-icon-wrapper");
		}
	}, {
		key: "hide_shop_icon",
		value: function hide_shop_icon() {
			if (this._shop_icon_displayed) {
				$(".treat-and-trick-shop-icon").remove();
				this._shop_icon_displayed = false;
			}
		}
	}, {
		key: "display_inventory_icon",
		value: function display_inventory_icon() {
			var _this = this;

			if (this._inventory_icon_displayed) {
				return;
			}

			this._inventory_icon_displayed = true;

			var $icon = $("<div class='treat-and-trick-inventory-icon'><img src='" + this.IMAGES.inventory + "' title='Your bag of tricks' /></div>");

			if (!this.inventory) {
				this.inventory = new Treat_And_Trick_Inventory();
			}

			$icon.on("click", function () {
				return _this.inventory.open();
			});
			$icon.appendTo(".treat-and-trick-icon-wrapper");
		}
	}, {
		key: "hide_inventory_icon",
		value: function hide_inventory_icon() {
			if (this._inventory_icon_displayed) {
				$(".treat-and-trick-inventory-icon").remove();
				this._inventory_icon_displayed = false;
			}
		}
	}]);

	return Treat_And_Trick;
}();

Treat_And_Trick.api = function () {
	function _class() {
		_classCallCheck(this, _class);
	}

	_createClass(_class, null, [{
		key: "init",
		value: function init() {
			//let data = (yootil.user.logged_in())? this.get(yootil.user.id()).data() : {};

			//this._sync = new Treat_And_Trick_Sync(data, Treat_And_Trick_Sync_Handler);
		}
	}, {
		key: "sync",
		value: function sync() {

			console.log("Sync");
		}
	}]);

	return _class;
}();

Treat_And_Trick.api.refresh = function () {
	function _class2() {
		_classCallCheck(this, _class2);
	}

	_createClass(_class2, null, [{
		key: "user_data",
		value: function user_data() {
			Treat_And_Trick.setup_user_data();
		}
	}, {
		key: "posts_data",
		value: function posts_data() {
			Treat_And_Trick.setup_posts_data();
		}
	}]);

	return _class2;
}();

Treat_And_Trick.api.user = function () {
	function _class3() {
		_classCallCheck(this, _class3);
	}

	_createClass(_class3, null, [{
		key: "data",
		value: function data() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var id = parseInt(user_id, 10);

			if (id > 0) {
				if (!Treat_And_Trick._USER_KEY_DATA.has(id)) {
					Treat_And_Trick._USER_KEY_DATA.set(id, {

						t: {},
						s: Treat_And_Trick.SETTINGS.starting_tokens,
						i: {}

					});
				}

				return Treat_And_Trick._USER_KEY_DATA.get(id);
			}

			return { t: {}, s: 10, i: {} };
		}
	}, {
		key: "clear",
		value: function clear() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var user_data = this.data(user_id);

			return {
				data: function data() {
					user_data = { t: {}, s: 10, i: {} };
				}
			};
		}
	}, {
		key: "has",
		value: function has() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var user_data = this.data(user_id);

			return {
				inventory_items: function inventory_items() {
					var inventory = user_data.i;
					var has_inventory = false;

					for (var k in inventory) {
						if (parseInt(inventory[k], 10) > 0) {
							has_inventory = true;
							break;
						}
					}

					return has_inventory;
				}
			};
		}
	}, {
		key: "get",
		value: function get() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var user_data = this.data(user_id);

			return {
				unlimited: function unlimited() {
					if (yootil.user.is_staff() && $.inArrayLoose(user_id, Treat_And_Trick.SETTINGS.unlimited_keys) > -1) {
						return true;
					}

					return false;
				},
				tokens: function tokens() {
					return parseInt(user_data.s, 10);
				},
				data: function data() {
					return user_data;
				},
				inventory: function inventory() {
					return user_data.i;
				},
				inventory_trick_count: function inventory_trick_count(id) {
					var inventory = user_data.i;

					if (inventory[id]) {
						return inventory[id];
					}

					return 0;
				}
			};
		}
	}, {
		key: "set",
		value: function set() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var user_data = this.data(user_id);

			return {
				data: function data(_data) {
					user_data = _data;
				},
				inventory: function inventory() {
					var inventory = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

					user_data.i = inventory;
				}
			};
		}
	}, {
		key: "increase",
		value: function increase() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var user_data = this.data(user_id);

			return {
				tokens: function tokens() {
					var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

					user_data.s += parseInt(amount, 10);
				},
				inventory_trick: function inventory_trick(id, amount) {
					var inventory = user_data.i;

					if (inventory[id]) {
						inventory[id] += amount || 1;
					} else {
						inventory[id] = 1;
					};

					user_data.i = inventory;
				}
			};
		}
	}, {
		key: "decrease",
		value: function decrease() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var user_data = this.data(user_id);

			return {
				tokens: function tokens() {
					var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

					var current_tokens = Treat_And_Trick.api.user.get(user_id).tokens();
					var new_amount = current_tokens - parseInt(amount, 10);

					if (new_amount < 0) {
						new_amount = 0;
					}

					user_data.s = new_amount;
				},
				inventory_trick: function inventory_trick(id, amount) {
					var inventory = Treat_And_Trick.api.user.get(user_id).inventory();

					if (inventory[id]) {
						inventory[id] -= amount || 1;

						if (inventory[id] <= 0) {
							delete inventory[id];
						}
					}

					user_data.i = inventory;
				}
			};
		}
	}, {
		key: "save",
		value: function save() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
			var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			return yootil.key.set(Treat_And_Trick.PLUGIN_USER_KEY, this.data(user_id), user_id, callback);
		}
	}, {
		key: "space",
		value: function space() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var user_data = this.data(user_id);

			return {
				used: function used() {
					return JSON.stringify(user_data).length;
				},
				left: function left() {
					return pb.data("plugin_max_key_length") - Treat_And_Trick.api.user.space(user_id).used();
				}
			};
		}
	}, {
		key: "sync",
		value: function sync(user_id) {
			if (user_id != yootil.user.id()) {
				return;
			}

			var user_data = this.data(user_id);

			if (!user_data) {
				return null;
			}

			this._sync.update(user_data);
		}
	}]);

	return _class3;
}();

Treat_And_Trick.api.member = function () {
	function _class4() {
		_classCallCheck(this, _class4);
	}

	_createClass(_class4, null, [{
		key: "save",
		value: function save(id) {

			var data = Treat_And_Trick.api.user.get(id).data() || {};

			return {
				avatar: function avatar(flipped) {
					if (!data.t) {
						data.t = {};
					}

					data.t.af = [flipped, parseInt(yootil.user.id(), 10)];

					yootil.key.set(Treat_And_Trick.PLUGIN_USER_KEY, data, id);
				}
			};
		}
	}, {
		key: "get",
		value: function get(id) {
			var _data2 = yootil.key.value(Treat_And_Trick.PLUGIN_USER_KEY, id) || {};

			return {
				data: function data() {
					return _data2;
				},
				avatar_flipped: function avatar_flipped() {
					if (_data2 && _data2.t && _data2.t.af && Array.isArray(_data2.t.af) && _data2.t.af[0]) {
						return true;
					}

					return false;
				},
				avatar_flipped_last_user: function avatar_flipped_last_user() {
					if (_data2 && _data2.t && _data2.t.af && Array.isArray(_data2.t.af)) {
						if (_data2.t.af[1] == parseInt(yootil.user.id(), 10)) {
							return true;
						}
					}

					return false;
				}
			};
		}
	}]);

	return _class4;
}();

Treat_And_Trick.api.post = function () {
	function _class5() {
		_classCallCheck(this, _class5);
	}

	_createClass(_class5, null, [{
		key: "data",
		value: function data() {
			var post_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			var id = parseInt(post_id, 10);

			if (id > 0) {
				if (Treat_And_Trick._POST_KEY_DATA.has(id)) {
					return Treat_And_Trick._POST_KEY_DATA.get(id);
				}
			}

			return {};
		}
	}, {
		key: "get",
		value: function get(post_id) {
			var _data3 = this.data(post_id);
			var key_data = _data3 && _data3.key ? _data3.key : {};

			return {
				data: function data() {
					return _data3;
				},
				avatar_flipped: function avatar_flipped() {
					if (key_data.t && key_data.t.af && Array.isArray(key_data.t.af) && key_data.t.af[0]) {
						return true;
					}

					return false;
				},
				avatar_flipped_last_user: function avatar_flipped_last_user() {
					if (key_data.t && key_data.t.af && Array.isArray(key_data.t.af)) {
						if (key_data.t.af[1] == parseInt(yootil.user.id(), 10)) {
							return true;
						}
					}

					return false;
				},
				created_by: function created_by() {
					return _data3.created_by;
				}
			};
		}
	}, {
		key: "save",
		value: function save(post_id) {
			var data = this.get(post_id);
			var key_data = data && data.key ? data.key : {};

			return {
				avatar_flipped: function avatar_flipped(flipped) {
					if (!key_data.t) {
						key_data.t = {};
					}

					key_data.t.af = [flipped, parseInt(yootil.user.id(), 10)];

					yootil.key.set(Treat_And_Trick.PLUGIN_POST_KEY, key_data, post_id);
				}
			};
		}
	}]);

	return _class5;
}();

Treat_And_Trick.permissions = function () {
	function _class6() {
		_classCallCheck(this, _class6);
	}

	_createClass(_class6, null, [{
		key: "member_banned",
		value: function member_banned() {
			var user_id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

			if (!Treat_And_Trick.SETTINGS.banned_members.length) {
				return false;
			}

			user_id = user_id || yootil.user.id();

			if ($.inArrayLoose(user_id, Treat_And_Trick.SETTINGS.banned_members) > -1) {
				return true;
			}

			return false;
		}
	}, {
		key: "group_can_trick",
		value: function group_can_trick() {
			if (!Treat_And_Trick.SETTINGS.allowed_to_trick.length) {
				return true;
			}

			var user_groups = yootil.user.group_ids();

			for (var g = 0, l = user_groups.length; g < l; g++) {
				if ($.inArrayLoose(user_groups[g], Treat_And_Trick.SETTINGS.allowed_to_trick) > -1) {
					return true;
				}
			}

			return false;
		}
	}]);

	return _class6;
}();

var Treat_And_Trick_Post_Chance = function () {
	function Treat_And_Trick_Post_Chance() {
		_classCallCheck(this, Treat_And_Trick_Post_Chance);
	}

	_createClass(Treat_And_Trick_Post_Chance, null, [{
		key: "init",
		value: function init() {
			var _this2 = this;

			this._submitted = false;
			this._tokens_added = 0;
			this._hook = yootil.location.posting_thread() ? "thread_new" : yootil.location.thread() ? "post_quick_reply" : "post_new";

			var $the_form = yootil.form.any_posting();

			if ($the_form.length) {
				$the_form.on("submit", function () {

					_this2._submitted = true;
					_this2.set_on();
				});
			}
		}
	}, {
		key: "set_on",
		value: function set_on() {
			if (!yootil.location.editing()) {
				var user_id = yootil.user.id();
				var tokens_to_add = this.token_chance();

				if (tokens_to_add) {
					if (this._submitted) {
						if (this._tokens_added) {
							Treat_And_Trick.api.user.decrease(user_id).tokens(this._tokens_added);
						}

						this._tokens_added = tokens_to_add;

						Treat_And_Trick.api.user.increase(user_id).tokens(tokens_to_add);
						yootil.key.set_on(Treat_And_Trick.PLUGIN_USER_KEY, Treat_And_Trick.api.user.get(user_id).data(), user_id, this._hook);
						Treat_And_Trick.api.sync();
					}
				}
			}
		}
	}, {
		key: "token_chance",
		value: function token_chance() {
			var current_tokens = Treat_And_Trick.api.user.get(yootil.user.id()).tokens();

			//if(current_tokens > 0){
			//	return;
			//}

			var rand = Math.random() * 100;
			var tokens = 0;

			if (rand < 1) {
				tokens = 20;
			} else if (rand < 10) {
				tokens = 12;
			} else if (rand < 40) {
				tokens = 6;
			} else if (rand < 50) {
				tokens = 5;
			} else if (rand < 60) {
				tokens = 3;
			} else if (rand < 70) {
				tokens = 2;
			} else if (rand < 80) {
				tokens = 1;
			}

			return tokens;
		}
	}]);

	return Treat_And_Trick_Post_Chance;
}();

var Treat_And_Trick_Sync = function () {
	function Treat_And_Trick_Sync() {
		var _this3 = this;

		var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
		var handler = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

		_classCallCheck(this, Treat_And_Trick_Sync);

		if (!handler || typeof handler.change == "undefined") {
			return;
		}

		this._trigger_caller = false;
		this._handler = handler;
		this._key = "treat_and_trick_data_sync_" + yootil.user.id();

		// Need to set the storage off the bat

		yootil.storage.set(this._key, data, true, true);

		// Delay adding event (IE issues yet again)

		setTimeout(function () {
			return $(window).on("storage", function (evt) {
				if (evt && evt.originalEvent && evt.originalEvent.key == _this3._key) {

					// IE fix

					if (_this3._trigger_caller) {
						_this3._trigger_caller = false;
						return;
					}

					var event = evt.originalEvent;
					var old_data = event.oldValue;
					var new_data = event.newValue;

					// If old == new, don't do anything

					if (old_data != new_data) {
						_this3._handler.change(JSON.parse(new_data), JSON.parse(old_data));
					}
				}
			});
		}, 100);
	}

	// For outside calls to trigger a manual update

	_createClass(Treat_And_Trick_Sync, [{
		key: "update",
		value: function update() {
			var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			this._trigger_caller = true;
			yootil.storage.set(this._key, data, true, true);
		}
	}, {
		key: "key",
		get: function get() {
			return this._key;
		}
	}]);

	return Treat_And_Trick_Sync;
}();

;

var Treat_And_Trick_Sync_Handler = function Treat_And_Trick_Sync_Handler() {
	_classCallCheck(this, Treat_And_Trick_Sync_Handler);
};

;

var Treat_And_Trick_Mini_Profile = function () {
	function Treat_And_Trick_Mini_Profile() {
		_classCallCheck(this, Treat_And_Trick_Mini_Profile);
	}

	_createClass(Treat_And_Trick_Mini_Profile, null, [{
		key: "init",
		value: function init() {
			this.using_custom = false;
			this.add_stats_to_mini_profiles();
			yootil.event.after_search(this.add_stats_to_mini_profiles, this);
		}
	}, {
		key: "add_stats_to_mini_profiles",
		value: function add_stats_to_mini_profiles() {
			var _this4 = this;

			var $mini_profiles = yootil.get.mini_profiles();

			if (!$mini_profiles.length || $mini_profiles.find(".treat-and-trick-user-stats").length) {
				return;
			}

			$mini_profiles.each(function (index, item) {
				var $mini_profile = $(item);
				var $elem = $mini_profile.find(".treat-and-trick-user-stats");
				var $user_link = $mini_profile.find("a.user-link:first");
				var $info = $mini_profile.find(".info");

				if (!$elem.length && !$info.length) {
					return;
				}

				if ($user_link.length == 1) {
					var user_id = parseInt($user_link.attr("data-id"), 10);

					if (!user_id) {
						return;
					}

					Treat_And_Trick.api.refresh.user_data();
					Treat_And_Trick.api.refresh.posts_data();

					var using_info = false;

					if ($elem.length) {
						_this4.using_custom = true;
					} else {
						using_info = true;
						$elem = $("<div class='treat-and-trick-user-stats'></div>");
					}

					var tokens = yootil.number_format(Treat_And_Trick.api.user.get(user_id).tokens());

					var html = "";

					html += "<span class='treat-and-trick-stats-tokens'>Treats: <img title='Treats Earned' src='" + Treat_And_Trick.IMAGES.candy16 + "' /> x " + tokens + "</span>";

					$elem.html(html);

					if (using_info) {
						$info.prepend($elem);
					}

					$elem.show();
				}
			});
		}
	}]);

	return Treat_And_Trick_Mini_Profile;
}();

;

var Treat_And_Trick_Dialog = function Treat_And_Trick_Dialog() {
	var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	    _ref$title = _ref.title,
	    title = _ref$title === undefined ? "Error" : _ref$title,
	    _ref$html = _ref.html,
	    html = _ref$html === undefined ? "An unknown error has occurred." : _ref$html,
	    _ref$width = _ref.width,
	    width = _ref$width === undefined ? 350 : _ref$width,
	    _ref$height = _ref.height,
	    height = _ref$height === undefined ? 200 : _ref$height,
	    _ref$extra = _ref.extra,
	    extra = _ref$extra === undefined ? "" : _ref$extra,
	    _ref$buttons = _ref.buttons,
	    buttons = _ref$buttons === undefined ? [] : _ref$buttons,
	    _ref$klass = _ref.klass,
	    klass = _ref$klass === undefined ? "" : _ref$klass,
	    _ref$modal = _ref.modal,
	    modal = _ref$modal === undefined ? true : _ref$modal,
	    _ref$draggable = _ref.draggable,
	    draggable = _ref$draggable === undefined ? false : _ref$draggable;

	_classCallCheck(this, Treat_And_Trick_Dialog);

	return $("<div></div>").append(html).treat_and_trick({

		title: title,
		modal: modal,
		resizable: false,
		draggable: draggable,
		autoOpen: false,
		width: width,
		height: height,
		dialogClass: "treat-and-trick-info-dialog " + klass,
		id: id,
		buttonPaneExtra: extra,
		buttons: buttons

	});
};

var Treat_And_Trick_Shop = function () {
	function Treat_And_Trick_Shop() {
		_classCallCheck(this, Treat_And_Trick_Shop);

		var tokens = Treat_And_Trick.api.user.get(yootil.user.id()).tokens();
		var user_id = yootil.user.id();

		if (tokens <= 0 && !Treat_And_Trick.api.user.get(user_id).unlimited()) {
			new Treat_And_Trick_Dialog({

				title: "No Treats",
				msg: "You currently have no treats, however, you have a chance to earn more when you post.",
				width: 350,
				height: 150

			});

			return false;
		}

		// Change this to check total tricks the user has current bought,
		// and then check the space left.

		if (!Treat_And_Trick.api.user.space(user_id).left()) {
			new Treat_And_Trick_Dialog({

				title: "Error",
				msg: "You can not buy anymore tricks from the shop, your inventory is full.",
				width: 350,
				height: 150

			});

			return false;
		}

		this.show_shop();
	}

	_createClass(Treat_And_Trick_Shop, [{
		key: "show_shop",
		value: function show_shop() {
			var $dialog = new Treat_And_Trick_Dialog({

				title: "Treat and Trick - Shop",
				html: this.create_shop_html(),
				width: 750,
				height: 450,
				draggable: true,
				extra: this.build_button_pane_extra(),
				klass: "treat-and-trick-dialog-shop",

				buttons: [{

					text: "Close",
					click: function click() {
						$(this).treat_and_trick("close");
					}

				}]

			});

			$dialog.treat_and_trick("open");
		}
	}, {
		key: "build_button_pane_extra",
		value: function build_button_pane_extra() {
			var $extra = $("<div class='treat-and-trick-dialog-button-pane-extra'></div>");
			var tokens = Treat_And_Trick.api.user.get(yootil.user.id()).tokens();

			if (Treat_And_Trick.api.user.get(yootil.user.id()).unlimited()) {
				tokens = "Unlimited";
			}

			$extra.append($('<button type="button" id="treat-and-trick-left-button" class="ui-button"><span class="ui-button-text"><span id="treat-and-trick-left-counter"><img src="' + Treat_And_Trick.IMAGES.candy16 + '" /> <span>' + tokens + '</span></span></span></button>').on("click", function () {

				new Treat_And_Trick_Dialog({

					title: "Treats",
					html: "This is the amount of treats you have left to send.<br /><br />When posting, you have chance to earn more treats.",
					width: 350,
					height: 160

				}).treat_and_trick("open");
			}));

			$extra.append(this.create_pane_inventory());

			return $extra;
		}
	}, {
		key: "create_pane_inventory",
		value: function create_pane_inventory() {
			var $html = $("<span class='treat-and-trick-dialog-pane-inventory'></span>");
			var item_list = Treat_And_Trick.ITEMS.get_list();

			for (var key in item_list) {
				var count = Treat_And_Trick.api.user.get(yootil.user.id()).inventory_trick_count(key);

				if (count > 99) {
					count = "99+";
				}

				$html.append("<span data-inventory-id='" + key + "' class='treat-and-trick-dialog-pane-inventory-item trick-tiptip' title='" + item_list[key].desc + "'><img src='" + item_list[key].image + "' /><span class='treat-and-trick-dialog-pane-inventory-item-count'>" + count + "</span></span>");
			}

			$html.find(".trick-tiptip").tipTip({

				defaultPosition: "right",
				maxWidth: "350px"

			});

			return $html;
		}
	}, {
		key: "create_shop_html",
		value: function create_shop_html() {
			//let shop = "<div class='treat-and-trick-shop-list-header'><img src='" + Treat_And_Trick.IMAGES.info + "' /> &nbsp; Here you can spend your earned treats on tricks that you can use on other members.</div>";

			var shop = "";

			shop += "<table class='treat-and-trick-shop-list list'>";

			shop += "<thead><tr class='head'>";
			shop += "<th style='width: 90px; border-top-width: 1px;'>&nbsp;</th>";
			shop += "<th style='width: 75%; border-top-width: 1px;' class='main'>Description</th>";
			shop += "<th style='width: 100px; border-top-width: 1px;'>Price</th>";
			shop += "<th style='width: 100px; border-top-width: 1px;'>&nbsp;</th>";
			shop += "</tr></thead><tbody class='treat-and-trick-shop-list-content list-content'>";

			var counter = 1;
			var item_list = Treat_And_Trick.ITEMS.get_list();

			for (var key in item_list) {
				var tmp = item_list[key];

				tmp.first = counter == 1 ? true : false;
				tmp.id = key;

				shop += this.create_row(tmp);

				counter++;
			}

			shop += "</tbody></table>";

			return this.bind_shop_events(shop);
		}
	}, {
		key: "bind_shop_events",
		value: function bind_shop_events(shop) {
			var $shop = $(shop);

			$shop.find(".treat-and-trick-shop-list-item-buy-button").on("click", function () {

				var id = $(this).attr("data-shop-item-id");
				var item = Treat_And_Trick.ITEMS.get_item(id);

				if (item != null && item.price > 0) {
					var user_id = parseInt(yootil.user.id(), 10);
					var current_tokens = Treat_And_Trick.api.user.get(user_id).tokens();

					if (current_tokens >= item.price) {
						Treat_And_Trick.api.user.decrease(user_id).tokens(item.price);

						$("#treat-and-trick-left-counter span").text(Treat_And_Trick.api.user.get(user_id).tokens());

						Treat_And_Trick.api.user.increase(user_id).inventory_trick(id);
						Treat_And_Trick.api.user.save(user_id);

						Treat_And_Trick.display_inventory_icon();

						var $img = $("#treat-and-trick-shop-row-" + id).find(".treat-and-trick-shop-list-item-image img");
						var $clone = $img.clone();
						var $panel_item = $(".treat-and-trick-dialog-pane-inventory-item[data-inventory-id=" + id + "]");

						$clone.offset({

							top: $img.offset().top,
							left: $img.offset().left

						}).css({

							opacity: "0.5",
							position: "absolute",
							height: $img.height(),
							width: $img.width(),
							"z-index": 1005,
							display: ""

						}).appendTo($("body")).animate({

							top: $panel_item.offset().top + 12,
							left: $panel_item.offset().left + 21,
							width: $img.width() / 4,
							height: $img.height() / 4

						}, {
							duration: 2000,
							easing: "easeInOutExpo",
							queue: true,
							complete: function complete() {
								var $count = $panel_item.find(".treat-and-trick-dialog-pane-inventory-item-count");
								var current_total = parseInt($count.text(), 10);

								if (current_total >= 99) {
									$count.text("99+");
								} else {
									$count.text(parseInt($count.text(), 10) + 1);
								}

								$(this).remove();
							}
						});
					}
				}
			});

			return $shop;
		}
	}, {
		key: "create_row",
		value: function create_row() {
			var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
			    _ref2$first = _ref2.first,
			    first = _ref2$first === undefined ? false : _ref2$first,
			    _ref2$image = _ref2.image,
			    image = _ref2$image === undefined ? "" : _ref2$image,
			    _ref2$desc = _ref2.desc,
			    desc = _ref2$desc === undefined ? "" : _ref2$desc,
			    _ref2$price = _ref2.price,
			    price = _ref2$price === undefined ? "" : _ref2$price,
			    _ref2$id = _ref2.id,
			    id = _ref2$id === undefined ? "" : _ref2$id;

			var row = "<tr class='item" + (first ? " first" : "") + "' id='treat-and-trick-shop-row-" + id + "'>";

			row += "<td class='treat-and-trick-shop-list-item-image'><img src='" + image + "' /></td>";
			row += "<td class='treat-and-trick-shop-list-item-desc'>" + desc + "</td>";
			row += "<td class='treat-and-trick-shop-list-item-price'><img src='" + Treat_And_Trick.IMAGES.candy32 + "' /> " + price + "</td>";
			row += "<td class='treat-and-trick-shop-list-item-buy'><img src='" + Treat_And_Trick.IMAGES.buy + "' data-shop-item-id='" + id + "' class='treat-and-trick-shop-list-item-buy-button' /></td>";
			row += "</tr>";

			return row;
		}
	}]);

	return Treat_And_Trick_Shop;
}();

Treat_And_Trick.ITEMS = function () {
	function _class7() {
		_classCallCheck(this, _class7);
	}

	_createClass(_class7, null, [{
		key: "init",
		value: function init() {
			this._items = Object.assign(Object.create(null), {});
			this.setup_items();
		}
	}, {
		key: "setup_items",
		value: function setup_items() {

			this._items["1"] = {

				image: Treat_And_Trick.IMAGES.bat,
				desc: "This will flip a members avatar.  This can be used on posts or members profiles by dragging the item onto the avatar.",
				price: 10,
				klass: "avatar-flip"

			};

			this._items["2"] = {

				image: Treat_And_Trick.IMAGES.dracula,
				desc: "Something something",
				price: 10,
				klass: ""

			};

			this._items["3"] = {

				image: Treat_And_Trick.IMAGES.ghost,
				desc: "Something something",
				price: 10,
				klass: ""

			};

			this._items["4"] = {

				image: Treat_And_Trick.IMAGES.broom,
				desc: "Something something",
				price: 10,
				klass: ""

			};
		}
	}, {
		key: "get_item",
		value: function get_item() {
			var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

			if (this._items[id]) {
				return this._items[id];
			}

			return null;
		}
	}, {
		key: "get_list",
		value: function get_list() {
			return this._items;
		}
	}]);

	return _class7;
}();

var Treat_And_Trick_Inventory = function () {
	function Treat_And_Trick_Inventory() {
		_classCallCheck(this, Treat_And_Trick_Inventory);
	}

	_createClass(Treat_And_Trick_Inventory, [{
		key: "open",
		value: function open() {
			this.show_inventory();
		}
	}, {
		key: "close",
		value: function close() {
			$(".treat-and-trick-dialog-inventory .ui-dialog-content").treat_and_trick("close");
		}
	}, {
		key: "show_inventory",
		value: function show_inventory() {
			var $dialog = new Treat_And_Trick_Dialog({

				title: "Treat and Trick - Inventory",
				html: this.create_inventory_html(),
				width: 530,
				height: 300,
				klass: "treat-and-trick-dialog-inventory",
				draggable: true,
				modal: false,
				extra: this.build_info_pane(),

				buttons: [{

					text: "Close",
					click: function click() {
						$(this).treat_and_trick("destroy").remove();
					}

				}]

			});

			$dialog.treat_and_trick("open");
		}
	}, {
		key: "create_inventory_html",
		value: function create_inventory_html() {
			var inventory_html = "<div class='treat-and-trick-inventory-wrapper'>";
			var inventory = Treat_And_Trick.api.user.get(yootil.user.id()).inventory();
			var item_list = Treat_And_Trick.ITEMS.get_list();

			for (var _id3 in inventory) {
				if (item_list[_id3]) {
					var count = inventory[_id3];

					inventory_html += "<div title='" + item_list[_id3].desc + "' class='treat-and-trick-inventory-item trick-tiptip' data-trick-id='" + _id3 + "'><img class='treat-and-trick-" + item_list[_id3].klass + "-trick' src='" + item_list[_id3].image + "' data-trick-id='" + _id3 + "' /><span class='treat-and-trick-dialog-pane-inventory-item-count'>x" + count + "</span></div>";
				}
			}

			return this.bind_inventory_events(inventory_html);
		}
	}, {
		key: "bind_inventory_events",
		value: function bind_inventory_events(inventory) {
			var $inventory = $(inventory);

			$inventory.find("img").draggable({

				appendTo: "body",
				zIndex: 1500,
				cursor: "move",
				helper: "clone"

			});

			$inventory.find(".trick-tiptip").tipTip({

				defaultPosition: "right",
				maxWidth: "350px"

			});

			return $inventory;
		}
	}, {
		key: "build_info_pane",
		value: function build_info_pane() {
			var $extra = $("<span id='treat-and-trick-dialog-info-pane'></span>");

			return $extra;
		}
	}, {
		key: "set_error",
		value: function set_error(msg) {
			$("#treat-and-trick-dialog-info-pane").html(msg);
		}
	}]);

	return Treat_And_Trick_Inventory;
}();

var Treat_And_Trick_Droppables = function () {
	function Treat_And_Trick_Droppables() {
		_classCallCheck(this, Treat_And_Trick_Droppables);
	}

	_createClass(Treat_And_Trick_Droppables, null, [{
		key: "init",
		value: function init() {
			if (yootil.location.recent_posts() || yootil.location.search_results() || yootil.location.thread()) {
				yootil.event.after_search(this.apply_post_droppables, this);
				this.apply_post_droppables();
			}

			if (yootil.location.profile_home()) {
				this.apply_profile_droppables();
			}
		}
	}, {
		key: "apply_post_droppables",
		value: function apply_post_droppables() {
			var $posts = yootil.get.posts();

			$posts.each(function () {
				var post_id = parseInt($(this).attr("id").split("post-")[1], 10);

				if (!post_id) {
					return;
				}

				var $post = $(this);
				var $mini_profile = $post.find(".mini-profile");
				var $user_link = $mini_profile.find("a.user-link");

				Treat_And_Trick_Droppables.flip_avatar($post, post_id);
			});
		}
	}, {
		key: "flip_avatar",
		value: function flip_avatar($post, post_id) {
			var $avatar = $post.find(".avatar-wrapper");

			if ($avatar.length > 0) {
				var user_id = parseInt(yootil.user.id(), 10);

				if (Treat_And_Trick.api.post.get(post_id).avatar_flipped()) {
					$avatar.addClass("treat-and-trick-avatar-flipped");
				}

				$avatar.droppable({

					accept: ".treat-and-trick-avatar-flip-trick",
					tolerance: "pointer",
					activeClass: "treat-and-trick-highlight",

					drop: function drop(event, ui) {
						var post_api = Treat_And_Trick.api.post;
						var post_data = post_api.get(post_id).data();
						var item_id = parseInt($(ui.draggable).attr("data-trick-id"), 10);

						var can_drop = Treat_And_Trick_Droppables.can_drop_on_post_avatar(post_id);
						var is_owner = Treat_And_Trick_Droppables.is_owner_post(post_id);

						if (can_drop) {
							if (item_id && Treat_And_Trick.ITEMS.get_item(item_id)) {
								if (Treat_And_Trick.api.user.get(user_id).inventory_trick_count(item_id) > 0) {
									var flipped = false;

									if (post_data.avatar_flipped) {
										$avatar.removeClass("treat-and-trick-avatar-flipped");
										flipped = false;
									} else {
										$avatar.addClass("treat-and-trick-avatar-flipped");
										flipped = true;
									}

									Treat_And_Trick.api.post.save(post_id).avatar_flipped(flipped);

									// Consider adding to the API to update an entry instead
									// of rebuilding the whole post map

									Treat_And_Trick.api.refresh.posts_data();

									Treat_And_Trick.api.user.decrease(user_id).inventory_trick(item_id);
									Treat_And_Trick.api.user.save(user_id);
								}
							}
						} else {
							if (is_owner) {
								Treat_And_Trick.inventory.set_error("You can't perform this action on your own posts.");
							} else {
								Treat_And_Trick.inventory.set_error("You can't perform this action as you were the last to perform it on this post.");
							}
						}
					}
				});
			}
		}
	}, {
		key: "apply_profile_droppables",
		value: function apply_profile_droppables() {
			var profile_id = parseInt(yootil.page.member.id(), 10);

			this.apply_avatar_droppable(profile_id);
		}
	}, {
		key: "apply_avatar_droppable",
		value: function apply_avatar_droppable(profile_id) {
			var $avatar = $(".show-user").find(".avatar-wrapper.avatar-" + profile_id);

			if ($avatar.length > 0) {
				if (Treat_And_Trick.api.member.get(profile_id).avatar_flipped()) {
					$avatar.addClass("treat-and-trick-avatar-flipped");
				}

				$avatar.droppable({

					accept: ".treat-and-trick-avatar-flip-trick",
					tolerance: "pointer",
					activeClass: "treat-and-trick-highlight",

					drop: function drop(event, ui) {
						var member_api = Treat_And_Trick.api.member;
						var member_data = member_api.get(profile_id).data();
						var item_id = parseInt($(ui.draggable).attr("data-trick-id"), 10);

						var can_drop = Treat_And_Trick_Droppables.can_drop_on_profile_avatar(profile_id);
						var is_owner = Treat_And_Trick_Droppables.is_owner_profile(profile_id);

						if (can_drop) {
							if (item_id && Treat_And_Trick.ITEMS.get_item(item_id)) {
								if (Treat_And_Trick.api.user.get(yootil.user.id()).inventory_trick_count(item_id) > 0) {
									var flipped = false;

									if (member_data.avatar_flipped) {
										$avatar.removeClass("treat-and-trick-avatar-flipped");
										flipped = false;
									} else {
										$avatar.addClass("treat-and-trick-avatar-flipped");
										flipped = true;
									}

									member_api.save(profile_id).avatar(flipped);
									Treat_And_Trick.api.user.decrease(yootil.user.id()).inventory_trick(item_id);
									Treat_And_Trick.api.user.save(yootil.user.id());
								}
							}
						} else {
							if (is_owner) {
								Treat_And_Trick.inventory.set_error("You can't perform this action on your own profile.");
							} else {
								Treat_And_Trick.inventory.set_error("You can't perform this action as you were the last to perform iton this profile.");
							}
						}
					}
				});
			}
		}
	}, {
		key: "can_drop_on_post_avatar",
		value: function can_drop_on_post_avatar(post_id) {
			var can_drop = Treat_And_Trick.api.post.get(post_id).avatar_flipped_last_user() ? false : true;

			if (this.is_owner_post(post_id)) {
				can_drop = false;
			}

			return can_drop;
		}
	}, {
		key: "is_owner_post",
		value: function is_owner_post(post_id) {
			return Treat_And_Trick.api.post.get(post_id).created_by() == parseInt(yootil.user.id(), 10);
		}
	}, {
		key: "can_drop_on_profile_avatar",
		value: function can_drop_on_profile_avatar(profile_id) {
			var can_drop = Treat_And_Trick.api.member.get(profile_id).avatar_flipped_last_user() ? false : true;

			if (this.is_owner_profile(profile_id)) {
				can_drop = false;
			}

			return can_drop;
		}
	}, {
		key: "is_owner_profile",
		value: function is_owner_profile(profile_id) {
			if (profile_id == parseInt(yootil.user.id(), 10)) {
				return true;
			}

			return false;
		}
	}]);

	return Treat_And_Trick_Droppables;
}();

var Treat_And_Trick_User_Settings = function () {
	function Treat_And_Trick_User_Settings() {
		_classCallCheck(this, Treat_And_Trick_User_Settings);
	}

	_createClass(Treat_And_Trick_User_Settings, null, [{
		key: "init",
		value: function init() {}
	}, {
		key: "display_settings_icon",
		value: function display_settings_icon() {
			var $icon = $("<div class='treat-and-trick-settings-icon'><img src='" + Treat_And_Trick.IMAGES.settings + "' title='Your settings' /></div>");

			$icon.on("click", function () {});

			$icon.appendTo(".treat-and-trick-icon-wrapper");
		}
	}]);

	return Treat_And_Trick_User_Settings;
}();


Treat_And_Trick.init();