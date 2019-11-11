const { mkdir, open, rename } = require('fs').promises
const { join } = require('path')
const got = require('got')

/**
 * 下载并剪裁目标url
 * @method extract
 * @param  {string}  url     url
 * @return {Promise<Buffer>} 目标URL剪裁之后的buffer
 */
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

const saver = ({ list, handle, parallel }) => {
  const waiting = list.map(({ url, position }) => async () => {
    console.log(url)
    const buf = await extract(url)
    await handle.write(buf, 0, buf.length, position)
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

const getSHA1 = bdriveURL => {
  const url = new URL(bdriveURL)
  if (url.protocol !== 'bdrive:') {
    throw new Error('Protocol must be bdrive:')
  }
  return url.host
}

/**
 * 通过bdrive链接获取URL
 * @method getMeta
 * @param  {String} bdriveURL bdrive协议url
 * @return {Promise<{filename:String,sha1:String,block:{url:String,size:Number,sha1:String}[],list:{url:String,size:Number,sha1:String,position:Number}[]}>} META
 */
const getMeta = async bdriveURL => {
  const index = getSHA1(bdriveURL)
  const { filename, sha1, block } = await processMeta(index)
  const list = block
    .reduce((blocks, { url, size, sha1 }) => {
      const { position: lastPosition = 0, size: lastSize = 0 } = blocks[0] || {}
      return [{ url, size, sha1, position: lastPosition + lastSize }, ...blocks]
    }, [])
    .reverse()
  return { filename, sha1, block, list }
}

/**
 * 在指定目录中下载文件
 * @method download
 * @param  {String}  bdriveURL                           bdrive协议url
 * @param  {Object}  [options={dir='./tmp',parallel=16}] 设置
 * @return {Promise<String>}                             下载完成后的文件位置
 */
const download = async (bdriveURL, { dir = './tmp', parallel = 16 } = {}) => {
  const { filename, sha1, list } = await getMeta(bdriveURL)

  await mkdir(dir, { recursive: true })

  const tempFilePath = join(dir, sha1)
  const finalFilePath = join(dir, filename)
  const handle = await open(tempFilePath, 'w')

  await saver({ list, handle, parallel })
  await rename(tempFilePath, finalFilePath)
  await handle.close()
  return finalFilePath
}

module.exports = {
  download,
  getMeta,
  extract
}
