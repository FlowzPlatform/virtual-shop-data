<style lang="less">
  @import "./home.less";
  @import "../../styles/common.less";
</style>
<template>
  <div>
    <Card style="min-height:650px">
      <Row slot="title" :gutter="16">
        <Col :md="{ span: 10 }">
          <p>Virtual Shop List</p>    
        </Col>
      </Row>
      <Row type="flex" justify="center">
        <Col :xs="{ span: 24 }" :md="{ span: 16 }">
          <Table :loading="suplayerLoading" :columns="supplyer" :data="supplyerList" :highlight-row="true"></Table>
          <Page :current="currentPage" @on-change="changePage" :total="supplyerListData.length" :page-size="pageSize" class="pull-right" style="margin-top:10px;"></Page>
        </Col>
      </Row>
    </Card>
  </div>
</template>
<script>
  import service from '@/api/service'
  import vshopData from '@/api/vshopdata'
  import vshopList from '@/api/vshoplist'
  import Cookie from 'js-cookie'
  import _ from 'lodash'
  import config from '@/config/customConfig'

  import io from 'socket.io-client';
  
  var socket = io.connect(config.default.socketURI);

  export default {
    name: 'vshoplist',
    data () {
      return {
        supplyer: [
            {
                title: 'Virtual Shop id',
                key: 'id'
            },
            {
                title: 'Virtual Shop Name',
                key: 'virtualShopName'
            },
            {
                title: 'Status',
                key: 'status',
                render: (h, params) => {
                  return  h('strong', _.capitalize(params.row.status))
                }
            },
            {
              title: 'Action',
              width: 150,
              render: (h, params) => {
                return h('Tooltip', {
                  props: {
                    content: 'Delete',
                    placement: 'right'
                  }
                }, [
                  h('Button', {
                    props: {
                      type: 'text',
                      size: 'large',
                      shape: 'circle',
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
        supplyerListData: [],
        supplyerList: [],
        pageSize: 10,
        currentPage: 1
      }
    },
    methods:{
      async changePage (pageNo) {
        this.supplyerList = await this.makeChunk(pageNo, this.pageSize)
      },
      async makeChunk (pageNo, size) {
        let chunk = []
        for (let i=(pageNo - 1) * size; i < size + (pageNo - 1) * size; i++) {
          if(this.supplyerListData[i] != undefined) {
            await chunk.push(this.supplyerListData[i])
          }
        }
        return chunk.slice()
      },
      confirmDelete(index) {
        let self = this
        this.$Modal.confirm({
          title: 'Are you sure want to delete?',
          content: 'Press OK to confirm delete.',
          onOk: async function() {
            vshopData.delete(self.supplyerListData[index].id)
            let data = await vshopList.getAll()
            if(data === 401) {
              self.$router.push({ name: 'login' })
            } else {
              self.supplyerListData =  _.sortBy(data.data, [function(o) { return o.virtualShopName.toLowerCase() }])
              self.supplyerList = await self.makeChunk(self.currentPage, self.pageSize)
            }
          }
        })
      }
    },
    computed:{

    },
    async mounted() {
      let self = this
        let data = await vshopList.getAll()
        if(data === 401) {
          Cookie.remove('auth_token', {domain: location})
          Cookie.remove('access', {domain: location})
          Cookie.remove('user', {domain: location})
          // document.location = '/'
          this.$router.push({ name: 'login' })
        } else {
            this.supplyerListData = _.sortBy(data.data, [function(o) { return o.virtualShopName.toLowerCase() }])
            this.supplyerList = await this.makeChunk(this.currentPage, this.pageSize)
            this.suplayerLoading = false
        }
        socket.on("update", async function(data) {
        if (data.new_val && data.new_val !== 'null' && data.new_val !== 'undefined') {
          let index = await _.findIndex(self.supplyerListData , ['id', data.new_val.id])
          if (self.supplyerListData[index] !== 'undefined' && self.supplyerListData[index] !== 'null' && self.supplyerListData[index] !== 'undefined') {
            self.supplyerListData[index].status = data.new_val.status
            }
          }
        });
    }
  }
</script>
