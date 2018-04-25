import api from '../../api'
let model = 'vshopdata'
export default {
  add: (data, userSubscriptionId) => {
  	return api.request('post', '/' + model, data, null, userSubscriptionId)
  },
  getAllSupplier: () => {
    return api.request('get', '/' + model + '?userType=supplier&$paginate=false')
  },
  delete: (id) => {
    return api.request('delete', '/' + model + '/' + id)
  }
}