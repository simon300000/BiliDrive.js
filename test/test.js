/* global describe */
/* global it */

const { getMeta, extract } = require('..')

const { assert } = require('chai')

const base = 'bdrive://3db04ea69347cb9f3e24ba9142ed93f41df063d2'

describe('BiliDrive.js', function() {
  describe('getMeta', function() {
    it('should reject with wrong bdrive url', async function() {
      const result = await getMeta('2333').catch(() => 26)
      assert.strictEqual(result, 26)
    })
    it('output', async function() {
      const { filename, sha1, block, list } = await getMeta(base)
      assert.strictEqual(sha1, '9111d1d4652b8342cb1b36cd961c841c52601107')
      assert.strictEqual(filename, 'Python-3.8.0.tgz')
      assert.isArray(block)
      assert.isArray(list)
    })
  })
  describe('getMeta', function() {
    it('buffer correct length', async function() {
      const buf = await extract('http://i0.hdslb.com/bfs/album/3db04ea69347cb9f3e24ba9142ed93f41df063d2.x-ms-bmp')
      assert.strictEqual(buf.length, 1099)
    })
  })
})
