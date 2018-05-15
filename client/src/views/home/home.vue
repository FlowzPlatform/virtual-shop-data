<style lang="less">
  @import "./home.less";
  @import "../../styles/common.less";
  .supp-data  .ivu-table-body {height: 92% !important;}
  .demo-spin-icon-load{
      animation: ani-demo-spin 1s linear infinite;
  }
</style>
<template>
  <div>
    <Card style="min-height:650px">
      <Row slot="title" :gutter="12" style="max-height:40px">
        <Col :md="{ span: 10 }">
          <p>Suppliers and Products</p>    
        </Col>
        <Col :md="{ span: 12 }">
          <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" label-position="right" :label-width="140">
            <FormItem label="Virtual Shop Name" prop="name">
              <Input v-model.trim="formValidate.name" placeholder="Enter Virtual Shop Name" v-on:keyup.enter="submitData('formValidate')"></Input>
            </FormItem>
          </Form>
        </Col>
        <Col :md="{ span: 2 }">
          <Button :loading="sbmtLoading" type="primary" long @click="submitData('formValidate')">Submit</Button>
        </Col>
      </Row>
      
      <Row :gutter="16">
        <Col :xs="{ span: 24 }" :md="{ span: 8 }">
          <Table height="530" class="supp-data" :loading="suplayerLoading" :columns="supplyer" :data="supplyerList" :highlight-row="true" @on-row-click="getProducts"></Table>
          <Row type="flex" align="middle">
            <Col span="2" v-if="splyrLdng"><Spin v-if="splyrLdng">
                <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
            </Spin></Col>
            <Col span="8">
              <p>Showing <b>{{supplyerList.length}}</b> Suppliers</p>
            </Col>
          </Row>
        </Col>
        <Col :xs="{ span: 24 }" :md="{ span: 8 }">
          <Row align="top" style="margin-bottom:5px">
            <Col span="6">
              <Checkbox type="text" v-model="selectAll" size="small" @on-change="selectedAll" :disabled="checkIt">
                <span v-if="!selectAll">Select All</span>
                <span v-else>Deselect All</span>
              </Checkbox>
            </Col>
            <Col span="18" style="float: right;">
              <Input size="small" v-model="searchChar" @on-change="searchData(null)" placeholder="Search product on this page..." icon="ios-search" :disabled="checkIt">
                <Tooltip content="Reset" slot="append" placement="top">
                  <i-button size="small" icon="ios-close-outline" @click="searchData(true)"></i-button>
                </Tooltip>
              </Input>
            </Col>
          </Row>
          <Table height="500" border ref="selection" :loading="productLoading" :columns="product" :data="searchProduct" @on-select="getSelectedProduct" @on-select-all="getSelectedProduct" @on-select-cancel="deselectRow" @on-selection-change="deselectRow"></Table>
          <div style="margin: 10px;overflow: hidden">
              <center><p v-if="!checkIt&&searchChar.length <= 0">Showing <b>{{searchProduct.length}}</b> out of <b>{{productList.length}}</b> products</p>
              <Page v-if="searchChar.length <= 0" :total="productList.length" :current="currentPage" @on-change="changePage" :page-size="pageSize" size="small" show-elevator></Page></center>
          </div>          
        </Col>
        <Col :xs="{ span: 24 }" :md="{ span: 8 }">
          <Table border :columns="selectedProducts" :data="selectedData"></Table>
          <p v-if="selectedData.length > 0" style="width:50%;display: inline-block;">Total Selected Suppliers : {{ selectedData.length }}</p><p v-if="totalProducts > 0" class="pull-right">Total Selected Products : {{ totalProducts }}</p>
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
  import psl from 'psl'
  import config from '@/config/customConfig'
  import io from 'socket.io-client';
  import Vue from 'vue';
  import ElementUI from 'element-ui'
import loginVue from '../login.vue';
  Vue.use(ElementUI)
  
  var socket = io.connect(config.default.socketURI);

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
            { required: true, message: 'Please Enter Virtual Shop Name.', trigger: 'blur' }
          ]
        },
        supplyer: [
          {
            title: 'Suppliers',
            key: 'key1',
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
        splyrLdng: false,
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
      async searchData(reset) {
        let self = this
        if(reset)
          self.searchChar = ''
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
        this.pageNo = pageNo
        this.searchChar = ''
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
            delete self.maintainState[self.selectedData[index].supplyerName]
            delete self.maintainState[self.selectedData[index].supplyerName + 'temp']
            self.selectAllState[self.selectedData[index].supplyerName] = false
            if (self.selectedSupplyerId == self.selectedData[index].supplyerName) {
              self.selectedSupplyerId = ''
              let data = await _.find(self.supplyerList, ['id', self.selectedData[index].supplyerName])
              await self.getProducts(data)
            }
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
        /* if (this.formValidate.name == "") {
            self.$message.error("Please Enter Virtual Shop Name..!");
        } else { */
          if (valid) {
            self.sbmtLoading = true
            if(this.selectedData.length>0){
              let finalData = {
                "virtualShopName":this.formValidate.name,
                "suppliers":this.selectedData
              }
              vshopdata.add(finalData)
              .then(res => {
                self.$Message.success({
                  content:'Saved successfully..!'
                })
                self.$router.push({
                  name: 'Virtual Shop List'
                });
              })
              .catch(err => {
                this.$Message.error({
                  content: 'Error : ', err,
                  duration: 5  
                })    
              }) 
            } else {
              self.$message.error('Please Select At Least One Product Of Any Supplier..!')
              self.sbmtLoading = false
            }
          /* } else {
            this.$Message.error({
              content:'Please fill required fields..!',
              duration: 5
            })
          } */
        }
        })
      }
    },
    async mounted() {
      let self = this
      let supplier = await vshopdata.getAllSupplier()
      if(supplier === 401) {
        this.$Message.error({
          content: 'Please login again.',
          duration: 20,
          closable: true
        })
        let location = psl.parse(window.location.hostname)
        location = location.domain === null ? location.input : location.domain
        Cookie.remove('auth_token', {domain: location})
        Cookie.remove('access', {domain: location})
        Cookie.remove('user', {domain: location})
        // document.location = '/'
        self.$router.push({ name: 'login' })
      } else {
        if(supplier.data.length > 0) {
          self.splyrLdng = true
          supplier.data = await _.sortBy(supplier.data, [function(o) { return o.virtualShopName.toLowerCase() }])
          for(let i = 0; i < supplier.data.length; i++) {
            let count = await service.countProduct(supplier.data[i].id, 1)
            supplier.data[i].doc_count = count.data.hits.total
            supplier.data[i].key1 = supplier.data[i].company || supplier.data[i].virtualShopName || supplier.data[i].id 
            self.supplyerList.push(supplier.data[i])
            this.suplayerLoading = false
          }
        }
        self.splyrLdng = false
      }
      socket.on("update", async function(data) {
        if (data.new_val && data.new_val !== 'null' && data.new_val !== 'undefined') {
          let count = await service.countProduct(data.new_val.id, 1)
          if (count.data.hits.total !== 'undefined') {
            data.new_val.doc_count = count.data.hits.total
          }
          data.new_val.key1 = data.new_val.company || data.new_val.virtualShopName || data.new_val.id
          let check = await _.find(self.supplyerList, ['id', data.new_val.id])
          if(check == undefined) {
            self.supplyerList.push(data.new_val)
          } else {
            self.supplyerList.filter(function (o) {
              if(o.id == data.new_val.id) {
                self.supplyerList.push(data.new_val)
                self.supplyerList = _.sortBy(self.supplyerList, [function(o) { return o.virtualShopName.toLowerCase() }])
              }
            })
          }
        }
      });
    },
    computed: {
      checkIt: function () {
        return this.productList.length > 0 ? false : true
      },
      totalProducts: function () {
        let total = 0
        _.filter(this.selectedData, function(count) {
          total += parseInt(count.products.length)
        })
        return total
      }
    }
  }
</script>
