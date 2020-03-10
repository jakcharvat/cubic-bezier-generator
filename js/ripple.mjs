import anime from './anime.es.js'

export default class Ripple {
    constructor(parentNode, e) {
        this.parentNode = parentNode
        this.e = e

        this.createRipple()
        this.runOpenAnimation()
        // this.setupAnimation()
    }

    createRipple() {
        const btnWidth = this.parentNode.getBoundingClientRect().width
        const btnHeight = this.parentNode.getBoundingClientRect().height

        const maxDx = Math.max(btnWidth - this.e.layerX, this.e.layerX)
        const maxDy = Math.max(btnHeight - this.e.layerY, this.e.layerY)

        const r = Math.sqrt(maxDx ** 2 + maxDy ** 2)

        const rippleContainer = document.createElement('div')
        rippleContainer.className = 'ripple-container'

        rippleContainer.style.width = `${r * 2}px`
        rippleContainer.style.height = `${r * 2}px`
        rippleContainer.style.left = `${this.e.layerX}px`
        rippleContainer.style.top = `${this.e.layerY}px`

        const ripple = document.createElement('div')
        ripple.className = 'ripple'

        this.rippleContainer = rippleContainer
        this.ripple = ripple

        rippleContainer.appendChild(ripple)
        this.parentNode.appendChild(rippleContainer)
    }

    removeRipple() {
        this.parentNode.remove(this.rippleContainer)
    }

    runOpenAnimation() {
        this.finishedOpening = false
        this.mouseUp = false

        let timeline = anime.timeline()

        timeline.add({
            targets: this.ripple,
            scale: [0, 1],
            easing: 'easeOutQuart',
        }).add({
            scale: 1,
            duration: 0,
            complete: () => {
                if (this.mouseUp) this.runFadeAnimation()
                else this.finishedOpening = true
            }
        }, '-=400')
    }

    mouseRaise() {
        if (this.finishedOpening) this.runFadeAnimation()
        else this.mouseUp = true
    }

    runFadeAnimation() {
        anime({
            targets: this.ripple, 
            opacity: [0.3, 0],
            easing: 'linear',
            duration: 150,
            complete: () => this.parentNode.removeChild(this.rippleContainer)
        })
    }

    setupAnimation() {
    }
}