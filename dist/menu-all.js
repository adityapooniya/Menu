/*! Menu - v0.1.0 - 2014-12-08
* https://github.com/filamentgroup/menu
* Copyright (c) 2014 Filament Group; Licensed MIT */
/*! Menu - v0.1.0 - 2014-12-08
* https://github.com/filamentgroup/menu
* Copyright (c) 2014 Filament Group; Licensed MIT */
(function( $, w ) {
	"use strict";

	var componentName = "Menu",
		at = {
			ariaHidden: "aria-hidden"
		},
		selectClass = "menu-selected",
		focusables = "a,input,[tabindex]";

	var menu = function( element ){
		if( !element ){
			throw new Error( "Element required to initialize object" );
		}
		this.element = element;
		this.$element = $( element );
		this.opened = true;
	};

	menu.prototype.fill = function( items ) {
		var html = "";

		$.each( items, function( i, item ){
			html += "<li>" + item + "</li>";
		});

		this.$element.find( "ol,ul" ).html( html );
	};

	menu.prototype.moveSelected = function( placement, focus ){
		var $items = this.$element.find( "li" ),
			$selected = $items.filter( "." + selectClass ),
			$nextSelected;

		if( !$selected.length || placement === "start" ){
			$nextSelected = $items.eq( 0 );
		}
		else if( placement === "next" ){
			$nextSelected = $selected.next();
			if( !$nextSelected.length ){
				$nextSelected = $items.eq( 0 );
			}
		}
		else {
			$nextSelected = $selected.prev();
			if( !$nextSelected.length ){
				$nextSelected = $items.eq( $items.length - 1 );
			}
		}
		$selected.removeClass( selectClass );
		$nextSelected.addClass( selectClass );

		if( focus || $( w.document.activeElement ).closest( $selected ).length ){
			if( $nextSelected.is( focusables ) ){
				$nextSelected[ 0 ].focus();
			}
			else{
				var $focusChild = $nextSelected.find( focusables );
				if( $focusChild.length ){
					$focusChild[ 0 ].focus();
				}
			}
		}
	};

	menu.prototype.selectActive = function(){
		var trigger = this.$element.data( componentName + "-trigger" ),
			$selected = this.$element.find( "li." + selectClass );

		if( trigger && $( trigger ).is( "input" ) ){
			trigger.value = $selected.text();
		}
		$selected.trigger( componentName + ":select" );
		this.close();
		return $selected.text();
	};

	menu.prototype.keycodes = {
		38 : function(e) {
			this.moveSelected( "prev" );
			e.preventDefault();
		},

		40 : function(e){
			this.moveSelected( "next" );
			e.preventDefault();
		},

		13 : function(){
			// return the selected value
			return this.selectActive();
		},

		27 : function(){
			this.close();
		}
	};

	menu.prototype.keyDown = function( e ){
		var fn = this.keycodes[e.keyCode] || function(){};
		return fn.call( this, e );
	};

	menu.prototype._bindKeyHandling = function(){
		var self = this;
		this.$element
			.bind( "keydown", function( e ){
				self.keyDown( e );
			} )
			.bind( "mouseover", function( e ){
				self.$element.find( "." + selectClass ).removeClass( selectClass );
				$( e.target ).closest( "li" ).addClass( selectClass );
			})
			.bind( "mouseleave", function( e ){
				$( e.target ).closest( "li" ).removeClass( selectClass );
			})
			.bind( "click", function(){
				self.selectActive();
			});
	};

	menu.prototype.open = function( trigger, sendFocus ){
		if( this.opened ){
			return;
		}
		this.$element.attr( at.ariaHidden, false );

		this.$element.data( componentName + "-trigger", trigger );
		this.opened = true;
		this.moveSelected( "start", sendFocus );
		this.$element.trigger( componentName + ":open" );
	};

	menu.prototype.close = function(){
		if( !this.opened ){
			return;
		}
		this.$element.attr( at.ariaHidden, true );
		this.opened = false;
		var $trigger = this.$element.data( componentName + "-trigger" );
		if( $trigger ){
			$trigger.focus();
		}
		this.$element.trigger( componentName + ":close" );
	};

	menu.prototype.toggle = function( trigger, sendFocus ){
		this[ this.opened ? "close" : "open" ]( trigger, sendFocus );
	};

	menu.prototype.init = function(){
		// prevent re-init
		if( this.$element.data( componentName ) ) {
			return;
		}
		this.$element.data( componentName, this );

		this.$element.attr( "role", "menu" );
		this.close();
		var self = this;

		// close on any click, even on the menu
		$( document ).bind( "mouseup", function(){
			self.close();
		} );

		this._bindKeyHandling();

		this.$element.trigger( componentName + ":init" );
	};

	menu.prototype.isOpen = function(){
		return this.opened;
	};

	(w.componentNamespace = w.componentNamespace || w)[ componentName ] = menu;
}( jQuery, this ));

/*! Menu - v0.1.0 - 2014-12-08
* https://github.com/filamentgroup/menu
* Copyright (c) 2014 Filament Group; Licensed MIT */
/* global Menu:true */
(function( Menu, $ ) {

	var pluginName = "menu",
		initSelector = "[data-" + pluginName + "]";

	$.fn[ pluginName ] = function(){
		return this.each(function(){
			new window.componentNamespace.Menu( this ).init();
		});
	};

	// auto-init on enhance (which is called on domready)
	$( document ).bind( "enhance", function( e ){
		$( initSelector, e.target )[ pluginName ]();
	});

}( Menu, jQuery, this ));

/*! Menu - v0.1.0 - 2014-12-08
* https://github.com/filamentgroup/menu
* Copyright (c) 2014 Filament Group; Licensed MIT */
(function( $, w ) {
	"use strict";

	var componentName = "Menutrigger";

	var Menutrigger = function( element ){
		if( !element ){
			throw new Error( "Element required to initialize object" );
		}
		this.element = element;
		this.$element = $( element );
		this.$menu = $( "#" +  this.$element.attr( "data-menu-trigger" ) );
		this.menu = this.$menu.data( "Menu" );
	};

	Menutrigger.prototype._bindbehavior = function(){
		var self = this;

		if( this.$element.is( "a" ) ){
			this.$element
				.attr( "role", "button" )
				.bind( "click", function( e ){
					e.preventDefault();
					self.menu.toggle( this, true );
				});
		}
		else if( this.$element.is( "input" ) ){
			this.$element
				.bind( "input keyup", function(){
					if( this.value === "" ){
						self.menu.close();
					}
					else {
						self.menu.open( this, false );
					}

				})
				.bind( "input keydown", function( e ){
					self.menu.keyDown( e );
				})
				.bind( "focus click", function(){
					if( this.value !== "" ){
						self.menu.open();
					}
				} )
				.bind( "blur", function(){
					self.menu.close();
				});
		}
	};

	Menutrigger.prototype.init = function(){
		// prevent re-init
		if( this.$element.data( componentName ) ) {
			return;
		}
		this.$element.data( componentName, this );

		// add attrs
		this.$element.attr( "aria-controls", this.$menu.attr( "id" ) );
		this.$element.attr( "aria-haspopup", "true" );

		this._bindbehavior();

		this.$element.trigger( componentName + ":init" );
	};

	w[ componentName ] = Menutrigger;

}( jQuery, this ));


/*! Menu - v0.1.0 - 2014-12-08
* https://github.com/filamentgroup/menu
* Copyright (c) 2014 Filament Group; Licensed MIT */
/* global Menutrigger:true */
(function( Menutrigger, $ ) {

	var pluginName = "menu-trigger",
		initSelector = "[data-" + pluginName + "]";

	$.fn[ pluginName ] = function(){
		return this.each(function(){
			new Menutrigger( this ).init();
		});
	};

	// auto-init on enhance (which is called on domready)
	$( document ).bind( "enhance", function( e ){
		$( initSelector, e.target )[ pluginName ]();
	});

}( Menutrigger, jQuery, this ));

