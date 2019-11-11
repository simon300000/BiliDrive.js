const { mkdir, open, rename } = require('fs').promises
const { join } = require('path')
const got = require('got')

const extract = async url => {
  const { body } = await got(url, { encoding: null })
  // const headerLength = body.readUInt8(10)
  const headerLength = 62
  return body.slice(headerLength)
}

const processMeta = async sha1 => {
  const body = await extract(`http://i0.hdslb.com/bfs/album/${sha1}.x-ms-bmp`)
  return JSON.parse(String(body))
}

const saver = ({ list, handler, parallel }) => {
  const waiting = list.map(({ url, position }) => async () => {
    console.log(url)
    const buf = await extract(url)
    await handler.write(buf, 0, buf.length, position)
  })
  return Array(parallel)
    .fill()
    .map(async () => {
      while (waiting.length) {
        const work = waiting.shift()
        await work()
      }
    })
    .reduce((a, b) => Promise.all([a, b]))
}

const download = async (bdriveURL, { dir = './tmp', parallel = 16 } = {}) => {
  const url = new URL(bdriveURL)
  if (url.protocol !== 'bdrive:') {
    throw new Error('Protocol must be bdrive:')
  }

  await mkdir(dir, { recursive: true })

  const { filename, sha1, block } = await processMeta(url.host)

  const tempFilePath = join(dir, sha1)
  const finalFilePath = join(dir, filename)
  const handler = await open(tempFilePath, 'w')

  const list = block
    .reduce((blocks, { url, size, sha1 }) => {
      const { position: lastPosition = 0, size: lastSize = 0 } = blocks[0] || {}
      return [{ url, size, sha1, position: lastPosition + lastSize }, ...blocks]
    }, [])
    .reverse()

  await saver({ list, handler, parallel })
  await rename(tempFilePath, finalFilePath)
  return finalFilePath
}

module.exports = {
  download
}
