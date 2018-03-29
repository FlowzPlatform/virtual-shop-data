let frontEndUrl = 'https://vshopdata.' + process.env.domainkey + '/#/login';

module.exports =  {
  default : {
    loginUrl : "https://api."+process.env.domainkey+"/auth/api/login",
    ldapLoginUrl : "https://api." + process.env.domainkey + "/auth/api/ldapauth",
    registrationUrl : "https://api." + process.env.domainkey + "/auth/serverapi/register",
    signupUrl: "https://api." + process.env.domainkey + "/auth/api/setup",
    userDetail: "https://api." + process.env.domainkey + "/auth/api/userdetails",
    forgotPasswordUrl : "https://api." + process.env.domainkey + "/auth/api/forgetpassword",
    resetPasswordUrl : "https://api." + process.env.domainkey + "/auth/api/resetpassword",
    resetPasswordRedirectUrl: "https://vshopdata." + process.env.domainkey + "/#/reset-password",
    changepassword: "https://api." + process.env.domainkey + "/auth/api/changepassword",
    feathersServiceBaseUrl : "https://api."+process.env.domainkey+"/pdmnew",     // live api
    // feathersServiceBaseUrl : "http://localhost:3038",                        // local api
    varifyEmailUrl: "https://api." + process.env.domainkey + "/auth/api/verifyemail",
    socketURI: 'wss://ws.' + process.env.domainkey + ':4038',                    // live socket
    // socketURI: 'ws://localhost:4038',                                        // local socket

    
    facebookSuccessCallbackUrl: frontEndUrl,
    googleSuccessCallbackUrl: frontEndUrl,
    twitterSuccessCallbackUrl: frontEndUrl,
    githubSuccessCallbackUrl: frontEndUrl,
    linkedInSuccessCallbackUrl: frontEndUrl,

    flowzDashboardUrl: 'https://www.dashboard.' + process.env.domainkey,
    flowzBuilderUrl: 'https://www.webbuilder.' + process.env.domainkey,
    flowzVmailUrl: 'https://www.vmail.' + process.env.domainkey,
    flowzUploaderUrl: 'https://www.uploader.' + process.env.domainkey,
    flowzDbetlUrl: 'https://www.dbetl.' + process.env.domainkey, 
    
    loginWithFacebookUrl : 'https://auth.'+process.env.domainkey+'/auth/facebook',
    loginWithGoogleUrl : 'https://auth.'+process.env.domainkey+'/auth/google',
    loginWithTwitterUrl : 'https://auth.'+process.env.domainkey+'/auth/twitter',
    loginWithGithubUrl : 'https://auth.'+process.env.domainkey+'/auth/github',
    loginWithLinkedInUrl : 'https://auth.'+process.env.domainkey+'/auth/linkedin',

    // loginWithFacebookUrl : 'https://auth.'+process.env.domainkey+'/auth/facebook',
    // loginWithGoogleUrl : 'https://auth.'+process.env.domainkey+'/auth/Gplus',
    // loginWithTwitterUrl : 'https://auth.'+process.env.domainkey+'/auth/twitter',
    // loginWithGithubUrl : 'https://auth.'+process.env.domainkey+'/auth/github',
    // loginWithLinkedInUrl : 'https://auth.'+process.env.domainkey+'/auth/linkedin',

    subscriptionUrl: 'https://api.' + process.env.domainkey + '/subscription/',
    usersubscriptionUrl: 'https://api.' + process.env.domainkey + '/subscription/user-subscription'
  }
}



