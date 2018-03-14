<style lang="less">
    @import './login.css';
</style>

<template>
    
      <div class="mainBody">
      
      <div v-if="!isSocialLogin" class="loginContainer">
          
         <div class="success">
            <p id="text_mess" v-if="errmsg!=''">{{errmsg}}</p>
         </div>
         <div class="backbox">
            <div class="loginMsg">
               <div class="textcontentSignup">
                  <p class="title">Don't have an account?</p>
                  <p>Sign up to save all your statistics.</p>
                  <button id="switch1">Sign Up</button>
               </div>
            </div>
            <div class="signupMsg visibility">
               <div class="textcontentLogin">
                  <p class="title">Already have an account?</p>
                  <p>Log in to see all your statistics.</p>
                  <button id="switch2">Login</button>
               </div>
            </div>
         </div>
         <form id="form-facebook" name="form-facebook" :action="loginWithFacebookUrl" method="post">
            <input type="hidden" name="success_url" :value="facebookSuccessCallbackUrl">
        </form>
        <form id="form-google" name="form-google" :action = "loginWithGoogleUrl" method="post">
            <input type="hidden" name="success_url" :value="googleSuccessCallbackUrl">
        </form>
        <form id="form-twitter" name="form-twitter" :action ="loginWithTwitterUrl" method="post">
            <input type="hidden" name="success_url" :value="twitterSuccessCallbackUrl">
        </form>
        <form id="form-github" name="form-github" :action ="loginWithGithubUrl" method="post">
            <input type="hidden" name="success_url" :value="githubSuccessCallbackUrl">
        </form>
        <form id="form-linkedIn" name="form-linkedIn" :action ="loginWithLinkedInUrl" method="post">
            <input type="hidden" name="success_url" :value="linkedInSuccessCallbackUrl">
        </form>
         <div class="frontbox">
            <div class="login">
               <h2>{{header}}</h2>
               <form  v-on:submit.prevent="handleLoginSubmit" action="#" method="post">
                  <Tabs class="lconun" type="card" value="1" @on-click="tabsClicked">
                     <TabPane label="Standard" name="1">
                        <div class="lconun">
                           <div class="lrinp">
                              <label>*Email</label>
                              <input type="email" v-model="login.email" class="" placeholder="Email">
                           </div>
                        </div>
                        <div v-if="!showForgotPassword"  class="lconun">
                           <div class="lrinp">
                              <label>*Password</label>
                              <input type="password" class="" v-model="login.password" placeholder="Password">
                           </div>
                        </div>
                     </TabPane>
                     <TabPane label="LDAP" name="2">
                        <div class="lconun">
                           <div class="lrinp">
                              <label>*Email</label>
                              <input type="email" v-model="login.email" class="" placeholder="Email">
                           </div>
                        </div>
                        <div class="lconun">
                           <div class="lrinp">
                              <label>*Password</label>
                              <input type="password" class="" v-model="login.password" placeholder="Password">
                           </div>
                        </div>
                     </TabPane>
                  </Tabs>
                  <div class="lconun">
                     <div class="lrinp">
                        <div class="row">
                           <div class="col-md-6">
                              <el-button type="success" size="small" v-if="!showForgotPassword" class="signupButton"  @click="loginUser()" :loading="saveFileLoadingLogin" >Login</el-button>
                              <el-button type="success" size="small" class="signupButton"  v-if="showForgotPassword" @click="forgotPasswordSendEmail()" :loading="saveFileLoadingLogin" >Submit</el-button>
                           </div>
                           <div class="col-md-6" style="top: 9px;">
                              <a href="javascript:void()" class="lfort" v-if="!showForgotPassword"  v-show="this.selectedTabIndex==1" @click="forgotPassword()">Forgot Password</a>
                              <a href="javascript:void()" class="lfort" v-if="showForgotPassword" v-show="this.selectedTabIndex==1" @click="backtoLogin()">Back to Login</a>
                           </div>
                        </div>
                     </div>
                  </div>
                  <button type="submit" style="display:none"></button>
               </form>
               <div class="social">
                  <span @click="facebookLogin()">
                  <i class="fa fa-facebook-square fa-2x" aria-hidden="true"></i>
                  </span>
                  <span @click="googleLogin()">
                  <i class="fa fa-google-plus-square fa-2x" aria-hidden="true"></i>
                  </span>
                  <span @click="twitterLogin()">
                  <i class="fa fa-twitter-square fa-2x" aria-hidden="true"></i>
                  </span>
                  <span @click="githubLogin()">
                  <i class="fa fa-github-square fa-2x" aria-hidden="true"></i>
                  </span>
                  <span @click="linkdinLogin()">
                  <i class="fa fa-linkedin-square  fa-2x" aria-hidden="true"></i>
                  </span>
               </div>
            </div>
            <div class="signup hide">
               <h2>Sign Up</h2>
               <div class="inputbox">
                  <form  v-on:submit.prevent="signupUser" action="#" method="post">
                     <div class="lrinp">
                        <label>*Name</label>
                        <!--input type="text" v-model="signup.username" placeholder="Enter username (Required)"-->
                     </div>
                     <div class="lrinp">
                        <input style="width:48%;display: inline-block;" type="text" required v-model="signup.fname" placeholder="First Name ">    
                        <input type="text" style="width:50%;display: inline-block;" v-model="signup.lname" placeholder="Last Name ">                                            
                     </div>
                     <div class="lrinp">
                        <label>*Email</label>
                        <input type="email" v-model="signup.email" placeholder="Enter email">
                     </div>
                     <div class="lrinp">
                        <label>*Password</label>
                        <input type="password" v-model="signup.password" placeholder="Enter password">
                     </div>
                     <button type="submit" style="display:none"></button>
                  </form>
               </div>
               <el-button style="margin-bottom:10px" type="success" size="medium" class="signupButton"  @click="signupUser()" :loading="saveFileLoadingLogin" >Sign Up</el-button>
               <!-- <button @click="signup()">SIGN UP</button> -->
            </div>
         </div>
      </div>
      <div v-else class="loginContainer">
          <div class="login2">
            <div class="login2-triangle"></div>
            
            <h2 class="login2-header">Email</h2>

            <div class="login2-container">
                <p><input type="email" placeholder="Email" v-model="varifyEmail"></p>
                <p><Button type="primary" :loading="emailLoading" @click="getTokenFromSocialLogin" long>PROCEED</Button></p>
                </div>
            </div>
      </div>
   </div>  
    
</template>

<script>
import Vue from 'vue';  
import Cookies from 'js-cookie';
import ElementUI from 'element-ui'
import axios from 'axios'
import config from '../config/customConfig'
import 'element-ui/lib/theme-chalk/index.css'
import psl from 'psl';

Vue.use(ElementUI)
var $loginMsg = $('.loginMsg'),
            $login = $('.login'),
            $signupMsg = $('.signupMsg'),
            $signup = $('.signup'),
            $frontbox = $('.frontbox');


//let location = psl.parse(window.location.hostname)
export default {
    data () {
        return {
            varifyEmail : "",
            obId : "",
            isSocialLogin : false,
            form: {
                userName: 'iview_admin',
                password: ''
            },
            rules: {
                userName: [
                    { required: true, message: 'Enter Username', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: 'Enter Password', trigger: 'blur' }
                ]
            },
            errmsg: '',
            header: 'Login',
            email: '',
            password: '',
            username: '',
            signupemail: '',
            signuppassword: '',
            selectedTabIndex: '',
            saveFileLoading: false,
            saveFileLoadingLogin: false,
            showForgotPassword: false,
            emailLoading: false,
            login: {
                email: "",
                password: ""
            },
            signup: {
                fname: "",
                lname:'',
                password: "",
                email: ""
            },
            selectedTabIndex: 1,
            showForgotPassword: false,
            facebookSuccessCallbackUrl : config.default.facebookSuccessCallbackUrl,
            googleSuccessCallbackUrl : config.default.googleSuccessCallbackUrl,
            twitterSuccessCallbackUrl: config.default.twitterSuccessCallbackUrl,
            githubSuccessCallbackUrl: config.default.githubSuccessCallbackUrl,
            linkedInSuccessCallbackUrl: config.default.linkedInSuccessCallbackUrl,
            loginWithFacebookUrl : config.default.loginWithFacebookUrl,
            loginWithGoogleUrl : config.default.loginWithGoogleUrl,
            loginWithTwitterUrl: config.default.loginWithTwitterUrl,
            loginWithGithubUrl: config.default.loginWithGithubUrl,
            loginWithLinkedInUrl: config.default.loginWithLinkedInUrl
        };
    },
    methods: {
        // handleSubmit () {
        //     this.$refs.loginForm.validate((valid) => {
        //         if (valid) {
        //             Cookies.set('user', this.form.userName);
        //             Cookies.set('password', this.form.password);
        //             this.$store.commit('setAvator', 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3448484253,3685836170&fm=27&gp=0.jpg');
        //             if (this.form.userName === 'iview_admin') {
        //                 Cookies.set('access', 0);
        //             } else {
        //                 Cookies.set('access', 1);
        //             }
        //             this.$router.push({
        //                 name: 'Dashboard'
        //             });
        //         }
        //     });
        // }

        async  getTokenFromSocialLogin(){
            let self = this
            let valid = await this.validateEmail(this.varifyEmail); ;
            if(!valid){
                this.$message.warning("Please enter a valid email address")
            }else{
                this.emailLoading = true;
                axios.post(config.default.varifyEmailUrl, {
                    email: this.varifyEmail,
                    id: this.obId
                })
                .then(function(response) {
                    self.emailLoading = false ;
                    self.saveFileLoadingLogin = false;
                    
                    axios({
                        method: 'post',
                        url: config.default.userDetail,
                        headers: {'Authorization': response.data.logintoken}
                    })
                    .then(function(result) {
                        let location = psl.parse(window.location.hostname)
                        location = location.domain === null ? location.input : location.domain
                            Cookies.set('user',  result.data.data.email  , {domain: location});
                            Cookies.set('auth_token', response.data.logintoken , {domain: location});
                    
                        self.$store.commit('setAvator', 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3448484253,3685836170&fm=27&gp=0.jpg');
                        if (self.form.email === 'iview_admin') {
                            Cookies.set('access', 0);
                        } else {
                            Cookies.set('access', 1);
                        }
                        self.$router.push({
                            name: 'Dashboard'
                        });
                    })
                }).catch(function(error){
                    self.emailLoading = false ;
                    if(error.response.status == 409){
                        self.$message.error(error.response.data)
                    }
                })
            }
        },
        forgotPassword(){
            let params = new URLSearchParams(document.location.href);
            let name = params.get("ob_id"); // is the string "Jonathan"
            this.header = 'Forgot Password'
            this.showForgotPassword = true;
        },
        backtoLogin(){
            this.header = 'Login'
            this.showForgotPassword = false;
        },
        facebookLogin() {
            // this.isSocialLogin = true;
             $("#form-facebook").submit() 
        },
        googleLogin() {
            ////this.isSocialLogin = true;
             $("#form-google").submit();
        },
        twitterLogin() {
           // this.isSocialLogin = true;
            $("#form-twitter").submit();
        },
        githubLogin() {
            //this.isSocialLogin = true;
            $("#form-github").submit();
        },
        linkdinLogin() {
           // this.isSocialLogin = true;
            $("#form-linkedIn").submit();
        },
       
        tabsClicked(val) {
            this.login.email = ''
            this.login.password = ''
            this.selectedTabIndex = val;
        },
        handleLoginSubmit: function() {
            if (this.showForgotPassword) {
                this.forgotPasswordSendEmail()
            } else {
                this.loginUser()
            }
        },
        loginUser: async function() {
            let self = this;
            let emailValidator = await this.validateEmail(self.login.email);

            if (self.login.email == "") {
                self.$message.warning("Email field is required");
            } else if (emailValidator == false) {
                self.$message.warning("Email is not valid");
            } else if (self.login.password == "") {
                self.$message.warning("Password field is required");
            } else {
                self.saveFileLoadingLogin = true;
                axios.post(this.selectedTabIndex == 1 ? config.default.loginUrl : config.default.ldapLoginUrl, {
                    email: self.login.email.trim(),
                    password: self.login.password.trim()
                })
                .then(function(response) {
                    self.saveFileLoadingLogin = false;
                    axios({
                        method: 'get',
                        url: config.default.userDetail,
                        headers: {'Authorization': response.data.logintoken}
                    })
                    .then(function(result) {
                        let location = psl.parse(window.location.hostname)
                        location = location.domain === null ? location.input : location.domain
                        Cookies.set('user',  result.data.data.email  , {domain: location});
                        Cookies.set('auth_token', response.data.logintoken , {domain: location});
                    
                        self.$store.commit('setAvator', 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3448484253,3685836170&fm=27&gp=0.jpg');
                        if (self.form.email === 'iview_admin') {
                            Cookies.set('access', 0);
                        } else {
                            Cookies.set('access', 1);
                        }
                        self.$router.push({
                            name: 'Dashboard'
                        });
                    })
                    
                })
                .catch(function(error) {
                    self.saveFileLoadingLogin = false;
                    self.$message.error("email or password is incorrect");
                });
            }
        },
        signupUser:async function(){
            let self = this;
            let emailValidator = await this.validateEmail(self.signup.email);
            if(self.signup.fname == ""){
                self.$message.warning("First name is required");
            }else if(self.signup.lname == ""){
                self.$message.warning("Last name is required");
            }else if(self.signup.email == ""){
               self.$message.warning("Email is required");
            }else if(emailValidator == false){
               self.$message.warning("Email is not valid");
            }else if(self.signup.password == ""){
               self.$message.warning("Password is required");
            }else{
               self.saveFileLoading = true;
               axios.post(config.default.signupUrl, {
                    email: self.signup.email.trim(),
                    password: self.signup.password.trim(),
                    firstname: self.signup.fname.trim(),
                    lastname : self.signup.lname.trim()
                })
                .then(function (response) {
                    if(response.data.code == 200){
                        self.saveFileLoading = false;
                        //alert(response.data.message+", please check your email for password")
                        self.$message({
                            message : response.data.message,
                            type: 'success'
                        });
                        self.signup.email = '';
                        self.signup.password = "";
                        self.signup.fname = "";
                        self.signup.lname = "";

                        $loginMsg.toggleClass("visibility");
                        $frontbox.removeClass("moving");
                        $signupMsg.toggleClass("visibility");
                        $signup.toggleClass('hide');
                        $login.toggleClass('hide');
                    }else{
                        self.saveFileLoading = false;
                        self.$message({
                            message: response.data.error,
                            type: 'warning'
                        });
                    }
                })
                .catch(function (error) {
                    // this.login.password = ''
                    self.saveFileLoading = false;
                    //alert(error);
                    self.$message.error("Something went wrong , Please try again later");
                });
            }
        },
        
        forgotPasswordSendEmail: async function() {
            let self = this;
            let emailValidator = await this.validateEmail(self.login.email);

            if (self.login.email == "") {
                self.$message.warning("Email field is required");
            } else if (emailValidator == false) {
                self.$message.warning("Email is not valid");
            } else {
                self.saveFileLoadingLogin = true;
                axios.post(config.default.forgotPasswordUrl, {
                        email: self.login.email.trim(),
                        url: config.resetPasswordRedirectUrl
                    })
                    .then(function(response) {
                        self.saveFileLoadingLogin = false;
                        if (response.data.code == 200) {
                            self.$message.success(response.data.message);
                            self.login.email = ""
                        }
                    })
                    .catch(function(error) {
                        /* if(error.response.status == 401) {
                            self.$message.error("Email is not registered..!");
                        } else {
                        } */
                        self.$message.error("Email is incorrect");
                        self.saveFileLoadingLogin = false;
                    });
            }
        },
        validateEmail(email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        },
        init (){
            let self = this;
            if(Cookies.get('auth_token')){
                axios({
                            method: 'post',
                            url: config.default.userDetail,
                            headers: {'Authorization': Cookies.get('auth_token')}
                        })
                        .then(function(result) {
                            let location = psl.parse(window.location.hostname)
                            location = location.domain === null ? location.input : location.domain
                             Cookies.set('user',  result.data.data.email  , {domain: location});
                             
                              //Cookies.set('auth_token', result.data.logintoken);
                        
                            //Cookies.set('email', response.data.email);
                            
                            //self.$store.commit('setAvator', 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3448484253,3685836170&fm=27&gp=0.jpg');
                            
                            self.$router.push({
                                name: 'Dashboard'
                            });
                        })

            }

        }

    },
    watch: {
        // // whenever question changes, this function will run
        // isSocialLogin: function (newQuestion) {
        //     console.log("newQuestion ", newQuestion)
        //     if(newQuestion){
                
        //     }
            
        // }
    },
    created(){
        let self = this;
        var configObj = {};
        if(location.search){
        addToModel(location.search.slice(1).split('&'));
        }
        if(location.hash){
        addToModel(location.hash.slice(1).split('&'));
        }
        function addToModel(searchParams){
            
        for(var s in searchParams){
            
        var q = searchParams[s].split('=');
       
        configObj[q[0]] = !!q[1] ? unescape(q[1]) : "";
        }
        }
        if(Object.keys(configObj)[0] == "/login?ob_id")
        {
            let paramsArr = Object.values(configObj);
            
            self.isSocialLogin = true;
            self.obId = paramsArr[0];
        }else if (Object.keys(configObj)[0] == "/login?token")
        {
            let paramsArr = Object.values(configObj);
            let location = psl.parse(window.location.hostname)
            location = location.domain === null ? location.input : location.domain;
            Cookies.set('auth_token', paramsArr[0] , {domain: location})
        }
    },
    mounted() {
    //   if(Cookies.get("auth_token") != undefined){
    //     this.$router.push({
    //                             name: 'Dashboard'
    //                         });
    //   }
        
        this.init();
        var $loginMsg = $('.loginMsg'),
            $login = $('.login'),
            $signupMsg = $('.signupMsg'),
            $signup = $('.signup'),
            $frontbox = $('.frontbox');
        $('#switch1').on('click', function() {
            $loginMsg.toggleClass("visibility");
            $frontbox.addClass("moving");
            $signupMsg.toggleClass("visibility");
            $signup.toggleClass('hide');
            $login.toggleClass('hide');
        })
        $('#switch2').on('click', function() {
            $loginMsg.toggleClass("visibility");
            $frontbox.removeClass("moving");
            $signupMsg.toggleClass("visibility");
            $signup.toggleClass('hide');
            $login.toggleClass('hide');
        })
    }
};
</script>



