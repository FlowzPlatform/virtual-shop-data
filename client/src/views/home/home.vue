<style lang="less">
  @import "./home.less";
  @import "../../styles/common.less";
</style>
<template>
  <div>
    <Card>
      <Row slot="title" :gutter="16">
        <Col :md="{ span: 10 }">
          <p>Suppliers and Products</p>    
        </Col>
        <Col :md="{ span: 12 }">
          <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
            <FormItem label="Name" prop="name">
              <Input v-model="formValidate.name" placeholder="Enter Data Name"></Input>
            </FormItem>
          </Form>
        </Col>
        <Col :md="{ span: 2 }">
          <Button type="primary" long @click="submitData('formValidate')">Submit</Button>
        </Col>
      </Row>
      
      <Row :gutter="16">
        <Col :xs="{ span: 24 }" :md="{ span: 8 }">
          <Table :loading="suplayerLoading" :columns="supplyer" :data="supplyerList" :highlight-row="true" @on-row-click="getProducts"></Table>
        </Col>
        <Col :xs="{ span: 24 }" :md="{ span: 8 }">
          <Input v-model="productSearch" placeholder="Search Product..."></Input>
          <Table border ref="selection" :loading="productLoading" :columns="product" :data="searchProduct" @on-selection-change="getSelectedProduct"></Table>
        </Col>
        <Col :xs="{ span: 24 }" :md="{ span: 8 }">
          <Table border :columns="selectedProducts" :data="selectedData" :loading="selectedData.length<1"></Table>
        </Col>
      </Row>
    </Card>
  </div>
</template>
<script>
  import service from '@/api/service'
  import vshopdata from '@/api/vshopdata'

  export default {
  	name: 'home',
    data () {
      return {
        formValidate: {
          name: ''
        },
        ruleValidate: {
          name: [
            { required: true, message: 'The name cannot be empty', trigger: 'blur' }
          ]
        },
        supplyer: [
          {
            title: 'Suppliers',
            key: 'key',
            render: (h, params) => {
              return h('div', [
                h('Icon', {
                  props: {
                    type: 'person'
                  }
                }),
                h('strong', ' '+params.row.key)
              ]);
            }
          },
          {
            title: 'No of products',
            key: 'doc_count'
          }
        ],
        product: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: 'Products',
            render: (h, params) => {
              return h('div', [
                h('Icon', {
                  props: {
                    type: 'person'
                  }
                }),
                h('strong', ' '+params.row._source.product_name)
              ]);
            }
          }
        ],
        selectedProducts: [
          {
            title: 'Total',
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
          },
          {
            title: 'No of products',
            render: (h, params) => {
              return h('div', [
                h('div', params.row.products.length)
              ]);
            }
          }
        ],
        suplayerLoading: true,
        productLoading: true,
        productSearch: '',
        supplyerList: [],
        productList: [],
        selectedData: [],
        selectedSupplyer: ''
      }
    },
    methods:{
      async getProducts(data){
        this.productLoading = true
        let self = this 
        this.selectedSupplyer = data.key
        let obj = this.selectedData.filter(function (obj) { return obj.supplyerName === self.selectedSupplyer })
        if(obj.length<1){
          this.selectedData.push({'supplyerName':this.selectedSupplyer,'products':[],'approve':true})
        }

         let body = {
           "country":"US",
           "query": {
            "match": {
              "supplier_info.username": this.selectedSupplyer
            }
          }
        }

        let productList = await service.productList(body)
        if(productList === 401){
          this.$router.push({ path: '/login' })
        }
        else{
          this.productList = productList.data.hits.hits
          if(this.productList.length>0){
            this.productLoading = false
          }
        }
      },
      getSelectedProduct(data){
        let self = this
        this.selectedData.filter(function(el) {
          if(el.supplyerName == self.selectedSupplyer){
            el.products = data.map(a => a._source.sku)
          }
        })
      },
      async submitData(name){
         this.$refs[name].validate(async (valid) => {
          if (valid) {
            if(this.selectedData.length>0){
              let finalData = {
                "virtualShopName":this.formValidate.name,
                "suppliers":this.selectedData
              }
              let savedData = await vshopdata.add(finalData)
              if(savedData.status == 201){
                this.$Message.success('Saved successfully!');
                this.$router.push({
                  name: 'preview'
                });
              }
            }
          } else {
            this.$Message.error('Please fill required fields !');
          }
        })
      }
    },
    computed:{
      searchProduct(){
        let self = this
        let data1 = this.productList.slice()
        return data1.filter(function(el) {
          if( el._source.product_name.toLowerCase().includes(self.productSearch.toLowerCase())){
            return el
          }
        })
      }
    },
    async mounted(){
      let supplyerList = await service.supplyerList()
      if(supplyerList === 401){
        this.$router.push({ path: '/login' })
      }
      else{
        this.supplyerList = supplyerList.data.aggregations.group_by_username.buckets
        if(this.supplyerList.length>0){
          this.suplayerLoading = false
        }
      }
    }
  }
</script>
