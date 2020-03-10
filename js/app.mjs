import CubicBezier from "./cubic-bezier.mjs";
import RippleButton from "./ripple_button.mjs";


Array.from(document.getElementsByClassName('ripple-button')).forEach(el => {
    new RippleButton(el)
})

const cubicBezier = new CubicBezier(document.getElementById('graph'))
window.cubicBezier = cubicBezier

window.moveIndicator = (x, y) => {
    const el = document.getElementById('indicator')

    indicator.style.left = `${x}px`
    indicator.style.top = `${y}px`
}

document.getElementById('runButton').onclick = () => {
    Array.from(document.getElementsByClassName('animation')).forEach(el => {
        el.classList.toggle('left')
    })
}

getGraphs()
async function getGraphs() {

    const els = Array.from(document.getElementsByClassName('graph-placeholder'))

    els.forEach(async el => {
        const graphName = el.id
        const url = `../assets/${graphName}.svg`
        const parent = el.parentElement
        
        const file = await fetch(url)
        const text = await file.text()
        const timing = parent.getAttribute('data-function')
        
        el.remove()
        const innerHTML = text + parent.innerHTML
        parent.innerHTML = innerHTML

        parent.onclick = () => {
            while(document.body.classList.contains('choice__shown')) {
                document.body.classList.remove('choice__shown')
            }

            document.documentElement.style.setProperty('--comparison-timing-function', timing)
            document.getElementById('comparisonLabel').innerText = `Comparison function - ${timing}`
        }
    })
}