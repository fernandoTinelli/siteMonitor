class Outputer {
    constructor(idOutput, callbackAlert) {
        this.idOutput = idOutput
        this.alert = callbackAlert
    }

    write(text) {
        const el = this.#getOutputer()
        el.value = el.value + text
    }

    writeLine(text) {
        const el = this.#getOutputer()
        el.value = el.value + '\n' + text
    }

    clear() {
        const el = this.#getOutputer()
        el.value = ''
    }

    alert(text) {
        callbackAlert(text)
    }

    #getOutputer() {
        return document.querySelector('#' + this.idOutput)
    }
}