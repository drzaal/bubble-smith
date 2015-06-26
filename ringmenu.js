/**
 * Ringmenu is a content menu which spins AROUND a content element.
 * Ringmenu is a way to organize content by putting it into a spinnable
 * ring. Content can be hidden when not needed, and spun out when requested.
 * Content is controlled by key input, and mouse behavior. Ringmenu may
 * not be mobile compatible.
 * @author ztonia
 * @copyright Zaal G Tonia All rights reserved
 * @requires JQuery. Tested only with JQuery version 1.11.1. I'm scared of IE sucking. :(
 */

// Ringmenu REQUIRES JQUERY. If JQuery is unavailable, fail.
//if (undefined $); quit // totally not correct standard
//(function (undefined) {
//    if(!window.jQuery) {
//        var script = document.createElement("SCRIPT");
//        script.src = 'http://code.jquery.com/jquery-1.11.1.min.js';
//        script.type = 'text/javascript';
//        document.getElementsByTagName("head")[0].appendChild(script);
//
//        // Poll for jQuery to come into existance
//        var checkReady = function(callback) {
//            if (window.jQuery) {
//                callback();
//            }
//            else {
//                window.setTimeout(function() { checkReady(callback); }, 100);
//            }
//        };
//        // Start polling...
//        checkReady(main);
//    } else {
//        main();
//    }
//
//}());

var jq = jQuery;

var ringmenu = {
	ringmenu: null,
	items: null,
	length: 0,
	primary_key: null,
	y_int: 0,
	z_index: 1000,
	radial: 450,
	toggle: 0,
	v_theta: 1/8,
	theta_c: {},
	iyd_c: {}, // Items y distance (height) set
	itemsize: 80,
	focal_d: 2,
	doc_h: null,
	doc_w: null,
	wnd_h: null,
	wnd_w: null,
}

/**
 * On pageload, capture the ringmenu element.
 * Function finds and captures the ringmenu id element in
 * preparation for ringmenu behavior. Script will fail if
 * ringmenu element is not declared.
 */
 function ringmenu_init() {
	$.noConflict(); // no conflict
	ringmenu.ringmenu = jq("#ringmenu"); // Set up the ring, its constituent items and their properties
	ringmenu.items = jq(".ringmenu-item");
	ringmenu.length = ringmenu.items.length;
	ringmenu.theta_c = Array.apply(null, Array(ringmenu.length)).map(Number.prototype.valueOf,0);
	for (i=0; i<ringmenu.length; i++) {
		ringmenu.iyd_c[i] = ringmenu.items[i].clientHeight;
	}
	console.log(ringmenu.iyd_c);
	ringmenu.primary_key = 0;
	// items.
	console.log(ringmenu);
	ringmenu.ringmenu.css({ 'margin-left': 'auto', 'margin-right': 'auto', width: 0 });
	ringmenu.items.css({ position: 'absolute', 'margin-left': "0px", display: 'inline-block', top: 0 });
	setInterval(
		ringmenu_update, 20
	);

	// Configure screen and box boundaries for kinematic motion.
	ringmenu.wnd_h = jq(window).height();
	ringmenu.wnd_w = jq(window).width();
	ringmenu.doc_h = jq(document).height();
	ringmenu.doc_w = jq(document).width();

	jq(window).keydown(ringmenu_key);
	ringmenu.ringmenu.click(ringmenu_toggle);
 }

/**
 * handle ringmenu user input. Toggle and select item.
 */
function ringmenu_key(evt) {
	jq("#console").text(evt.which);
	if (evt.which == 37) {
		ringmenu.primary_key +=1;
	}
	if (evt.which == 39) {
		ringmenu.primary_key -=1;
	}
	if (evt.which == 38) {
		ringmenu.y_int +=1;
	}
	if (evt.which == 40) {
		ringmenu.y_int -=1;
	}
	console.log(ringmenu.length + " " + ringmenu.primary_key);
	if (ringmenu.y_int == 0) {
		if (ringmenu.primary_key >= ringmenu.length) ringmenu.primary_key = ringmenu.length-1;
		if (ringmenu.primary_key < 0) ringmenu.primary_key = 0;
	}
	else if (ringmenu.y_int == 1) {
//		if (ringmenu.primary_key >= ringmenu.length) ringmenu.primary_key = 0;
//		if (ringmenu.primary_key < 0) ringmenu.primary_key = ringmenu.length-1;
	}
	if (ringmenu.toggle) evt.preventDefault();
}


/**
 * On click event, toggle the menu.
 */
function ringmenu_toggle (evt) {
	if (!ringmenu.toggle) ringmenu.toggle = 1;
	else { 
		ringmenu.toggle = 0;
		ringmenu.y_int = 0;
	}
}


/**
 * Update function. Ringmenu must behave as a moving object.
 * Visual behavior and motion of the ringmenu.
 */
function ringmenu_update(evt) {
	ringmenu.ringmenu.css('bottom', jq(window).height() / 2);
	if (ringmenu.y_int == 0) {
		ringmenu.items.each(ringmenu_ubelt);	
	}
	else if (ringmenu.y_int == 1 || ringmenu.y_int == 2 || ringmenu.y_int == 3) {
		ringmenu.items.each(ringmenu_uring);
	}
	else if (ringmenu.y_int == 4) {
		ringmenu.items.each(ringmenu_ufreefall);
	}
}

function ringmenu_uring () {
	var n_r = 1;
	if (ringmenu.y_int == 1) {
		n_r = 1;
	} else if (ringmenu.y_int == 2) {
		n_r = 2;
	}
	else if (ringmenu.y_int == 3) {
		n_r = 3;
	}
	var trueindex = ringmenu.items.index( this );
	var i_k = ringmenu.primary_key;
	var i_n = (trueindex - i_k + n_r * ringmenu.length);
	var theta_i = ringmenu.theta_c[trueindex];
	var theta_0 = 0;

	jq(this).data('v_x', 0);
	jq(this).data('v_y', 0);

	theta_0 = (i_n)/(ringmenu.length);
	if (!ringmenu.toggle) theta_0 = 0.85;
	var delta = (theta_0 - ringmenu.theta_c[trueindex]);
	theta_i = theta_i + delta * ringmenu.v_theta;

	ringmenu.theta_c[trueindex] = theta_i;
	theta_i = 2* Math.PI * theta_i; // Turn the proto-angle into a true angle by giving it a 2PI factor.
	var f_z = Math.sqrt((ringmenu.focal_d + Math.cos(theta_i)) / ringmenu.focal_d);
	var x_i = -ringmenu.radial * Math.sin(theta_i);
	if (n_r % 2 == 1)
		var y_i = -ringmenu.radial * Math.cos(n_r * theta_i);
	else
		var y_i = -ringmenu.radial * Math.sin(n_r * theta_i);
	var d_x = Math.ceil( ringmenu.itemsize * f_z ); 
	d_y = Math.floor(f_z*ringmenu.iyd_c[trueindex]);
	jq(this).css({
		'z-index': Math.floor(100*f_z) + ringmenu.z_index, 
		"margin-left": ( x_i - d_x/2 )+"px", 
		"margin-top": (y_i/4/n_r) +"px", 
		height: d_y +'px', 
		width: d_x + 'px', 
		'font-size': Math.floor( 12 * f_z ) + 'px',
	});
}
function ringmenu_ubelt () {
	var trueindex = ringmenu.items.index( this );
	var i_n = trueindex + 1;
	var i_k = ringmenu.primary_key + 1;
	var theta_i = ringmenu.theta_c[trueindex];
	var theta_0 = 0;

	jq(this).data('v_x', 0);
	jq(this).data('v_y', 0);

	if ( i_n - i_k < 0 ) theta_0 = 0.5 + 0.475 * ( i_n - i_k )/(i_k);
	else theta_0 = 0.5 + 0.475 * (i_n - i_k)/(ringmenu.length + 1 - i_k);
	if (!ringmenu.toggle) theta_0 = 0.85;
	var delta = theta_0 - ringmenu.theta_c[trueindex];
	theta_i = theta_i + delta * ringmenu.v_theta;
	ringmenu.theta_c[trueindex] = theta_i;
	theta_i = 2* Math.PI * theta_i; // Turn the proto-angle into a true angle by giving it a 2PI factor.
	var x_i = ringmenu.radial * Math.sin(theta_i);
	var f_z = (ringmenu.focal_d - Math.cos(theta_i)) / ringmenu.focal_d;
	var d_x = Math.ceil( ringmenu.itemsize * f_z ); 
	d_y = Math.floor(f_z*ringmenu.iyd_c[trueindex]);
	jq(this).css({
		'z-index': -Math.floor(ringmenu.radial * Math.cos(theta_i)) + ringmenu.z_index, 
		height: d_y+'px', 
		width: d_x + 'px', 
		"margin-left": ( x_i - d_x/2 )+"px", 
		"margin-top": (-d_y/2) +"px", 
		'font-size': Math.floor( 12 * f_z ) + 'px',
	});
}
/**
 * Impulse velocity redirect on collision with a box boundary.
 * Going to cheat. Really if I was serious I would project the position
 * and do the bounce calculation before. Instead I am going to just handle
 * it after, like a lazy person.
 * @param HTMLELEMENT actor The kinematic actor who we are bouncing off of the boundaries.
 */
function ringmenu_kinetic_boundarybounce( actor ) {
	a_w = actor.clientWidth;
	a_h = actor.clientHeight;
	a_x = jq(actor).css('margin-left');
	a_y = jq(actor).css('margin-top');
	a_vx = jq(actor).data('v_x');
	a_vy = jq(actor).data('v_y');
	a_j = Math.pow( a_vx, 2) + Math.pow( a_vy, 2 );
	a_j80 = a_j * 0.8;
	if (a_x <= 0 || a_x + a_w >= ringmenu.s_width) {
		if (a_vx != 0) a_x_sign = a_vx / Math.abs(a_vx);
		jq(actor).data( 'v_x', - a_x_sign * Math.sqrt( a_j80 - Math.pow(a_vy, 2) ) );
	}
	if (a_x <= 0 || a_x + a_w >= ringmenu.s_width) {

	}
}

/**
 * Freefall behavior for ringmenu.
 * If triggered, ring items are released to kinematic motion.
 * Items are bounded by the screen limits and have an 
 * inelastic collision behavior with those bounds.
 * @author ztonia
 * @return void
 */
function ringmenu_ufreefall () {
	var trueindex = ringmenu.items.index( this );
	var g = 4;
	if (!ringmenu.toggle) ;
	// jq(this).data('v_x', jq(this).css('margin-left')/50);
	var x_i = parseInt( jq(this).css('margin-left'), 10);
	var y_i = parseInt( jq(this).css('margin-top'), 10);
	if (y_i + jq(this).data('v_y') >= Math.floor( jq(document).height() - jq(window).height() / 2 - 50 )) {
		jq(this).data('v_x', 0);
		jq(this).data('v_y', 0);
		y_i = Math.floor( jq(document).height() - jq(window).height() / 2 - 50 );
	}
	else {
		jq(this).data('v_y', jq(this).data('v_y') + g);
	}
	var theta_i = ringmenu.theta_c[trueindex];
	x_i = x_i + jq(this).data('v_x');
	y_i = y_i + jq(this).data('v_y');
	var f_z = (ringmenu.focal_d - Math.cos(theta_i)) / ringmenu.focal_d;
	var d_x = Math.ceil( ringmenu.itemsize * f_z ); 
	d_y = Math.floor(f_z*ringmenu.iyd_c[trueindex]);
	jq(this).css({
		'z-index': -Math.floor(ringmenu.radial * Math.cos(theta_i)) + ringmenu.z_index, 
		height: d_y + 'px', 
		width: d_x + 'px', 
		"margin-left": x_i + "px", 
		"margin-top": y_i + "px", 
		'font-size': Math.floor( 12 * f_z ) + 'px',
	});
}

jq(document).ready(ringmenu_init);
