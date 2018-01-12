import api from '../../api'

export default {
  supplyerList: () => {
  	return api.request('get', '/filters/username', null, {"vId":process.env.vId})
  },
  productList: (data) => {
  	return api.request('get', '/pdm', null, {"vId":process.env.vId})
  }
}