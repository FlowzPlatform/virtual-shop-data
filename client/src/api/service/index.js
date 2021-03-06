import api from '../../api'

export default {
	supplyerList: () => {
		return api.request('get', '/filters/username', null, {'vId': process.env.vId})
	},
	productList: (vid, limit) => {
		return api.request('get', '/pdm?source=product_name,sku&$limit=' + limit, null, vid)
	},
	countProduct: (vid, limit) => {
		return api.request('get', '/pdm?source=sku&$limit=' + limit, null, vid)
	}
}
