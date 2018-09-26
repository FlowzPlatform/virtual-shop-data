<style lang="less">
    @import "./main.less";
</style>
<template>
    <div class="main" :class="{'main-hide-text': shrink}">
        <div class="sidebar-menu-con" :style="{width: shrink?'60px':'200px', overflow: shrink ? 'visible' : 'auto'}">
            <shrinkable-menu
                :shrink="shrink"
                @on-change="handleSubmenuChange"
                :theme="menuTheme"
                :before-push="beforePush"
                :open-names="openedSubmenuArr"
                :menu-list="menuList">
                <div slot="top" class="logo-con">
                    <img v-show="!shrink"  src="../images/logo.svg" key="max-logo" />
                    <img v-show="shrink" src="../images/logo-min.jpg" key="min-logo" />
                </div>
            </shrinkable-menu>
        </div>
        <div class="main-header-con" :style="{paddingLeft: shrink?'60px':'200px'}">
            <div class="main-header">
                <div class="navicon-con">
                    <Button :style="{transform: 'rotateZ(' + (this.shrink ? '-90' : '0') + 'deg)'}" type="text" @click="toggleClick">
                        <Icon type="navicon" size="32"></Icon>
                    </Button>
                </div>
                <div class="header-middle-con">
                    <div class="main-breadcrumb">
                        <breadcrumb-nav :currentPath="currentPath"></breadcrumb-nav>
                    </div>
                     <div style="float:right;margin-top:-26px;">
                        <el-select size="small" style="width: 240px;" @change="getSelectedUserSub()" clearable no-data-text="No user found" v-model="userSubName" placeholder="Select User">
                            <el-option
                            v-for="item in totalUser"
                            :key="item.user"
                            :label="item.user"
                            :value="item.user">
                            </el-option>
                        </el-select>
                         <el-select size="small" style="width: 240px;" @change="saveSelectedSubId()" clearable no-data-text="No Subscription Found" v-model="userSubId" placeholder="Select Subscription">
                            <el-option
                            v-for="item in userSubscription"
                            :key="item.user"
                            :label="item.package.name"
                            :value="item.package.id">
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div class="header-avator-con">
                    <!-- <div class="headerMenu">
                    <Menu mode="horizontal"  active-name="1">
                        <Submenu name="3">
                            <template slot="title">
                                <Icon type="grid" size="large" style="font-size: 23px;padding-top: 21px;"></Icon>
                            </template>
                            <MenuGroup title="Flowz-Products">
                                <MenuItem name="3-1"><span @click="goToFlowzDashboard">Flowz Dashboard</span></MenuItem>
                                <MenuItem name="3-2"><span @click="goToFlowzBuilder">Website Builder</span></MenuItem>
                                <MenuItem name="3-3"><span @click="goToFlowzVmail">Vmail</span></MenuItem>
                                <MenuItem name="3-4"><span @click="goToFlowzUploader">Uploader</span></MenuItem>
                                <MenuItem name="3-5"><span @click="goToFlowzDbetl">DBETL</span></MenuItem>
                            </MenuGroup>
                        </Submenu>
                    </Menu>
                    </div> -->
                    <!-- <Tooltip placement="bottom">
                         <div @click="goToSettings"><Icon type="gear-b" size="large" style="font-size: 23px;
                            padding-top: 5px;
                            cursor: pointer;"></Icon></div>
                         <div slot="content">
                            Settings
                        </div>
                    </Tooltip> -->
                    
                    
                    <full-screen v-model="isFullScreen" @on-change="fullscreenChange"></full-screen>
                    <!--lock-screen></lock-screen-->
                    <!-- <message-tip v-model="mesCount"></message-tip> -->
                    <theme-switch></theme-switch>

                    <div class="user-dropdown-menu-con">
                        <Row type="flex" justify="end" align="middle" class="user-dropdown-innercon">
                            <Dropdown transfer trigger="click" @on-click="handleClickUserDropdown">
                                <Tooltip placement="left">
                                    <a href="javascript:void(0)">
                                        <span class="main-user-name">
                                            {{ userName }}
                                            </span>
                                        <Icon type="arrow-down-b"></Icon>
                                    </a>
                                    <div slot="content">
                                        {{ userName }}
                                    </div>
                                </Tooltip>
                                
                                <DropdownMenu slot="list">
                                    <!-- <DropdownItem name="ownSpace">Personel Center</DropdownItem> -->
                                    <DropdownItem name="loginout" divided>Sign Out</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <!-- <Avatar :src="avatorPath" style="background: #619fe7;margin-left: 10px;"></Avatar> -->
                        </Row>
                    </div>
                </div>
            </div>
            <div class="tags-con">
                <tags-page-opened :pageTagsList="pageTagsList"></tags-page-opened>
            </div>
        </div>
        <div class="single-page-con" :style="{left: shrink?'60px':'200px'}">
            <div class="single-page">
                <keep-alive :include="cachePage">
                    <router-view></router-view>
                </keep-alive>
            </div>
        </div>
    </div>
</template>
<script>
    import shrinkableMenu from './main-components/shrinkable-menu/shrinkable-menu.vue'
import tagsPageOpened from './main-components/tags-page-opened.vue'
import breadcrumbNav from './main-components/breadcrumb-nav.vue'
import fullScreen from './main-components/fullscreen.vue'
/*     import lockScreen from './main-components/lockscreen/lockscreen.vue'; */
import messageTip from './main-components/message-tip.vue'
import themeSwitch from './main-components/theme-switch/theme-switch.vue'
import Cookies from 'js-cookie'
import util from '@/libs/util.js'
import psl from 'psl'
import config from '@/config/customConfig'
    import ElementUI from 'element-ui'
import axios from 'axios'
import _ from 'lodash'
import Vue from 'vue'
Vue.use(ElementUI)

export default {
    
    	components: {
    		shrinkableMenu,
    		tagsPageOpened,
    		breadcrumbNav,
    		fullScreen,
    		/* lockScreen, */
    		messageTip,
    		themeSwitch
    	},
    	data () {
    		return {
    			userSubId: '',
    			userSubName: '',
    			shrink: false,
    			userName: '',
    			subscribedUser: [],
    			userSubscription: [],
    			totalUser: [],
    			isFullScreen: false,
    			openedSubmenuArr: this.$store.state.app.openedSubmenuArr,
    			flowzDashboardUrl: config.default.flowzDashboardUrl,
    			flowzBuilderUrl: config.default.flowzBuilderUrl,
    			flowzVmailUrl: config.default.flowzVmailUrl,
    			flowzUploaderUrl: config.default.flowzUploaderUrl,
    			flowzDbetlUrl: config.default.flowzDbetlUrl
    		}
	},
    	computed: {
    		menuList () {
    			return this.$store.state.app.menuList
    		},
    		pageTagsList () {
    			return this.$store.state.app.pageOpenedList // 打开的页面的页面对象
    		},
    		currentPath () {
    			return this.$store.state.app.currentPath // 当前面包屑数组
    		},
    		avatorPath () {
    			return localStorage.avatorImgPath
    		},
    		cachePage () {
    			return this.$store.state.app.cachePage
    		},
    		lang () {
    			return this.$store.state.app.lang
    		},
    		menuTheme () {
    			return this.$store.state.app.menuTheme
    		},
    		mesCount () {
    			return this.$store.state.app.messageCount
    		}
    	},
    	methods: {
    		async init () {
    			let self = this
    
    			let pathArr = util.setCurrentPath(this, this.$route.name)
    			this.$store.commit('updateMenulist')
    			if (pathArr.length >= 2) {
    				this.$store.commit('addOpenSubmenu', pathArr[1].name)
    			}
    
    			let messageCount = 3
    			this.messageCount = messageCount.toString()
    			this.checkTag(this.$route.name)
    			this.$store.commit('setMessageCount', 3)
    			self.userName = await Cookies.get('user')
    			// setTimeout(function(){ self.userName = Cookies.get('user'); }, 2000);
    		},
    		toggleClick () {
    			this.shrink = !this.shrink
    		},
    		handleClickUserDropdown (name) {
    			if (name === 'ownSpace') {
    				util.openNewPage(this, 'ownspace_index')
    				this.$router.push({
    					name: 'ownspace_index'
    				})
    			} else if (name === 'loginout') {
    				// 退出登录
    				let location = psl.parse(window.location.hostname)
    				location = location.domain === null ? location.input : location.domain
    
    				Cookies.remove('auth_token', {domain: location})
    				Cookies.remove('access', {domain: location})
    				Cookies.remove('user', {domain: location})
    				this.$store.commit('logout', this)
    				this.$store.commit('clearOpenedSubmenu')
    				this.$Message.success('You have successfully logged out..!')
    				this.$router.push({
    					name: 'login'
    				})
    			}
    		},
    		checkTag (name) {
    			let openpageHasTag = this.pageTagsList.some(item => {
    				if (item.name === name) {
    					return true
    				}
    			})
    			if (!openpageHasTag) { //  解决关闭当前标签后再点击回退按钮会退到当前页时没有标签的问题
    				util.openNewPage(this, name, this.$route.params || {}, this.$route.query || {})
    			}
    		},
    		handleSubmenuChange (val) {
    			// console.log(val)
    		},
    		beforePush (name) {
    			// if (name === 'accesstest_index') {
    			//     return false;
    			// } else {
    			//     return true;
    			// }
    			return true
    		},
    		fullscreenChange (isFullScreen) {
    			// console.log(isFullScreen);
    		},
    		goToSettings () {
    			this.$router.push({
    				name: 'settings'
    			})
    		},
    		goToFlowzDashboard () {
    			window.open(this.flowzDashboardUrl, '_blank')
    		},
    		goToFlowzBuilder () {
    			window.open(this.flowzBuilderUrl, '_blank')
    		},
    		goToFlowzVmail () {
    			window.open(this.flowzVmailUrl, '_blank')
    		},
    		goToFlowzUploader () {
    			window.open(this.flowzUploaderUrl, '_blank')
    		},
    		goToFlowzDbetl () {
    			window.open(this.flowzDbetlUrl, '_blank')
    		},
    		getUserDetailsByEmail (email) {
    			return axios({
    				method: 'post',
    				url: config.default.userDetailByMail,
    				data: { 'email': email }
    			}).then(res => {
    				return res.data.data[0].firstname + ' ' + res.data.data[0].lastname
    			}).catch(err => {
    				return err
    			})
    		},
    		getSelectedUserSub () {
    			if (this.userSubName == '') {
    				this.userSubscription = this.subscribedUser
    			} else {
    				this.userSubId = ''
    				this.userSubscription = _.filter(this.subscribedUser, ['user', this.userSubName])
    				this.$store.commit('setUserSubscriptionId', this.userSubId)
    			}
    		},
    		saveSelectedSubId () {
    			this.$store.commit('setUserSubscriptionId', this.userSubId)
    		}
    	},
    	watch: {
    		'$route' (to) {
    			this.$store.commit('setCurrentPageName', to.name)
    			let pathArr = util.setCurrentPath(this, to.name)
    			if (pathArr.length > 2) {
    				this.$store.commit('addOpenSubmenu', pathArr[1].name)
    			}
    			this.checkTag(to.name)
    			localStorage.currentPageName = to.name
    		},
    		lang () {
    			util.setCurrentPath(this, this.$route.name) // 在切换语言时用于刷新面包屑
    		}
    	},
    	mounted () {
    		let self = this
    		this.init()
    		axios({
    			method: 'get',
    			url: config.default.userDetail,
    			headers: {
    				'Authorization': Cookies.get('auth_token')
    			}
    		}).then(async res => {
    			let user = res.data.data.firstname + ' ' + res.data.data.lastname
    			await Object.keys(res.data.data.package).forEach(async function (key) {
    				if (res.data.data.package[key].hasOwnProperty('invitedBy')) {
    					let inviter = await self.getUserDetailsByEmail(res.data.data.package[key].invitedBy)
    					if (inviter == 'undefined undefined') {
    						user = res.data.data.package[key].invitedBy
    					} else {
    						user = inviter
    					}
    				}
    				if (user == 'undefined undefined') {
    					user = res.data.data.email
    				}
    				self.totalUser.push({'user': user})
    				self.subscribedUser.push({'user': user, 'package': { 'name': res.data.data.package[key].name, 'id': key }})
    			})
    			self.userSubscription = self.subscribedUser
    			self.totalUser = _.uniqBy(self.totalUser, 'user')
    		}).catch(err => {
    			if (err.response.status == '401') {
    				self.$Message.error({
    					content: 'Your session has been expired please login again.',
    					duration: 10,
    					closable: true
    				})
    				let location = psl.parse(window.location.hostname)
    				location = location.domain === null ? location.input : location.domain
    				Cookies.remove('auth_token', {domain: location})
    				Cookies.remove('access', {domain: location})
    				Cookies.remove('user', {domain: location})
    				self.$router.push({ name: 'login' })
    			} else if (err.message == 'Network Error') {
    				self.$Notice.error({
    					title: 'Getting subscription details.',
    					desc: 'API service unavailable.',
    					duration: 10,
    					closable: true
    				})
    			}
    		})
    	},
    	created () {
    		this.$store.commit('setOpenedList')
    	}
    }
</script>
