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
          <Table height="500" border ref="selection" :loading="productLoading" :columns="product" :data="searchProduct" @on-selection-change="getSelectedProduct"></Table>
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
  import vshopList from '@/api/vshoplist'
  import _ from 'lodash'

  export default {
    name: 'home',
    data () {
      return {
        modalDelete: false,
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
            title: 'Suppliers',
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
          },
          {
            title: 'Action',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'text',
                    size: 'large',
                    icon: 'trash-a'
                  },
                  on: {
                    click: () => {
                      this.confirmDelete(params.index)
                    }
                  }
                })
              ])
            }
          }
        ],
        suplayerLoading: true,
        productLoading: true,
        productSearch: '',
        supplyerList: [],
        productList: [],
        selectedData: [],
        selectedSupplyer: '',
        doc_count: 0,
        cacheSupplier: []
      }
    },
    methods:{
      async confirmDelete(index) {
        let self = this
        this.$Modal.confirm({
          title: 'Are you sure want to delete?',
          content: 'Press OK to confirm delete.',
          onOk: async function() {
            self.selectedData.splice(index, 1)
          }
        })
      },
      async getProducts(data){
        this.productLoading = true
        let self = this 
        this.selectedSupplyer = data.key
        // let obj = this.selectedData.filter(function (obj) { return obj.supplyerName === self.selectedSupplyer })
        // if(obj.length<1){
        //   this.selectedData.push({'supplyerName':this.selectedSupplyer,'products':[],'approve':true})
        // }

         let body = {
           "query": {
            "match": {
              "supplier_id": this.selectedSupplyer
            }
          }
        }
        let productList = await service.productList(body, data.doc_count)
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
        // this.selectedSupplyer = data.key
        let obj = this.selectedData.filter(function (obj) { return obj.supplyerName === self.selectedSupplyer })
        if(obj.length<1){
          this.selectedData.push({'supplyerName':this.selectedSupplyer,'products':[],'approve':true})
        }
        this.selectedData.filter(function(el) {
          if(el.supplyerName == self.selectedSupplyer){
            el.products = data.map(a => a._source.sku)
          }
        })
      },
      async submitData(name){
        let self = this
        // let auth_token = this.$cookie.get('auth_token') , {"headers": auth_token}
         this.$refs[name].validate(async (valid) => {
          if (valid) {
            this.$Message.success('Submit')
            if(this.selectedData.length>0){
              let finalData = {
                "virtualShopName":this.formValidate.name,
                "suppliers":this.selectedData
              }
              vshopdata.add(finalData)
              .then(res => {
                self.$Message.success('Saved successfully!')
                self.$router.push({
                  name: 'vshoplist'
                });
              })
              .catch(err => {
                this.$Message.error('Error : ', err)    
              }) 
            }
          } else {
            this.$Message.error('Please fill required fields!')
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
    async mounted() {
      let supplyerList = await service.supplyerList()
      if(supplyerList === 401) {
        this.$router.push({ path: '/login' })
      } else {
        this.supplyerList = supplyerList.data.aggregations.group_by_username.buckets
        if(this.supplyerList.length>0) {
          for(let i = 0; i < this.supplyerList.length; i++) {
            let supplierName = _.find(this.cacheSupplier, this.supplyerList[i].key) 
            if(supplierName == undefined) {
              let supplier = await vshopList.get(this.supplyerList[i].key)
              let c = _.find(supplier.data, 'company')
              let v = _.find(supplier.data, 'virtualShopName')
              if (c != undefined) {
                this.cacheSupplier.push({[this.supplyerList[i].key]: c.company})
                this.supplyerList[i].key = c.company 
              } else if (v != undefined) {
                this.cacheSupplier.push({[this.supplyerList[i].key]: v.virtualShopName})
                this.supplyerList[i].key = v.virtualShopName
              } else {
              }
            } else {
              this.supplyerList[i].key = supplierName.key
            }
          }
          this.suplayerLoading = false
          this.doc_count = this.supplyerList[0].doc_count
        }
      }
    }
  }
</script>
