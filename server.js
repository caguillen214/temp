console.log('Spec Builder File API Loading...');
var fs = require('fs');
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var docObj = {
      'Name': '',
      'URL': '',
      'Purpose': '',
      'Transitions': {
        'Build Ins': {},
        'Build Outs': {},
      },
      'Data': {
        'input': [],
        'output': [],
        'asset': [],
      },
      'action': [],
      'navigation': []
    };
var dirObj = {
  "existsHash": {'input': {}, 'output':{}, 'action': {}, 'asset':{}, 'navigation':{}, 'build': {}},
  "temp": {
  },
  "created": {
  },
  "objDB": {
    "input": [],
    "output": [],
    "action": [],
    "asset": [],
    "navigation": [],
    "build": []
  }
}
var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
   res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");
   if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  } else {
    return next();
  }
});

app.get('/delete-file', function(req, res){
  fs.unlinkSync('./projects/'+req.query.project+'/file-directives/'+req.query.file+'.json');
  fs.unlinkSync('./projects/'+req.query.project+'/file-jsons/'+req.query.file+'.json');
  res.send('File deleted');
});

app.get('/get-file-names', function(req, res){
  var dirs = fs.readdirSync('./projects/'+req.query.project+'/file-jsons')
    .filter(function(x) {return x.indexOf('.json') > -1})
  	.map(function(x){return x.substring(0,x.length-5)})
	res.json(dirs);
});

app.get('/get-file-images', function(req, res){
  var dirs = fs.readdirSync('./projects/'+req.query.project+'/file-images');
	res.json(dirs);
});

app.get('/get-build-assets', function(req, res){
  if(req.query && req.query.project) {
    var dirs = fs.readdirSync('./projects/'+req.query.project+'/build-assets');
  	res.json(dirs);
  }
});

app.get('/get-projects', function(req, res){
  var dirs = fs.readdirSync('./projects')
      .filter(function(x) {return x != '.DS_Store'})
	res.json(dirs);
});

app.get('/create-project', function(req, res){
  if(req.query && req.query.project) {
    fs.mkdirSync('./projects/'+req.query.project);
    fs.mkdirSync('./projects/'+req.query.project+'/build-assets');
    fs.mkdirSync('./projects/'+req.query.project+'/file-directives');
    fs.mkdirSync('./projects/'+req.query.project+'/file-images');
    fs.mkdirSync('./projects/'+req.query.project+'/file-jsons');
    res.send('Project Created');
  }
});

app.get('/create-file', function(req, res){
  console.log('CREATE FILE CALLED')
  if(req.query && req.query.file && req.query.project) {
    docObj.Name = req.query.file;
    var url = './projects/'+req.query.project+'/file-images';
    /////////ABSTRACT TO MORE THAN JSUT PNG//////////////
    var imgNames = fs.readdirSync(url);
    imgNames.forEach(function(x) {
      console.log(x+"  :  "+docObj.Name);
      if(x.substring(0,x.indexOf('.')) == docObj.Name) {
        url = url+'/'+x;
      }
    })
    if(url == './projects/'+req.query.project+'/file-images'){
      url = url+'/'+docObj.Name+'.png';
    }
    console.log('Final: '+url);
    //////////////////////////////////////////////////////
    docObj.URL = url;//'projects/'+req.query.project+'/file-images/'+req.query.file+'.png';
    var outputFile = './projects/'+req.query.project+'/file-jsons/'+req.query.file+'.json';
    var directivesFile = 'projects/'+req.query.project+'/file-directives/'+req.query.file+'.json';
    //fs.closeSync(fs.openSync(outputFile, 'w'));
    //fs.closeSync(fs.openSync(directivesFile, 'w'));
    fs.writeFile(outputFile, JSON.stringify(docObj, null, 2), function(err) {
      if(err) {
        console.log(err);
      } else {
        docObj.Name = '';
        docObj.URL = '';
        console.log("JSON created at " + outputFile);
      }
    });
    fs.writeFile(directivesFile, JSON.stringify(dirObj, null, 2), function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("JSON created at" + directivesFile);
      }
    });
    res.send('File Saved');
  }
});


app.post('/get-file-data', function(req, res){
  console.log(req.body)
  if(req.body && req.body.fileName && req.body.projectName) {
    var path = './projects/'+req.body.projectName+'/file-jsons/'+req.body.fileName+'.json';
    var directivesPath = './projects/'+req.body.projectName+'/file-directives/'+req.body.fileName+'.json';
    var data = JSON.parse(fs.readFileSync(path, 'utf8')) || {};
    console.log(data)
    var directives = JSON.parse(fs.readFileSync(directivesPath, 'utf8')) || {};
    res.json({data:data, directives:directives});
  }
});

app.post('/save-file', function(req, res){
  if(req.body && req.body.fileName && req.body.projectName) {
    var jsonData = req.body.jsonData || {};
    var created = req.body.created || {};
    var temp = req.body.temp || {};
    var existsHash = req.body.existsHash || {};
    var objDB = req.body.objDB || {};
    var directives = {temp:temp, created:created, objDB:objDB, existsHash:existsHash};
    var outputFile = 'projects/'+req.body.projectName+'/file-jsons/'+req.body.fileName+'.json';
    var directivesFile = 'projects/'+req.body.projectName+'/file-directives/'+req.body.fileName+'.json';
    fs.writeFile(outputFile, JSON.stringify(jsonData, null, 2), function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("JSON saved to " + outputFile);
      }
    });
    fs.writeFile(directivesFile, JSON.stringify(directives, null, 2), function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("JSON saved to " + directivesFile);
      }
    });
    res.send('File Saved');
  }
});

app.listen(3000);
console.log('Spec Builder File API ready.');