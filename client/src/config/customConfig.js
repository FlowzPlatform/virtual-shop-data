let frontEndUrl = 'http://crm.'+process.env.domainkey+'/#/login';

module.exports =  {
  default : {
    loginUrl : "http://auth."+process.env.domainkey+"/api/login",
    ldapLoginUrl : "http://auth."+process.env.domainkey+"/api/ldapauth",
    registrationUrl : "http://api."+process.env.domainkey+"/serverapi/register",
    signupUrl: "http://auth."+process.env.domainkey+"/api/setup",
    userDetail: "http://auth."+process.env.domainkey+"/api/userdetails",
    forgotPasswordUrl : "http://auth."+process.env.domainkey+"/api/forgetpassword",
    resetpassword : "http://auth."+process.env.domainkey+"/api/resetpassword",
    feathersServiceBaseUrl : "http://api."+process.env.domainkey+"/pdmnew",
    varifyEmailUrl : "http://auth."+process.env.domainkey+"/api/verifyemail",

    
    facebookSuccessCallbackUrl: frontEndUrl,
    googleSuccessCallbackUrl: frontEndUrl,
    twitterSuccessCallbackUrl: frontEndUrl,
    githubSuccessCallbackUrl: frontEndUrl,
    linkedInSuccessCallbackUrl: frontEndUrl,

    flowzDashboardUrl : 'http://dashboard.'+process.env.domainkey,
    flowzBuilderUrl : 'http://webbuilder.'+process.env.domainkey ,
    flowzVmailUrl : 'http://vmail.'+process.env.domainkey ,
    flowzUploaderUrl : 'http://uploader.'+process.env.domainkey ,
    flowzDbetlUrl : 'http://dbetl.'+process.env.domainkey , 
    
    loginWithFacebookUrl : 'http://auth.'+process.env.domainkey+'/auth/facebook',
    loginWithGoogleUrl : 'http://auth.'+process.env.domainkey+'/auth/Gplus',
    loginWithTwitterUrl : 'http://auth.'+process.env.domainkey+'/auth/twitter',
    loginWithGithubUrl : 'http://auth.'+process.env.domainkey+'/auth/github',
    loginWithLinkedInUrl : 'http://auth.'+process.env.domainkey+'/auth/linkedin',
  }
}



