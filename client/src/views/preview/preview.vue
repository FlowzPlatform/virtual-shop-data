<template>
	<div>
		<Card>
			<Collapse>
        <Panel v-for="productData in productData">
            {{ productData.name }}
            <Table border slot="content" :columns="supplyerList" :data="productData.supplyers"></Table>
        </Panel>
    	</Collapse>
		</Card>
	</div>
</template>

<script>
	import vshopdata from '@/api/vshopdata'

  export default {
    data () {
      return {
      	productData : [],
      	supplyerList : [
          {
            title: 'Supplyers',
            render: (h, params) => {
              return h('div', [
                h('Icon', {
                  props: {
                    type: 'person'
                  }
                }),
                h('strong', ' '+params.row.supplyerName)
              ]);
            }
          }
        ]
      }
    },
    async mounted(){
    	let self = this
      let productData = await vshopdata.getAll()
      this.productData = productData.data.data
    }
  }
</script>