let frontEndUrl = 'http://vshopdata.'+process.env.domainkey+'/#/login';

module.exports =  {
  default : {
    loginUrl : "https://auth."+process.env.domainkey+"/api/login",
    ldapLoginUrl : "https://auth."+process.env.domainkey+"/api/ldapauth",
    registrationUrl : "https://api."+process.env.domainkey+"/serverapi/register",
    signupUrl: "https://auth."+process.env.domainkey+"/api/setup",
    userDetail: "https://auth."+process.env.domainkey+"/api/userdetails",
    forgotPasswordUrl : "https://auth."+process.env.domainkey+"/api/forgetpassword",
    resetpassword : "https://auth."+process.env.domainkey+"/api/resetpassword",
    feathersServiceBaseUrl : "https://api."+process.env.domainkey+"/pdmnew",    // live api
    // feathersServiceBaseUrl : "http://172.16.230.151:3038",             // local api
    varifyEmailUrl : "https://auth."+process.env.domainkey+"/api/verifyemail",

    
    facebookSuccessCallbackUrl: frontEndUrl,
    googleSuccessCallbackUrl: frontEndUrl,
    twitterSuccessCallbackUrl: frontEndUrl,
    githubSuccessCallbackUrl: frontEndUrl,
    linkedInSuccessCallbackUrl: frontEndUrl,

    flowzDashboardUrl : 'https://dashboard.'+process.env.domainkey,
    flowzBuilderUrl : 'https://webbuilder.'+process.env.domainkey ,
    flowzVmailUrl : 'https://vmail.'+process.env.domainkey ,
    flowzUploaderUrl : 'https://uploader.'+process.env.domainkey ,
    flowzDbetlUrl : 'https://dbetl.'+process.env.domainkey , 
    
    loginWithFacebookUrl : 'https://auth.'+process.env.domainkey+'/auth/facebook',
    loginWithGoogleUrl : 'https://auth.'+process.env.domainkey+'/auth/Gplus',
    loginWithTwitterUrl : 'https://auth.'+process.env.domainkey+'/auth/twitter',
    loginWithGithubUrl : 'https://auth.'+process.env.domainkey+'/auth/github',
    loginWithLinkedInUrl : 'https://auth.'+process.env.domainkey+'/auth/linkedin',
  }
}



