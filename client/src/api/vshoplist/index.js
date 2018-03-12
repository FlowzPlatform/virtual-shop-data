import api from '../../api'
let model = 'vshop-list'
export default {
  // add: (data) => {
  // 	return api.request('post', '/' + model, data)
  // },
  get: (rowId) => {
  	return api.request('get', '/' + model + '/' + rowId)
  }
}