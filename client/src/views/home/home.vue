<style lang="less">
  @import "./home.less";
  @import "../../styles/common.less";
</style>
<template>
  <div>
    <Card style="min-height:750px">
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
          <Button :loading="sbmtLoading" type="primary" long @click="submitData('formValidate')">Submit</Button>
        </Col>
      </Row>
      
      <Row :gutter="16">
        <Col :xs="{ span: 24 }" :md="{ span: 8 }">
          <Table :loading="suplayerLoading" :columns="supplyer" :data="supplyerList" :highlight-row="true" @on-row-click="getProducts"></Table>
        </Col>
        <Col :xs="{ span: 24 }" :md="{ span: 8 }">
          <Row align="top">
            <Col span="5">
              <Checkbox type="text" v-model="selectAll" size="small" @on-change="selectedAll" :disabled="checkIt">
                <span v-if="!selectAll">Select All</span>
                <span v-else>Deselect All</span>
              </Checkbox>
            </Col>
            <Col span="19">
              <Input v-model="searchChar" @on-change="searchData" placeholder="Search product..." icon="ios-search"></Input>
            </Col>
          </Row>
          <Table height="500" border ref="selection" :loading="productLoading" :columns="product" :data="searchProduct" @on-select="getSelectedProduct" @on-select-all="getSelectedProduct" @on-select-cancel="deselectRow" @on-selection-change="deselectRow"></Table>
          <div style="margin: 10px;overflow: hidden">
            <div style="float: right;">
              <Page :total="productList.length" :current="currentPage" @on-change="changePage" :page-size="pageSize" size="small" show-elevator></Page>
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
  import Cookie from 'js-cookie'
  import _ from 'lodash'

  export default {
    name: 'home',
    data () {
      return {
        sbmtLoading: false,
        searchProduct: [],
        selectAll: false,
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
              return h('Tooltip',{  props: {
                content: 'Delete',
                placement: 'right'
              }}, [
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
        supplyerList: [],
        productList: [],
        selectedData: [],
        selectedSupplyerId: '',
        selectedSupplyerName: '',
        searchChar: '',
        doc_count: 0,
        cacheSupplier: [],
        tempData: [],
        maintainState: {},
        selectAllState: {},
        pageNo: 1,
        currentPage: 1,
        pageSize: 200
      }
    },
    methods:{
      async searchData() {
        let self = this
        if (self.searchChar != '') {
          self.searchProduct = await self.searchProduct.filter(function(el) {
            if (el._source.product_name.toLowerCase().includes(self.searchChar.toLowerCase())) {
              return el
            }
          })
        } else {
          this.searchProduct = await this.makeChunk(self.pageNo, self.pageSize)
        }
      },
      async selectedAll() {
        let self = this
        if(this.selectAll) {
          for(var i = 0; i < this.productList.length; i++) {
            await self.tempData.push(this.productList[i])
          }
          this.maintainState[self.selectedSupplyerId + 'temp'] = _.uniqBy(self.tempData, '_id')
          let obj = this.selectedData.filter(function (obj) { return obj.supplyerName === self.selectedSupplyerId })
          if(obj.length<1){
            this.selectedData.push({'supplyerName':this.selectedSupplyerId,'products':[],'approve':true,'name':self.selectedSupplyerName})
          }
          this.selectedData.filter(function(el) {
            if (el.supplyerName == self.selectedSupplyerId) {
              el.products = self.productList.map(function(ml) {
                let a = ml._id  
                return { [a]: ml._source.sku }
              })
              if (el.products.length == self.productList.length) {
                self.selectAll = true
                self.selectAllState[self.selectedSupplyerId] = true
              } else {
                self.selectAll = false
                self.selectAllState[self.selectedSupplyerId] = false
              }
            }
          })
          await _.find(self.productList, (ml) => {
            ml._checked = true
          })
          self.searchProduct = await self.makeChunk(self.currentPage, self.pageSize)
        } else {
          this.selectAll = false
          this.selectAllState[this.selectedSupplyerId] = false
          this.productList.filter(async function(el) {
            self.selectedData.filter(function(ml) {
              if(ml.supplyerName == self.selectedSupplyerId) {
                ml.products.splice(_.findIndex(ml.products, el._id), 1)
              }
            })
            await _.remove(self.tempData, ['_id', el._id])
            el._checked = false
          })
          self.maintainState[this.selectedSupplyerId + 'temp'] = self.tempData
          self.searchProduct = await self.makeChunk(self.currentPage, self.pageSize)
        }
      },
      async changePage (pageNo) {
        self.pageNo = pageNo
        this.searchProduct = await this.makeChunk(pageNo, this.pageSize)
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
              if(el.products.length == self.productList.length){
                self.selectAll = true
                self.selectAllState[self.selectedSupplyerId] = true
              } else {
                self.selectAll = false
                self.selectAllState[self.selectedSupplyerId] = false
              }
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
          this.maintainState[this.selectedSupplyerId + 'temp'] = this.tempData
        } else if (selection.length == 0 && row == undefined) {
          this.selectAll = false
          this.selectAllState[this.selectedSupplyerId] = false
          this.searchProduct.filter(async function(el) {
            self.selectedData.filter(async function(ml) {
              if(ml.supplyerName == self.selectedSupplyerId) {
                if( _.findIndex(ml.products, el._id) != -1) {
                  ml.products.splice(_.findIndex(ml.products, el._id), 1)
                  await _.remove(self.tempData, ['_id', el._id])
                  el._checked = false
                }
              }
            })
          })
          self.maintainState[this.selectedSupplyerId + 'temp'] = self.tempData
        }
      },
      async getProducts(data) {
        this.selectAll = this.selectAllState[data.id]
        this.maintainState[data.id] !== undefined ? this.productList = this.maintainState[data.id] : this.productList = []
        this.tempData = this.maintainState[data.id + 'temp'] !== undefined ? await _.uniqBy(this.maintainState[data.id + 'temp'], '_id') : []
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
          this.searchProduct = await this.makeChunk(this.currentPage, this.pageSize)
        } else {
          this.selectedSupplyerId = data.id
          this.selectedSupplyerName = data.key1
          this.searchProduct = await this.makeChunk(this.currentPage, this.pageSize)
        }
        if(this.maintainState[data.id] == undefined && this.productList.length > 0) {
          this.maintainState[this.selectedSupplyerId] = this.productList
        }
        if(this.maintainState[data.id + 'temp'] == undefined) {
          this.maintainState[this.selectedSupplyerId + 'temp'] = []
        }
      },
      async getSelectedProduct(data, row) {
        let self = this
        for(var i = 0; i < data.length; i++) {
          await self.tempData.push(data[i])
          if(self.maintainState[this.selectedSupplyerId + 'temp'] != undefined) {
            await self.maintainState[this.selectedSupplyerId + 'temp'].push(data[i])
          }
        }
        self.maintainState[this.selectedSupplyerId + 'temp'] = _.uniqBy(self.maintainState[this.selectedSupplyerId + 'temp'], '_id')
        self.tempData = await _.uniqBy(self.tempData, '_id')
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
            if(el.products.length == self.productList.length){
              self.selectAll = true
              self.selectAllState[self.selectedSupplyerId] = true
            } else {
              self.selectAll = false
              self.selectAllState[self.selectedSupplyerId] = false
            }
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
            self.sbmtLoading = true
            if(this.selectedData.length>0){
              let finalData = {
                "virtualShopName":this.formValidate.name,
                "suppliers":this.selectedData
              }
              vshopdata.add(finalData)
              .then(res => {
                self.$Message.success('Saved successfully!')
                self.$router.push({
                  name: 'Vshoplist'
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
    async mounted() {
      let self = this
      let supplier = await vshopdata.getAllSupplier()
      if(supplier === 401) {
        this.$Message.error({
          content: 'Can not load data...! Please login again.',
          duration: 20,
          closable: true
        })
        Cookie.remove('auth_token')
        Cookie.remove('access')
        Cookie.remove('user')
        // document.location = '/'
        self.$router.push({ name: 'login' })
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
    },
    computed: {
      checkIt: function () {
        return this.productList.length > 0 ? false : true
      }
    }
  }
</script>
