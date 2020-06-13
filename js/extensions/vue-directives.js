/**
 * DataFormsJS Vue Directives
 *
 * Vue Directives defined in this file:
 *     v-format-number="number"
 *     v-format-currency:['currenyCode']="number"
 *       Example:
 *         v-format-currency:['usd']="123.45"
 *     v-format-percent="decimalNumber"
 *     v-format-percent:decimalPlaces="decimalNumber"
 *       Example"
 *         v-format-percent:2="decimalNumber"
 *     v-format-date="dateValue or dateString"
 *     v-format-date-time="dateValue or dateString"
 *     v-format-date-time="dateValue or dateString"
 *
 * This file has no dependencies other than Vue. Directives are added to Vue
 * when the document is loaded (DOMContentLoaded/readyState).
 */

/* Validates with both [jshint] and [eslint] */
/* global Vue */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

(function () {
    'use strict';

    // This gets called from the bottom of this file
    function addDirectives() {
        // If Vue is not specified as a <script> on the page then exit
        if (!window.Vue) {
            console.warn('[vue-directives.js] is included in this page but Vue was not found.');
            return;
        }

        // Return true if a valid number, this excludes Infinity and NaN
        function isNumber(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        // Format a date, date/time or time value with Intl.DateTimeFormat()
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
        function formatDateTime(dateTime, options) {
            // Fallback to data in original format.
            // As of 2019 this would most likely happen on older iOS.
            if (window.Intl === undefined) {
                return dateTime;
            }

            // Return formatted date/time in the user's local language
            try {
                if (dateTime instanceof Date) {
                    return new Intl.DateTimeFormat(navigator.language, options).format(dateTime);
                } else {
                    var localDate = new Date(dateTime);
                    return new Intl.DateTimeFormat(navigator.language, options).format(localDate);
                }
            } catch (e) {
                // If Error log to console and return 'Error' text
                console.warn('Error formatting Date/Time Value:');
                console.log(navigator.language);
                console.log(options);
                console.log(dateTime);
                console.log(e);
                return 'Error';
            }
        }

        // Format a numeric value with Intl.NumberFormat()
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
        function formatNumber(value, options) {
            var style,
                maximumFractionDigits,
                digitGrouping = null,
                decimalMark = null,
                currencySymbol = null,
                numberParts,
                formattedValue,
                language;

            // Get the user's selected language.
            // navigator.language = Standards Version in most browsers and new versions of IE
            // navigator.userLanguage = Older versions of IE such as IE 9
            language = (navigator.language ? navigator.language : navigator.userLanguage);

            // Check for a valid number
            if (value === null || value === '') {
                return null;
            }
            if (!isNumber(value)) {
                console.warn('Warning value specified in DataFormsJS Vue Directive function formatNumber() is not a number:');
                console.log(value);
                return value;
            }

            // Fallback if Intl.NumberFormat() is not supported.
            // For example IE9 and below or versions of Safari.
            if (window.Intl === undefined) {
                // Get the specified options
                style = (options.style ? options.style : null);
                maximumFractionDigits = (options.maximumFractionDigits ? options.maximumFractionDigits : 0);

                // If percent provide a basic formatting fallback
                if (style === 'percent') {
                    return (value * 100).toFixed(maximumFractionDigits) + '%';
                }

                // Fallback for specific langauges
                switch (language) {
                    case 'en-us':
                        digitGrouping = ',';
                        decimalMark = '.';
                        currencySymbol = '$';
                        break;
                }

                if (digitGrouping !== null) {
                    numberParts = value.toString().split('.');
                    numberParts[0] = numberParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    formattedValue = numberParts.join(decimalMark);

                    if (style === 'currency') {
                        return currencySymbol + formattedValue;
                    } else {
                        return formattedValue;
                    }
                }

                // Return the value as it was passed to this function
                return value;
            }

            // Return formatted number/currency/percent/etc in the user's local language
            try {
                return new Intl.NumberFormat(language, options).format(value);
            } catch (e) {
                // If Error log to console and return 'Error' text
                console.warn('Error formatting Numeric Value:');
                console.log(language);
                console.log(options);
                console.log(value);
                console.log(e);
                return 'Error';
            }
        }

        var vFormatNumber = {
            bind: function (el, binding) {
                el.textContent = formatNumber(binding.value, {});
            }
        };
        
        var vFormatCurrency = {
            bind: function (el, binding) {
                var currencyCode = binding.arg;
                if (!currencyCode) {
                    console.warn('Warning [v-format-currency] is not being called with correct parameters, expected: format-currency:[\'currencyCode\']="value"');
                    el.textContent = 'Error';
                    return;
                }
                var intlOptions = { style: 'currency', currency: currencyCode, maximumFractionDigits: 2 };
                el.textContent = formatNumber(binding.value, intlOptions);
            }
        };

        var vFormatPercent = {
            bind: function (el, binding) {
                var decimalPlaces = (binding.arg ? Number(binding.arg) : 0);
                var intlOptions = {
                    style: 'percent',
                    maximumFractionDigits: decimalPlaces,
                    minimumFractionDigits: decimalPlaces,
                };
                el.textContent = formatNumber(binding.value, intlOptions);
            }
        };

        var vFormatDate = {
            bind: function (el, binding) {
                el.textContent = formatDateTime(binding.value, {});
            }
        };
        
        var vFormatDateTime = {
            bind: function (el, binding) {
                var intlOptions = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
                el.textContent = formatDateTime(binding.value, intlOptions);
            }
        };
        
        var vFormatTime = {
            bind: function (el, binding) {
                var intlOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
                el.textContent = formatDateTime(binding.value, intlOptions);
            }
        };

        // Vue 2 and 3 have different API's.
        // For Vue 2 directives can be defined globally on the Vue object
        // while Vue 3 requires them to be set on the app from `Vue.createApp()`.
        // In order to do this DataFormsJS provides a `app.vueDirectives` for Vue.
        var isVue3 = (Vue.directive === undefined && typeof Vue.createApp === 'function');
        if (isVue3) {
            app.vueDirectives = app.vueDirectives || {};
            app.vueDirectives['format-number'] = vFormatNumber.bind;
            app.vueDirectives['format-currency'] = vFormatCurrency.bind;
            app.vueDirectives['format-percent'] = vFormatPercent.bind;
            app.vueDirectives['format-date'] = vFormatDate.bind;
            app.vueDirectives['format-date-time'] = vFormatDateTime.bind;
            app.vueDirectives['format-time'] = vFormatTime.bind;
        } else {
            Vue.directive('format-number', vFormatNumber);
            Vue.directive('format-currency', vFormatCurrency);
            Vue.directive('format-percent', vFormatPercent);
            Vue.directive('format-date', vFormatDate);
            Vue.directive('format-date-time', vFormatDateTime);
            Vue.directive('format-time', vFormatTime);
        }
    }

    // Load directives once document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addDirectives);
    } else {
        addDirectives();
    }
})();
