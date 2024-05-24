const { exec } = require('child_process')
const { fs } = require('fs')
const { join } = require('path')
const mirrors = require('./mirrors.js')

console.log(mirrors)

// regex to remove url protocol and path
const regex = /^(?:https?:\/\/)?([^\/]+)(\/.*)?/;
/*
const mirrors = [
  "http://ubuntu.mti.mt.gov.br/",
  "http://ubuntu-archive.locaweb.com.br/ubuntu/",
  "http://mirror.ufam.edu.br/ubuntu/",
  "http://sft.if.usp.br/ubuntu/",
  "http://mirror.ufscar.br/ubuntu/",
  "https://mirror.uepg.br/ubuntu/",
  "http://ubuntu.c3sl.ufpr.br/ubuntu/",
  "http://mirror.unesp.br/ubuntu/",
  "http://archive.ubuntu.com/ubuntu/",
]
const mirrors = [
  "http://ubuntu.mti.mt.gov.br/",
  "http://ubuntu-archive.locaweb.com.br/ubuntu/",
]
*/

const writeResultsInAFile = async (filename = '', content = '') => {
  fs.writeFile(join(__dirname, filename + '.txt'), content, err => {
    if (err) return console.error('[writeResultsInAFile]: error while writing file')

    return true
  })
}

const mirrorsWithoutPathAndProtocol = mirrors.map((url) => url.replace(regex, '$1'))

/** @param {string} mirror */
const pingMirror = (mirror) => {
  return new Promise((resolve, reject) => {
    exec(`ping -c 4 ${mirror} `, (error, stdout, stderr) => {
      if (error) {
        console.error('\n', error)
        reject(error)
        return
      }
      const lines = stdout.split('\n')
      const statsLine = lines[lines.length - 2]
      const stats = statsLine.match(/(\d+\.\d+)\/(\d+\.\d+)\/(\d+\.\d+)\/(\d+\.\d+) ms/)

      if (!stats) {
        reject(new Error('> Failed to parse ping output'))
        return
      }

      const jsonData = {
        mirror: mirror,
        rtt: {
          min: parseFloat(stats[1]),
          avg: parseFloat(stats[2]),
          max: parseFloat(stats[3]),
          mdev: parseFloat(stats[4]),
        }
      }

      resolve(jsonData)
    })
  })
}

const pingAllMirrors = async (mirrors = []) => {
  const results = []

  for (const mirror of mirrors) {
    try {
      const result = await pingMirror(mirror)
      results.push(result)
      console.log(`> Ping to ${mirror} successful.`)
    }
    catch(err) {
      console.log(`> Failed to ping ${mirror}`)
      console.error(err.message)
    }
  }

  return results
}

/** 
 * @typedef {Object} TMirrorsResult
 * @prop {{ mirror: string; rtt: { min: number; avg: number; max:number; mdev: number }  }[]} original
 * @prop {{ mirror: string; rtt: { min: number; avg: number; max:number; mdev: number }  }[]} orderedByAvgTime
 * @prop {string[]} orderedByAvgTimeUrlOnly
 * */
/** @returns {TMirrorResult} */
const getMirrorsResult = async () => {
  const mirrorsResponseResult = await pingAllMirrors(mirrorsWithoutPathAndProtocol)

  const mirrorsOrdered = mirrorsResponseResult.sort((a, b) => a.rtt.avg - b.rtt.avg)
  const mirrorsURLOnly = mirrorsOrdered.map((mirrorData) => {
    const mirrorName = mirrorData.mirror
    for (let i = 0; i < mirrors.length; i++) {
      const mirrorWithProtocolAndPath = mirrors[i]
      if (mirrorWithProtocolAndPath.includes(mirrorName)) {
        return mirrorWithProtocolAndPath
      }
    }
  })
  
  return { result: { original: mirrorsResponseResult, orderedByAvgTime: mirrorsOrdered, orderedByAvgTimeUrlOnly: mirrorsURLOnly  }  }
}

getMirrorsResult()
  .then((results) => {
    const result = results.result
    const mirrorsURLOnly = result.orderedByAvgTimeUrlOnly
    let content = ''
    for (const mirrorURL of mirrorsURLOnly) {
      content += `deb ${mirrorURL} jammy main restricted universe multiverse\n`
      content += `deb-src ${mirrorURL} jammy main restricted universe multiverse\n`
    }
    
    console.log('\n> Mirrors ordered by Average Response Time\n')
    console.log(content)
  })
.catch((err) => console.error(err))
