import api from '../../api'
let model = 'vshopdata'
export default {
  add: (data) => {
  	return api.request('post', '/' + model, data)
  }
}