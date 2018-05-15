import api from '../../api'
let model = 'vshopdata'
export default {
  add: (data) => {
  	return api.request('post', '/' + model, data)
  },
  getAllSupplier: () => {
    return api.request('get', '/' + model + '?userType=supplier&$paginate=false')
  },
  delete: (id) => {
    return api.request('delete', '/' + model + '/' + id)
  }
}