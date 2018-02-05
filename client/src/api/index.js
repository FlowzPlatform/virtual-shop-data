import axios from 'axios'
import config from '../config/customConfig'
var VueCookie = require('vue-cookie')

export default {
  request (method, uri, data = null, headers) {
    if (!method) {
      console.error('API function call requires method argument')
      return
    }

    if (!uri) {
      console.error('API function call requires uri argument')
      return
    }

    let nHeaders = {}
    if(headers != undefined){
      nHeaders = Object.assign(headers, {'Authorization': VueCookie.get('auth_token')})
    }
    else{
      nHeaders = {'Authorization': VueCookie.get('auth_token')}
    }

    var url = config.default.feathersServiceBaseUrl + uri
    return axios({ method, url, data, 'headers':nHeaders })
    .then(response => {
      return response
    })
    .catch(error => {
      return error.response.status
    })
  }
}