/**
 * DataFormsJS <data-list> Web Component
 *
 * This component renders either a basic <ul> or custom <template> after [value]
 * is set from JavaScript with an array of objects. This component works well with
 * the <json-data> component to display data once it is downloaded and because of
 * it's small size it can easily be copied and customized for any app or site.
 *
 * When using a <template> element the attribute [template-selector] is used to
 * specify a CSS selector for the template and JavaScript Template literals
 * (Template strings) are used for the template format. All variables in the
 * template will be escaped for HTML encoding.
 */

/* Validates with both [jshint] and [eslint] */
/* For online eslint - Source Type = 'module' must be manually selected. */
/* jshint esversion:8, evil:true */
/* eslint-env browser, es6 */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint-disable no-console */

import { render } from './utils.js';

/**
 * Shadow DOM for Custom Elements
 */
const shadowTmpl = document.createElement('template');
shadowTmpl.innerHTML = `
    <style>:host { display:block; }</style>
    <slot></slot>
`;

class DataList extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(shadowTmpl.content.cloneNode(true));
        // The [not-setup] is defined when the component is created and removed when data
        // is set. It allows for applications to handle logic based on whether or not the
        // data list has been rendered. For usage see `componentsAreSetup()` from [utils.js].
        this.setAttribute('not-setup', '');
        this.state = { list: null };
    }

    get value() {
        return this.state.list;
    }

    set value(list) {
        this.state.list = list;
        this.renderList();
    }

    renderList() {
        // Ignore if [value] has not yet been set
        const list = this.state.list;
        if (list === null || list === '') {
            this.innerHTML = '';
            return;
        }

        // Show no-data if empty
        if (Array.isArray(list) && list.length === 0) {
            this.removeAttribute('not-setup');
            return;
        }

        // Validate data type
        if (!Array.isArray(list)) {
            console.error('Invalid list data type for [data-list]');
            console.log(this);
            this.removeAttribute('not-setup');
            return;
        }

        // List Items
        const html = [];
        const templateSelector = this.getAttribute('template-selector');
        const rootClass = this.getAttribute('root-class');
        if (templateSelector !== null) {
            // Get and validate the template
            const template = document.querySelector(templateSelector);
            if (template === null) {
                console.error('Missing template from selector: ' + templateSelector);
                console.log(this);
                this.removeAttribute('not-setup');
                return;
            }
            if (template.nodeName !== 'TEMPLATE') {
                console.error('Element at selector [' + templateSelector + '] is not a <template>');
                console.log(this);
                this.removeAttribute('not-setup');
                return;
            }

            // Root Element is optional and only used if a template is used
            const rootElement = this.getAttribute('root-element');
            if (rootElement !== null) {
                if (rootClass === null) {
                    html.push(render`<${rootElement}>`);
                } else {
                    html.push(render`<${rootElement} class="${rootClass}">`);
                }
            }

            // Render each item in the template. A new function is dynamically created that simply
            // renders the contents of the template as a JavaScript template literal (template string).
            // The Tagged Template Literal function `render()` from [utils.js] is used to safely escape
            // the variables for HTML encoding.
            const tmpl = new Function('item', 'render', 'with(item){return render`' + template.innerHTML + '`}');
            for (const item of list) {
                html.push(tmpl(item, render));
            }

            // Close root element if defined
            if (rootElement !== null) {
                html.push(render`</${rootElement}>`);
            }
        } else {
            // Basic <ul> list
            if (rootClass === null) {
                html.push('<ul>');
            } else {
                html.push(render`<ul class="${rootClass}">`);
            }
            for (const item of list) {
                html.push(render`<li>${item}</li>`);
            }
            html.push('</ul>');
        }
        this.innerHTML = html.join('');

        // Remove this attribute after the first time a list has been rendered
        this.removeAttribute('not-setup');
    }
}

window.customElements.define('data-list', DataList);