class Monitor {
    constructor(url, outputer, callbackStartTime, defaultTime = 1, minimumTime = 1, maximumTime = 1) {
        this.url = encodeURIComponent(url);
        this.outputer = outputer
        this.callbackStartTime = callbackStartTime
        this.defaultTime = defaultTime
        this.minimumTime = minimumTime
        this.maximumTime = maximumTime

        this.lastContent = null
        this.time = defaultTime
        this.pingIndex = 0
    }

    start(time = this.defaultTime) {
        this.time = time
        this.#doPing()
    }

    #doPing() {
        this.pingIndex++

        this.outputer.clear()
        this.outputer.write(`Verificando (${this.pingIndex})`)

        fetch(`http://localhost:3000/ping?url=${this.url}`)
            .then(response => response.text())
            .then(html => this.#onDone(html))
            .catch(err => this.#onError(err))
    }

    #onDone(html) {
        this.outputer.writeLine(`...OK`)

        const content = this.#getContent(html)

        if (content === null) {
            this.#onError({ message: "error on get content" })
            return
        }

        if (this.lastContent === null) {
            this.lastContent = content
        } else if (content === this.lastContent) {
            this.outputer.writeLine("Nenhuma mudança detectada")
        } else {
            this.outputer.alert("MUDANÇA DETECTADA!!!")
            this.#showDiff(this.lastContent, content)
            return
        }

        this.#prepareNextPing()
    }

    #onError(err) {
        console.error(err.message || err)
    }

    #getContent(html) {
        const regex = /<body[^>]*>([\s\S]*?)<\/body>/i
        const result = html.match(regex)

        if (result) {
            const bodyContent = result[1]
            const text = bodyContent.replace(/<[^>]*>/g, "").trim()
            return text
        }

        return null
    }

    #prepareNextPing() {
        this.outputer.writeLine("Aguardando")
        const timeout = this.#getTimeout(this.time)
        const ftimeout = this.#formatMillis(timeout)
        this.callbackStartTime(ftimeout)
        setTimeout(() => this.#doPing(), timeout)
    }

    #getTimeout(time) {
        const signal = Math.random() > 0.4 ? 1 : -1
        const noise = Math.random() * time / 2
        const timeWithNoise = time + (signal * noise)
        return this.#toMillis(timeWithNoise)
    }

    #toMillis(time) {
        const min = 60000 * this.minimumTime // 1 minuto = 60000 ms
        const max = 60000 * this.maximumTime
        let millis = 60000 * time
        millis = millis < min ? min : millis
        millis = millis > max ? max : millis
        return millis
    }

    #formatMillis(millis) {
        const minutes = Math.floor(millis / 60000)
        const seconds = ((millis % 60000) / 1000).toFixed(0)
        return minutes + ":" + (seconds < 10 ? "0" : "") + seconds
    }

    // Função simples que mostra diferença entre textos (não tão avançado quanto Diff do Node)
    #showDiff(oldText, newText) {
        const oldWords = oldText.split(/\s+/)
        const newWords = newText.split(/\s+/)

        let added = []
        let removed = []

        // Detecta palavras removidas
        oldWords.forEach(word => {
            if (!newWords.includes(word)) removed.push(word)
        })

        // Detecta palavras adicionadas
        newWords.forEach(word => {
            if (!oldWords.includes(word)) added.push(word)
        })

        if (added.length) {
            this.outputer.clear()
            this.outputer.write("Adicionado: " + added.join(" "))
        }
    }
}