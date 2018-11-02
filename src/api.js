import nocallback from './methods/nocallback'

const isWechat = typeof wx !== 'undefined' && typeof wx.showToast === 'function'
const isAlipay = typeof my !== 'undefined' && typeof my.showToast === 'function'

const $global = isWechat ? wx : my

const _toString = Object.prototype.toString

/**
 * 挂载API
 */
function _addMethod(methods){
  Object.assign(this, methods)

  // 其它 API 或属性
  for (let attr in $global) {
    if (!this.hasOwnProperty(attr)) {
      if(typeof $global[attr] === 'function'){

        this[attr] = (opts) => {
          let type = _toString.call(opts)

          if((type === '[object Undefined]' || type === '[object Object]')
           && nocallback.indexOf(attr) === -1
          ){
            return _Promised(attr, opts)
          }else{
            return $global[attr](opts)
          }
        }

      }else{
        this[attr] = $global[attr]
      }
    }
  }
}

/**
 * Promise包装
 * @param {string} method 
 * @param {object} opts 
 * @param {function} onResolve 
 * @param {function} onReject 
 */
function _Promised(method, opts = {}, onResolve, onReject){
  return new Promise((resolve, reject) => {
    const _success = opts.success
    const _fail = opts.fail

    opts.success = (res) => {
      onResolve && onResolve(res)
      _success && _success(res)
      resolve(res)
    }
    opts.fail = (res) => {
      onReject && onReject(res)
      _fail && _fail(res)
      reject(res)
    }
    
    if(typeof $global[method] === 'function'){
      $global[method](opts)
    }
  })
}

module.exports = {
  isWechat,
  isAlipay,
  $global,
  _addMethod,
  _Promised
}