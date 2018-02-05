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
  host: '349d6e5f56299a9f7b9ff68ccd099977.us-west-2.aws.found.io',
  path: '_xpack/security/user/',
  port: '9243',
  auth: 'elastic:cRrL0LF9MkBpRIMKP9g3dTgV'
}

let esUrl = 'https://elastic:cRrL0LF9MkBpRIMKP9g3dTgV@349d6e5f56299a9f7b9ff68ccd099977.us-west-2.aws.found.io:9243'

let esClient = new elasticsearch.Client({
  host: esUrl,
  log: 'trace'
})

let queueOption = {
  name: 'importData'
}

const objQ = new rfqQueue(cxnOptions, queueOption)

function getJobQueue () {
  objQ.process((job, next) => {
    // Get all suppliers approve data.
    rethink.table('vshopDetail')
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
  let getUserNextVersion1 = await getUserNewVersion(ESuserData[objWorkJob.data.vId])
  let esUpdateArr = []
  for(let i=0;i<result.suppliers.length;i++){
    let supplyerName = result.suppliers[i].supplyerName
    let sku = result.suppliers[i].products
    let getEsSkuResponse = await getEsSku(supplyerName,sku)

    for(let j=0;j<getEsSkuResponse.hits.hits.length;j++){
      esUpdateArr.push({ 
        "update": { 
          "_index": "pdm1",
          "_type": "product", 
          "_id":getEsSkuResponse.hits.hits[j]._id
        }
      },
      { 
        "script": {
          "inline": "ctx._source.vid.add(params.newVid)",
          "params" : {
            "newVid" : getUserNextVersion1
          },
          "lang" : "painless"
        }
      })
    }
  }

  if(esUpdateArr.length > 0) {
    let dumpEsResponse = await dumpToES(esUpdateArr)
    let updateRdbResponse = await updateInRdb(objWorkJob,userData)
    if(updateRdbResponse){
      next(null,"sucessfull")
    }
    else{
      next(null,"unsucessfull")
    }
  }

}

async function updateInRdb(objWorkJob,userData){
  return rethink.table('vshopdata')
    .filter(r.row("id").eq(objWorkJob.data.vId))
    .update({
      "esUser":  userData[objWorkJob.data.vId].username,
      "password":  "123456",
      "status":  "completed"
    })
    .run()
}

async function dumpToES (makeProductJsonObj) {
  let bulkRowsString = makeProductJsonObj.map(function (row) {
    return JSON.stringify(row)
  }).join('\n') + '\n'
  // bulkRowsString += '\n'
  // console.log(makeProductJsonObj);
  return new Promise(function (resolve) {
    esClient.bulk({body: makeProductJsonObj}, function (err, resp) {
      if (!err) {
        resolve('Inserted')
      }
    })
  })
}

function getUserNewVersion (ESUser) {
  // console.log("===============",ESUser)
  let versionNo = 1;
  if (ESUser.metadata.user_version_history) {
    versionNo = ESUser.metadata.user_version_history.length + 1
  }
  return 'dist'+ ESUser.username + '-' + versionNo
}

async function getEsSku(supplyerName,sku){
  let response = await esClient.search({
    index:  'pdm1',
    type:  'product',
    body: {
      "_source":["_id"],
      "query": {
        "bool": {
          "must": [
            { "match": { "supplier_info.username":supplyerName }},
            { "match": { "country": "US" }}
          ],
          "should" : sku.map(function(obj) {
             return { "match" : { "sku" : obj }}
          })
        }
      }   
    }
  })
  return response
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
      'company': '',
      'sid': "dist"+vId+"-1"
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