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
          <Table height="500" border ref="selection" :loading="productLoading" :columns="product" :data="searchProduct" @on-select="getSelectedProduct" @on-select-all="getSelectedProduct" @on-select-cancel="deselectRow" @on-selection-change="deselectRow"></Table>
          <div style="margin: 10px;overflow: hidden">
            <div style="float: right;">
              <Page :total="productList.length" :current="1" @on-change="changePage" :page-size="200" size="small" show-elevator></Page>
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
        selectedSupplyerId: '',
        selectedSupplyerName: '',
        doc_count: 0,
        cacheSupplier: [],
        tempData: [],
        maintainState: {}
      }
    },
    methods:{
      async changePage (pageNo) {
      this.searchProduct = await this.makeChunk(pageNo, 200)
      //   this.productLoading = true
      //   let oldRecord = _.union(...(_.chain(this.selectedData).map(m => {
      //     return m.products
      //   }).value()))
      //   this.searchProduct = await this.mockTableData1(p, 200).then(response => {
      //     return _.chain(response).map(m => {
      //       m._checked = _.find(oldRecord, (f, key) => {
      //         return f[m._id]
      //       }) !== undefined ? true : false
      //       return m
      //     }).value()
      //     this.productLoading = false
      //   })
      },
      async makeChunk (pageNo, size) {
        let chunk = []
        for (let i=(pageNo - 1) * size; i < size + (pageNo - 1) * size; i++) {
          if(this.productList[i] != undefined) {
            await chunk.push(this.productList[i])
          }
        }
        return chunk.slice()
      },
      // async mockTableData1 (p,size) {
      //   let productList = await service.productList(this.selectedSupplyerId, 200, (p - 1) * size)
      //   if(productList === 401){
      //     this.$router.push({ path: '/login' })
      //   } else {
      //     this.productList = productList.data.hits.hits
      //     if(this.productList.length > 0){
      //       this.productLoading = false
      //     }
      //   }
      //   return this.productList.slice()
      //   // return data1.slice((p - 1) * size, p * size);
      // },
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
      async deselectRow(selection,row) {
        let self = this
        if(selection != undefined && row != undefined) {
          this.selectedData.filter(function(el) {
            if(el.supplyerName == self.selectedSupplyerId) {
              el.products.splice(_.findIndex(el.products, row._id), 1)
            }
          })
          this.searchProduct.filter(function(el) {
            if (el._id == row._id) {
              el._checked = false
            }
          })
          this.tempData.filter(function(el) {
            if (el._id == row._id) {
              _.remove(self.tempData, ['_id', row._id])
            }
          })
        } else if (selection.length == 0 && row == undefined) {
          this.searchProduct.filter(async function(el) {
              self.selectedData.filter(function(ml) {
                if(ml.supplyerName == self.selectedSupplyerId) {
                  ml.products.splice(_.findIndex(ml.products, el._id), 1)
                }
              })
            await _.remove(self.tempData, ['_id', el._id])
            el._checked = false
          })
        }
      },
      async getProducts(data) {
        this.maintainState[data.id] !== undefined ? this.productList = this.maintainState[data.id] : this.productList = []
        if(this.selectedSupplyerId != data.id && this.maintainState[data.id] == undefined ) {
          this.selectedSupplyerId = data.id
          this.selectedSupplyerName = data.key1
          this.productLoading = true
          let productList = await service.productList(this.selectedSupplyerId, data.doc_count)
          if(productList === 401) {
            this.$router.push({ path: '/login' })
          } else {
            this.productList = productList.data.hits.hits
            this.productLoading = false
          }
          this.searchProduct = await this.makeChunk(1, 200)
        } else {
          this.selectedSupplyerId = data.id
          this.selectedSupplyerName = data.key1
          this.searchProduct = await this.makeChunk(1, 200)
        }
        if(this.maintainState[data.id] == undefined && this.productList.length > 0) {
          this.maintainState[this.selectedSupplyerId] = this.productList
        }
        // this.selectedData = []
        this.tempData = []
      },
      async getSelectedProduct(data, row) {
        let self = this
        for(var i = 0; i < data.length; i++) {
          await self.tempData.push(data[i])
        }
        self.tempData = _.uniqBy(self.tempData, '_id')
        let obj = this.selectedData.filter(function (obj) { return obj.supplyerName === self.selectedSupplyerId })
        if(obj.length<1){
          this.selectedData.push({'supplyerName':this.selectedSupplyerId,'products':[],'approve':true,'name':self.selectedSupplyerName})
        }  
        this.selectedData.filter(function(el) {
          if(el.supplyerName == self.selectedSupplyerId) {
            el.products = self.tempData.map(function(ml) {
              let a = ml._id  
              return { [a]: ml._source.sku }
            })
          }
        })
        this.searchProduct.filter(async function(el) {
          el._checked = _.find(data, (ml) => {
            return el._id == ml._id
          }) !== undefined ? true : false
        })
      },
      submitData(name){
        let self = this
         this.$refs[name].validate(valid => {
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
