import { generate } from "./generate";

import { parse } from "./parse";
import { update } from './update';
import { createVnode, Vnode, createListVnode, createEmptyVNode } from "./vnode";
import { Watcher } from "./watcher";
import { initState } from './init'
import EventEmitter from "./event-emitter";



declare global {
    interface Dict<T> { [props: string]: T }
}

export interface Options {
    template: string;
    render?: Function;
    data?: (() => object) | object;
    methods?: { [prop: string]: Function };
    components?: { [prop: string]: Options };
    mounted?: Function;
    destroyed?: Function;
    props?: Dict<any>;
}

const toFunction = function (body: string): Function {
    return new Function(`with(this._vi){return ${body}}`);
}


const mergeOptions = function (options: Options) {
    const keys = Object.keys(options);
    return {
        ...options
    }
}









export default class Vision extends EventEmitter {
    _data?: { [prop: string]: ProxyConstructor | any };
    props?: ProxyConstructor;
    _vi: ProxyConstructor;
    public $el: HTMLElement
    public _vnode: Vnode;
    private _render: Function;
    public $children: Vision[] = [];
    $options: Options;
    constructor(options: Options) {
        super();
        this.$options = mergeOptions(options);
        this.init(options);
    }

    public update = update;

    private init(options: Options) {
        initState(this, options);
    }
    private _c = createVnode;
    private _l = createListVnode;
    private _e = createEmptyVNode;
    $mount(el: HTMLElement) {
        const options = this.$options;
        const ast = parse(options.template);
        const render = toFunction(generate(ast));
        this._render = render;

        new Watcher(this, function () {
            try {
                this.update(el, this._render())
            } catch (ex) {
                console.error("update Error: ", ex.message, ex.stack)
            }
        });

        if (options.mounted) {
            options.mounted.apply(this._vi);
        }

    }
}