import Ripple from './ripple.mjs'


export default class RippleButton {
    constructor(node) {
        this.node = node
        this.ripples = []

        this.setupListeners()
    }

    setupListeners() {
        this.node.addEventListener('mousedown', (e) => this.ripples.push(new Ripple(this.node, e)))
        this.node.addEventListener('mouseup', () => this.mouseUpHandler())
        this.node.addEventListener('mouseout', () => this.mouseUpHandler())
    }

    mouseUpHandler() {
        if (this.ripples[this.ripples.length - 1]) {
            this.ripples[this.ripples.length - 1].mouseRaise()
        }
    }
}
