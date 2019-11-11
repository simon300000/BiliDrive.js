# BiliDrive.js [![npm](https://img.shields.io/npm/v/bilidrive.svg)](https://www.npmjs.com/package/bilidrive) ![](https://github.com/simon300000/relationX/workflows/Node%20CI/badge.svg) [![Coverage Status](https://coveralls.io/repos/github/simon300000/BiliDrive.js/badge.svg?branch=master)](https://coveralls.io/github/simon300000/BiliDrive.js?branch=master)
 ☁️哔哩哔哩云 JavaScriptCore (Node.js 限定)

## 安装

```shell
npm install bilidrive -S
```

## 使用

```javascript
const { download, getMeta, extract } = require('bilidrive')
```

### download(bdriveURL, { dir, parallel })

```javascript
/**
 * 在指定目录中下载文件
 * @method download
 * @param  {String}  bdriveURL                           bdrive协议url
 * @param  {Object}  [options={dir='./tmp',parallel=16}] 设置
 * @return {Promise<String>}                             下载完成后的文件位置
 */
const download = async (bdriveURL = 233, { dir = './tmp', parallel = 16 } = {}) => Promise<String>
```

### getMeta(bdriveURL)

```javascript
/**
 * 通过bdrive链接获取URL
 * @method getMeta
 * @param  {String} bdriveURL bdrive协议url
 * @return {Promise<{filename:String,sha1:String,block:{url:String,size:Number,sha1:String}[],list:{url:String,size:Number,sha1:String,position:Number}[]}>} META
 */
const getMeta = async bdriveURL => Promise<{
                                             filename:String,
                                             sha1:String,
                                             block:{
                                               url:String,
                                               size:Number,
                                               sha1:String}[],
                                             list:{
                                               url:String,
                                               size:Number,
                                               sha1:String,
                                               position:Number}[]
                                           }>
```

### extract(url)

```javascript
/**
 * 下载并剪裁目标url
 * @method extract
 * @param  {string}  url     url
 * @return {Promise<Buffer>} 目标URL剪裁之后的buffer
 */
const extract = async url => Promise<Buffer>
```

