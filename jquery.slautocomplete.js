// Copyright 2013 Stéphane Lavergne <http://www.imars.com/> Free software under <http://www.gnu.org/licenses/lgpl-3.0.txt>

/**
 * jQuery Autocomplete
 *
 * My take on using native client-side widgets for autocomplete behavior.
 *
 * Usage:
 *
 * $('select.autocomplete').autocomplete();
 *
 * Optionally, some configuration options can be specified to override
 * defaults, shown in this example:
 *
 * $('select.autocomplete').autocomplete({
 *   width: '16em',
 *   max_hits: 100,
 *   prefix: false  // Set true to match only the exact beginning instead of anywhere
 * });
 *
 * @package   jquery.autocomplete
 * @author    Stéphane Lavergne <http://www.imars.com/>
 * @copyright 2013 Stéphane Lavergne
 * @license   http://www.gnu.org/licenses/lgpl-3.0.txt  GNU LGPL version 3
 */

/*jslint node: false, browser: true, es5: false, white: true, nomen: true, plusplus: true */
/*global jQuery: true */

(function ($) {
	"use strict";
	$.fn.autocomplete = function (args) {
		var width = '16em', max_hits = 100, prefix = false;
		if (args) {
			if (args.width)    { width    = args.width; }
			if (args.max_hits) { max_hits = args.max_hits; }
			if (args.prefix)   { prefix   = true; }
		}
		max_hits++;
		return this.each(function () {
			var myCopy = $(this).clone();  // Deep copy before modifying

			function makeSelection(select, isFinal) {
				var selections = select.find('option').filter(':selected'), first = null, input = null;
				if (selections.length > 0) {
					input = select.parent().find('input[name=__input_'+select.prop('name')+']');
					first = selections.first();
					selections.not(first).prop('selected', false);
					select.prop('__autocomplete_selected', true);
					input.prop('value', first.text());
					if (isFinal) {
						select.prop('__autocomplete_focus_select', false);
						input.focus();
						setTimeout(function(){
							select.hide();
						}, 300);
					}
				}
			}

			// Hide SELECT, insert INPUT
			$(this)
				.hide()
				.wrap('<div style="display: inline-block;" />')
				.before('<input type="text" autocomplete="off" style="width: '+width+';" name="__input_'+$(this).prop('name')+'" /><br />')
				.prop('multiple', true)
				.prop('size', 10)
				.css('position', 'absolute')
				.css('z-index', '1000')
				.css('width', width)
				.css('margin', '0px')
				.css('padding', '0px')
				.prop('__autocomplete_src', myCopy)
				.prop('__autocomplete_hits', 0)
				.prop('__autocomplete_selected', false)
				.prop('__autocomplete_focus_input', false)
				.prop('__autocomplete_focus_select', false)
				.blur(function (ev) {
					var select = $(this);
					select.prop('__autocomplete_focus_select', false);
					setTimeout(function(){
						if (!select.prop('__autocomplete_focus_input')) {
							select.hide();
						}
					}, 300);
				})
				.focus(function (ev) {
					var select = $(this);
					select.prop('__autocomplete_focus_select', true);
				})
				.keyup(function (ev) {
					var select = $(this), selections = null, first = null;
					if (ev.which === 13  ||  ev.which === 38  ||  ev.which === 40) {
						makeSelection(select, ev.which === 13);
					} else if (ev.which === 27) {
						select
							.prop('__autocomplete_focus_select', false)
							.parent().find('input[name=__input_'+$(this).prop('name')+']').focus();
						setTimeout(function(){
							select.hide();
						}, 300);
					}
				})
				.click(function (ev) { makeSelection($(this), true); })
				.change(function (ev) { makeSelection($(this), false); })  // MSIE 6 does this AFTER click
			;

			// Add auto-suggest to INPUT
			$(this).parent()
				.find('input[name=__input_'+$(this)
				.prop('name')+']')
				.keyup(function (ev) {
					var
						keyword = $(this).prop('value') || '',
						select  = $(this).parent().find('select'),
						options = select.find('option'),
						hits = 0
					;
					if (keyword.length > 0) {
						if (ev.which === 40) {
							select
								.show()
								.focus()
								.prop('__autocomplete_focus_select', true)
							;
							if (options.filter(':selected').length === 0) {
								options.first().prop('selected', true);
								makeSelection(select, false);
							}
						} else {
							select.hide().empty().prop('__autocomplete_selected', false);
							select.prop('__autocomplete_src').find('option').each(function () {
								var
									thisOpt = $(this),
									searchIndex = thisOpt.text().toUpperCase().search(keyword.toUpperCase())
								;
								if (prefix ? (searchIndex === 0) : (searchIndex >= 0)) {
									hits++;
									if (hits < max_hits) { select.append(thisOpt.clone()); }
									else if (hits === max_hits) { select.append('<option disabled="disabled">...</option>'); }
								}
								if (hits > 0) {
									select.prop('size', Math.min(10, hits)).show();
								}
							});
							select.prop('__autocomplete_hits', hits);
						}
					} else {
						select.hide();
					}
				})
				.focus(function (ev) {
					var select = $(this).parent().find('select');
					select.prop('__autocomplete_focus_input', true);
					if (select.prop('__autocomplete_hits') > 0  &&  !select.prop('__autocomplete_selected')) {
						$(this).parent().find('select').show();
					}
				})
				.blur(function (ev) {
					var select = $(this).parent().find('select');
					select.prop('__autocomplete_focus_input', false);
					setTimeout(function(){
						if (!select.prop('__autocomplete_focus_select')) {
							select.hide();
						}
					}, 300);
				})
			;

		});
	};
}( jQuery ));


