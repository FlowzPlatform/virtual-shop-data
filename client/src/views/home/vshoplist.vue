<style lang="less">
  @import "./home.less";
  @import "../../styles/common.less";
</style>
<template>
  <div>
    <Card>
      <Row slot="title" :gutter="16">
        <Col :md="{ span: 10 }">
          <p>Virtual Shop List</p>    
        </Col>
      </Row>
      
      <Row :gutter="16">
        <Col :xs="{ span: 24 }" :md="{ span: 16 }">
          <Table :loading="suplayerLoading" :columns="supplyer" :data="supplyerList" :highlight-row="true"></Table>
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
    name: 'vshoplist',
    data () {
      return {
        supplyer: [
            {
                title: 'Id',
                key: 'id'
            },
            {
                title: 'Virtual Shop Name',
                key: 'virtualShopName'
            },
            {
                title: 'Status',
                key: 'status'
            }
        ],
        suplayerLoading: true,

        supplyerList: [],
      }
    },
    methods:{
      
    },
    computed:{

    },
    async mounted() {

        let data = await vshopList.getAll()
        if(data === 401) {
            this.$router.push({ path: '/login' })
        } else {
            this.supplyerList = data.data
            this.suplayerLoading = false
        }
    }
  }
</script>
