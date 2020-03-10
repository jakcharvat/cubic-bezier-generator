export default class CubicBezier {

/* -------------------------------------------------------------------------------------------------------- */
/*                                              Initialization                                              */
/* -------------------------------------------------------------------------------------------------------- */

    constructor(graph) {
        this.graph = graph
        this.draggedAnchor = undefined

        this.fetchChildTree()
        this.getSize()

        this.p1 = [0, 0] // End point one
        this.p2 = [1, 1] // End point two

        this.animationDuration = 1.0

        this.initAnchors()

        this.points = []

        this.setConnectorPosition(this.connector1, ...this.getPoints([this.anchor1[0], 1 - this.anchor1[1]]))
        this.setConnectorPosition(this.connector2, ...this.getPoints([this.anchor2[0], 1 - this.anchor2[1]]))

        this.setupListeners()

        this.drawCurve()

        this.display()
    }

    /**
     * Fetches and stores the important elements such as the canvas and the fixed and anchor points
     */
    fetchChildTree() {
        const children = this.getAllChildren(this.graph)
        
        this.canvas = children.filter(el => el.className === 'canvas')[0]
        this.fixedPoints = children.filter(el => el.classList.contains('point--fixed'))
        this.anchorPoints = children.filter(el => el.classList.contains('point--anchor'))
        this.connector1 = children.filter(el => el.className === 'connector first')[0]
        this.connector2 = children.filter(el => el.className === 'connector')[0]
    }

    /**
     * Reduces the child tree of the provided element to a single array of [HTMLElement]
     * 
     * @param el The element to get the children of
     * @returns HTMLElement[]
     */
    getAllChildren(el) {
        const els = [el]
        const children = []
        
        while(els.length > 0) {
            const e = els.shift()
            const ch = Array.from(e.children)
            
            ch.forEach(child => {
                if (child.children.length > 0) {
                    els.push(child)
                }
                children.push(child)
            })
        }

        return children
    }
    
    getSize() {
        const rect = this.canvas.getBoundingClientRect()
        this.width = rect.width
        this.height = rect.height

        const docrect = document.documentElement.getBoundingClientRect()
        this.canvasOffsetLeft = rect.left - docrect.left
        this.canvasOffsetTop = rect.top - docrect.top

        window.addEventListener('resize', () => {
            const rect = this.canvas.getBoundingClientRect()
            this.width = rect.width
            this.height = rect.height

            const docrect = document.documentElement.getBoundingClientRect()
            this.canvasOffsetLeft = rect.left - docrect.left
            this.canvasOffsetTop = rect.top - docrect.top

            this.setConnectorPosition(this.connector1, ...this.getPoints([this.anchor1[0], 1 - this.anchor1[1]]))
            this.setConnectorPosition(this.connector2, ...this.getPoints([this.anchor2[0], 1 - this.anchor2[1]]))

            const a1 = this.getPoints(this.anchor1)
            this.anchorPoints[0].style.left = `${a1[0]}px`
            this.anchorPoints[0].style.top = `${this.height - a1[1]}px`
            
            const a2 = this.getPoints(this.anchor2)
            this.anchorPoints[1].style.left = `${a2[0]}px`
            this.anchorPoints[1].style.top = `${this.height - a2[1]}px`

            this.drawCurve()
        })
    }

    initAnchors() {
        // Get anchor positions
        const canvasRect = this.canvas.getBoundingClientRect()
        this.anchorPoints.forEach(anchor => {
            const rect = anchor.getBoundingClientRect()

            // Get the anchor's bounding rect to get the anchor's left and top coordinates within the viewport. Subtract from it the left and top coordinates of the canvas element to get the anchor's position relative to the canvas. Lastly add half of the width or height of the anchor to account for [getBoundingClientRect()] displaying top and left values based on the element's top and left corner, not its centre. Divide them by the width and height of the canvas to get them as a fraction between 0 and 1 and store those as [x, y] pairs
            const left = rect.left - canvasRect.left + rect.width / 2
            const top = rect.top - canvasRect.top + rect.height / 2

            const x = left / this.width
            const y = 1 - top / this.height

            if (this.anchor1) {
                this.anchor2 = [x, y]
            } else {
                this.anchor1 = [x, y]
            }
        })

        this.canvas.addEventListener('mousedown', e => {
            const target = e.target

            if (target.classList.contains('point--anchor')) {
                this.draggedAnchor = target
            }
        })

        document.addEventListener('mousemove', e => {
            this.anchorMouseMove(e)
            this.sliderMove(e)
        })

        document.addEventListener('mouseup', e => {
            this.draggedAnchor = null
            this.sliderDown = false
        })
    }

    anchorMouseMove(e) {
        if (this.draggedAnchor) {
            let left = e.pageX - this.canvasOffsetLeft
            left = Math.max(0, Math.min(left, this.width))

            let top = e.pageY - this.canvasOffsetTop
            top = Math.max(0, Math.min(top, this.height))

            this.draggedAnchor.style.left = `${left}px`
            this.draggedAnchor.style.top = `${top}px`

            if (this.draggedAnchor.classList.contains('first')) {
                this.setConnectorPosition(this.connector1, left, top)
                this.anchor1 = [left / this.width, 1 - top / this.height]
            } else {
                this.setConnectorPosition(this.connector2, left, top)
                this.anchor2 = [left / this.width, 1 - top / this.height]
            }

            this.drawCurve()
            this.display()
        }
    }

    sliderMove(e) {
        const timeSlider = document.getElementById('timeSlider')
        const timeSliderThumb = document.getElementById('timeSliderThumb')
        const rect = timeSlider.getBoundingClientRect()

        if (this.sliderDown) {
            const offset = Math.min(rect.width, Math.max(0, e.screenX - rect.left))
            
            const decimal = offset / rect.width
            const index = Math.min(14, Math.max(0, Math.floor(decimal * 14 + 0.5)))

            const position = (index / 14) * rect.width
            const time = this.mapIndexToTime(index)

            this.animationDuration = time

            document.getElementById('timeIndicator').innerText = `Animation Duration = ${time.toFixed(1)}s`
            timeSliderThumb.style.left = `${position}px`
            document.documentElement.style.setProperty('--animation-duration', `${time}s`)
        }
    }

    mapIndexToTime(index) {
        return {
            0: 0.3,
            1: 0.4,
            2: 0.5,
            3: 0.6,
            4: 0.7,
            5: 0.8,
            6: 0.9,
            7: 1,
            8: 1.3,
            9: 1.7,
            10: 2,
            11: 2.5,
            12: 3,
            13: 3.5,
            14: 4,
        }[index];
    }

    setConnectorPosition(el, left, top) {
        let dx, dy, l, midx, midy, angle

        if (el.classList.contains('first')) {
            dx = left
            dy = this.height - top
            l = Math.sqrt(dx ** 2 + dy ** 2)
            midx = dx / 2
            midy = dy / 2 + top
            angle = -Math.atan(dy / dx) * 180 / Math.PI
        } else {
            dx = this.width - left
            dy = top
            l = Math.sqrt(dx ** 2 + dy ** 2)
            midx = dx / 2 + left
            midy = dy / 2
            angle = -Math.atan(dy / dx) * 180 / Math.PI
        }

        el.style.width = `${l}px`
        el.style.left = `${midx}px`
        el.style.top = `${midy}px`
        el.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`
    }

    getPoints([x, y]) {
        return [x * this.width, y * this.height]
    }

    getBezierPoint(t) {
        const x = (1 - t) ** 3 * this.p1[0] + 3 * (1 - t) ** 2 * t * this.anchor1[0]
                    + 3 * (1 - t) * t ** 2 * this.anchor2[0] + t ** 3 * this.p2[0]
        const y = (1 - t) ** 3 * this.p1[1] + 3 * (1 - t) ** 2 * t * this.anchor1[1]
                    + 3 * (1 - t) * t ** 2 * this.anchor2[1] + t ** 3 * this.p2[1]
        
        return [x, y]
    }

    drawCurve() {

        for (const point of this.points) {
            point.remove()
        }
        
        this.points = []

        const dots = 500

        for (let i = 0; i <= dots; i ++) {
            const t = i / dots
            const coords = this.getPoints(this.getBezierPoint(t))
            const point = document.createElement('div')
            point.className = 'canvas--point'
            point.style.left = `${coords[0]}px`
            point.style.top = `${this.height - coords[1]}px`
            this.canvas.appendChild(point)
            this.points.push(point)
        }
    }

    display() {
        const x1 = this.anchor1[0].toFixed(2)
        const y1 = this.anchor1[1].toFixed(2)

        const x2 = this.anchor2[0].toFixed(2)
        const y2 = this.anchor2[1].toFixed(2)
        const str = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`

        document.getElementById('display').innerText = str
        document.documentElement.style.setProperty('--custom-timing-function', str)
    }

    setupListeners() {
        document.getElementById('showChoiceButton').onclick = () => {
            document.body.classList.add('choice__shown')
        }

        document.getElementById('choiceOverlay').onclick = (e) => {
            if (e.target.className !== 'choice-dialog--overlay') return;
            
            while(document.body.classList.contains('choice__shown')) {
                document.body.classList.remove('choice__shown')
            }
        }

        this.setupTimeSlider()
    }

    setupTimeSlider() {
        const timeSliderThumb = document.getElementById('timeSliderThumb')
        this.sliderDown = false

        timeSliderThumb.onmousedown = e => {
            this.sliderDown = true
        }
    }
}