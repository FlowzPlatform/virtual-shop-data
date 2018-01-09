const config = require('./config.json')
const table = config.table
const cxnOptions = config.cxnOptions
const connOptions = config.connOptions
const pdmUrl = config.pdmUrl
const r = require('rethinkdbdash')(cxnOptions)
const rethink = require('rethinkdbdash')(connOptions)
const rfqQueue = require('rethinkdb-job-queue')
let rpRequest = require('request-promise')
let ESuserData = null
var elasticsearch = require('elasticsearch')

let optionsES = {
  tls: 'https://',
  host: 'f21a94c6770cd2850444cb6de9b333cf.us-east-1.aws.found.io',
  path: '_xpack/security/user/',
  port: '9243',
  auth: 'elastic:J26n7GwOFk7vtqG7xiHQi8gX'
}

const esClient = new elasticsearch.Client(optionsES)

let queueOption = {
  name: 'importData'
}

const objQ = new rfqQueue(cxnOptions, queueOption)

function getJobQueue () {
  objQ.process((job, next) => {
    // Get all suppliers approve data.
    rethink.table('vshopdata')
  	.filter(r.row("id").eq(job.data.vId))
    .run().then(function(result) {
    	doJob(job, result[0], next)
		})
  })
}

async function doJob (objWorkJob,result,next) {
  if(!objWorkJob.data)
  {
    return false
  }
  // check user created on ES
  let userData = await getUserRequestResponse(objWorkJob)

  let response = await esClient.search({
    index:  'pdm1',
    type:  'product',
    body: {
      "query": {
        "must": {
          "should": [
            { "match": { "supplier_info.username":"sweda" }},
            { "match": { "country": "US" }}
          ]
        }
      }   
    }
  })

  console.log(response)
  
  // for(let i=0;i<result.supplyers.length;i++){
  // 	let supplyerName = result.supplyers[i].supplyerName
  // 	let userData = await getESUser(supplyerName)
  // 	userData = JSON.parse(userData)

  // 	console.log(userData[supplyerName].metadata.sid)
  // }

  // await userDataPrepared(objWorkJob)

  // objWorkJob.done()
  // updateJobQueueStatus(objWorkJob)
}

async function getUserRequestResponse (objWorkJob) {
  let jobData = objWorkJob.data
  let emailId = jobData.emailId
  let vId = jobData.vId
  let userData = await getESUser(vId)
  if (userData && Object.keys(userData).length > 0) {
    // User Exists
    ESuserData = JSON.parse(userData)
    return ESuserData
  } else {
    // make new user with version
    let userData = await makeNewUser(objWorkJob)
    return userData
  }
}

async function getESUser (vId) {
  // make http request for user exist or not
  return await makeHttpSRequest(vId)
}

async function makeHttpSRequest (vId) {
  let objOptions = optionsES
  try {
    let response = await rpRequest( objOptions.tls + objOptions.auth + '@' + objOptions.host + ':' + objOptions.port + '/' + objOptions.path + vId)
    return response
  } catch (error) {
    return {}
  }
}

async function makeNewUser (objWorkJob) {
  let jobData = objWorkJob.data
  let emailId = jobData.userdetail.emailId
  let username = jobData.userdetail.username
  let vId = jobData.vId

  let userObject = {
  	'username': vId,
    'password': '123456',
    'roles': ['read_write'],
    'full_name': username,
    'email': emailId,
    'metadata': {
      'company': ''
    },
    'enabled': true
  }

  await makeHttpsPostRequest(vId, userObject)

  let userData = await getESUser(vId)
  if (userData && Object.keys(userData).length > 0) {
    // User Exists
    ESuserData = JSON.parse(userData)
    return ESuserData
  }
}

async function makeHttpsPostRequest (username, userData) {
  let objOptions = optionsES
  let reqOptions = {
    method: 'POST',
    uri: objOptions.tls + objOptions.auth + '@' + objOptions.host + ':' + objOptions.port + '/' + objOptions.path + username,
    body: userData,
    json: true
  }

  let response = await rpRequest(reqOptions)
  return response
}


getJobQueue()