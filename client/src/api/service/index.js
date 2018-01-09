import api from '../../api'

export default {
  supplyerList: () => {
    return api.request('get', '/filters/username')
  },
  productList: (data) => {
  	return api.request('post', '/api/products', data)
  }
}