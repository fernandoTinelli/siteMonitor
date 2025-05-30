const { error, log } = require('console')
const https = require('https')
const Diff = require('diff');

const getMonitor = () => {
    const url = 'https://colaboragov.sei.gov.br/sei/modulos/pesquisa/md_pesq_processo_exibir.php?FPWf5H7A2cVMiAtzZwygexREg6bL0LbNgvUE4YEJCnGtPHCdgfU85G2dEaFHn66TKJEeFfp+kVnEa77aEgyvc0Frsj0Lp/vUZz6rDUN0bt22M35BnhC/5T1bmDosTnxN'
    const defaultTime = 4
    const minimumTime = 1
    const maximumTime = 8

    let lastContent = null
    let time = defaultTime
    let pingIndex = 0

    function doPing() {
        pingIndex++

        log("ping#" + pingIndex + "...")

        https.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => onDone(data));
            response.on('error', onError);
        }).on('error', onError)      
    }

    function onDone(html) {
        log("ping#" + pingIndex + "...OK")

        const content = getContent(html)

        if (content === null) {
            onError({message: "error on get content"})
        } else {
            if (lastContent === null) {
                lastContent = content
            } else if (content === lastContent) {
                log("nothing change")
            } else {            
                log("CHANGE DETECTED!!!")

                const diff = Diff.diffWords(lastContent, content);
                diff.forEach(part => {
                    if (part.added) {
                        log(`Added: ${part.value}`);
                    } else if (part.removed) {
                        log(`Removed: ${part.value}`);
                    }
                });

                return
            } 
        }      

        prepareNextPing()
    }

    function onError(err) {
        error(err.message)
    }

    function getContent(html) {
        const regex = /<body[^>]*>(.*?)<\/body>/is;  
        const result = html.match(regex);
        
        if (result) {
            const bodyContent = result[1];            
            const text = bodyContent.replace(/<[^>]*>/g, '').trim();
            return text;
        }
        
        return null;
    }

    function prepareNextPing() {        
        const timeout = getTimeout(time)
        const ftimeout = formatMillis(timeout)
        log('waiting for ' + ftimeout + '')
        setTimeout(doPing, timeout)
    }

    function getTimeout(time) {
        const signal = Math.random() > .4 ? 1 : -1
        const noise = Math.random() * time / 2
        const timeWithNoise = time + (signal * noise)
        return toMillis(timeWithNoise)
    }

    function toMillis(time) {
        const min = 100000 * minimumTime
        const max = 100000 * maximumTime
        let millis = 100000 * time
        millis = millis < min ? min : millis
        millis = millis > max ? max : millis
        return millis
    }

    function formatMillis(millis) {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }

    return {
        start: (time = 5) => {
            console.log("Start monitoring: " + url)
            // doPing()
        }
    }
}

module.exports = getMonitor