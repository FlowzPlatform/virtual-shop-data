import api from '../../api'
let model = 'vshop-list'
export default {
  // add: (data) => {
  // 	return api.request('post', '/' + model, data)
  // },
  get: (rowId) => {
    if (rowId != undefined) {
      return api.request('get', '/' + model + '/' + rowId)
    } else {
      return api.request('get', '/' + model)
    }
  },
  getAll: () => {
    return api.request('get', '/' + model + '?all=1&$limit=100')
  }
}