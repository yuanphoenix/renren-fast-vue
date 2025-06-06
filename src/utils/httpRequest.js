import Vue from 'vue'
import axios from 'axios'
import router from '@/router'
import qs from 'qs'
import merge from 'lodash/merge'
import {clearLoginInfo} from '@/utils'

const http = axios.create({
  timeout: 1000 * 30,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
})

/**
 * 请求拦截
 */
http.interceptors.request.use(config => {
  config.headers['token'] = Vue.cookie.get('token') // 请求头带上token
  return config
}, error => {
  return Promise.reject(error)
})

/**
 * 响应拦截
 */
http.interceptors.response.use(response => {
  if (response.data && response.data.code === 401) { // 401, token失效
    clearLoginInfo()
    router.push({name: 'login'})
  }
  return response
}, error => {
  return Promise.reject(error)
})

/**
 * 拼接请求地址
 * @param {string} actionName 接口路径，如：/category/list
 * @param {string} type 可选，指定 baseUrl 类型，例如 'product', 'user'
 */
http.adornUrl = (actionName, type = 'default') => {
  let baseUrl = window.SITE_CONFIG.baseUrl // 默认 baseUrl

  if (type === 'gateway') {
    baseUrl = window.SITE_CONFIG.gateway
  }

  if (process.env.NODE_ENV !== 'production' && process.env.OPEN_PROXY) {
    return '/proxyApi/' + actionName
  } else {
    return baseUrl + actionName
  }
}

/**
 * 拼接请求地址
 * @param {string} actionName 接口路径，如：/category/list
 * @param {string} type 可选，指定 baseUrl 类型，例如 'product', 'user'
 */
http.gulimalladornUrl = (actionName, type = '') => {

  let baseUrl = window.SITE_CONFIG.baseUrl

  if (process.env.NODE_ENV !== 'production' && process.env.OPEN_PROXY) {
    return '/proxyApi/' + actionName
  } else {
    return baseUrl + actionName
  }
}

/**
 * get请求参数处理
 * @param {*} params 参数对象
 * @param {*} openDefaultParams 是否开启默认参数?
 */
http.adornParams = (params = {}, openDefaultParams = true) => {
  var defaults = {
    't': new Date().getTime()
  }
  return openDefaultParams ? merge(defaults, params) : params
}

/**
 * post请求数据处理
 * @param {*} data 数据对象
 * @param {*} openDefaultData 是否开启默认数据?
 * @param {*} contentType 数据格式
 *  json: 'application/json; charset=utf-8'
 *  form: 'application/x-www-form-urlencoded; charset=utf-8'
 */
http.adornData = (data = {}, openDefaultData = true, contentType = 'json') => {
  var defaults = {
    't': new Date().getTime()
  }
  data = openDefaultData ? merge(defaults, data) : data
  return contentType === 'json' ? JSON.stringify(data) : qs.stringify(data)
}

export default http
