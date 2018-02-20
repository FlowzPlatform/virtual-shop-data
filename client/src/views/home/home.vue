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
          <div style="margin: 10px;overflow: hidden">
            <div style="float: right;">
              <Page :total="len" :current="1" @on-change="changePage"></Page>
            </div>
          </div>
        </Col>
        <Col :xs="{ span: 24 }" :md="{ span: 8 }">
          <Table border :columns="selectedProducts" :data="selectedData"></Table>
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
        searchProduct: [],
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
                h('strong', ' ' + params.row.key1)
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
                h('strong', ' '+params.row.name)
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
        productLoading: false,
        productSearch: '',
        supplyerList: [],
        productList: [],
        selectedData: [],
        selectedSupplyer: '',
        selectedSupplyerName: '',
        doc_count: 0,
        cacheSupplier: [],
        len: 0
      }
    },
    methods:{
      async changePage (p) {
        this.searchProduct = await this.mockTableData1(p, 200)
      },
      async mockTableData1 (p,size) {
        let productList = await service.productList(this.selectedSupplyer, p * size, (p - 1) * size)
        if(productList === 401){
          this.$router.push({ path: '/login' })
        } else {
          this.productList = productList.data.hits.hits
          if(this.productList.length > 0){
            this.productLoading = false
          }
        }
        return this.productList.slice()
        // return data1.slice((p - 1) * size, p * size);
      },
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
        this.selectedSupplyer = data.id
        this.selectedSupplyerName = data.key1
        this.productLoading = true
        this.len = data.doc_count
        this.searchProduct = await this.mockTableData1(1, 200)
      },
      getSelectedProduct(data){
        let self = this
        let obj = this.selectedData.filter(function (obj) { return obj.supplyerName === self.selectedSupplyer })
        if(obj.length<1){
          this.selectedData.push({'supplyerName':this.selectedSupplyer,'products':[],'approve':true,'name':self.selectedSupplyerName})
        }
        this.selectedData.filter(function(el) {
          if(el.supplyerName == self.selectedSupplyer){
            el.products = data.map(function(a) {
              return {'sku': a._source.sku, 'id':a._id}
            })
          }
        })
      },
      async submitData(name){
        let self = this
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
      // searchProduct(){
      //   let self = this
      //   let data1 = this.productList.slice()
        // return data1.filter(function(el) {
        //   if( el._source.product_name.toLowerCase().includes(self.productSearch.toLowerCase())){
        //     return el
        //   }
        // })
      // }
    },
    async mounted() {
      let supplier = await vshopdata.getAllSupplier()
      if(supplier === 401) {
        this.$router.push({ path: '/login' })
      } else {
        if(supplier.data.data.length > 0) {
          for(let i = 0; i < supplier.data.data.length; i++) {
            let count = await service.countProduct(supplier.data.data[i].id, 1)
            supplier.data.data[i].doc_count = count.data.hits.total
            // supplier.data.data[i].key = supplier.data.data[i].esUser
            if (supplier.data.data[i].company != undefined && supplier.data.data[i].company != '') {
              supplier.data.data[i].key1 = supplier.data.data[i].company
            } else if (supplier.data.data[i].virtualShopName != undefined && supplier.data.data[i].virtualShopName != '') {
              supplier.data.data[i].key1 = supplier.data.data[i].virtualShopName 
            } else {
              supplier.data.data[i].key1 = supplier.data.data[i].id 
            }
          }
        }
        this.supplyerList = supplier.data.data
        this.suplayerLoading = false
      }
    }
  }
</script>
