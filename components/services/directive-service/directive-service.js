angular.module('atDirectiveService', ['atServerService'])
  .service('atDirApi', ['atServer', '$q',function(atServer,$q){
  
    /////OBJECT STRUCTURES/////////
    var project = '';
    var action = {
      'actions': ['Tap', 'Double tap', 'Focus', 'Hold', 'Swipe right', 'Swipe left', 'Swipe down', 'Swipe up'],
      'objects': [],
      'results': []
    };

    var output = {
      'key': '',
      'typeOuts': ['Animation','Form','Image','Menu','Message','Pop-Up'],
      'desc': ''
    };

    var input = {
      'key': '',  
      'typeIns': ['Button', 'Checkbox Group', 'Date', 'Email', 'File', 'Number', 'Password','Radio Group', 'Range', 'Submit Button', 'Screen Region', 'Text', 'Time'],
      'restrictions': {
        'Text': ['Exact Text', 'Uppercase Only', 'Lowercase Only', 'Mixed Case', 'Alphabetic', 'Alphanumeric', 'Alphanumeric + Symbols', 'Symbols Only', 'Title Case', 'Regular Expression'],
        'Password': ['Exact Text', 'Uppercase Only', 'Lowercase Only', 'Mixed Case', 'Alphabetic', 'Alphanumeric', 'Alphanumeric + Symbols', 'Symbols Only', 'Title Case', 'Regular Expression'],
        'Number': ['Minimum Number', 'Maximum Number', 'Exact Number', 'Phone Number', 'All Real Numbers', 'Negative Only', 'Positive Only'],
        'File': ['Minimum Size', 'Maximum Size', 'File Type']
      },
      'desc': ''
    };

    var navigation = {
      'actions': ['Tap', 'Double tap', 'Hold', 'Swipe right', 'Swipe left', 'Swipe down', 'Swipe up'],
      'objects': [],
      'results': []
    };

    var build = {
      'build-assets': []
    };
  
    var existsHash = {'input': {}, 'output':{}, 'action': {}, 'asset':{}, 'navigation':{}, 'build': {}};
    var objDB = {'input': [], 'output':[], 'action': [], 'asset':[], 'navigation':[], 'build': []};
    var objStructs = {'input': input, 'output':output, 'action': action, 'navigation':navigation, 'build':build};

    this.loadDropDownValues = function() {
      waitForFileNames(project).then(function(res) {
        navigation['results'] = res;
      });
      waitForBuildAssets(project).then(function(res) {
        build['build-assets'] = res;
      });
    }
    if(project){
      this.loadDropDownValues();
    }

    //////DIRECTIVE FUNCTIONS//////
    this.getStructure = function(type) {
      return objStructs[type];
    }
    
    this.storeObj = function(type, obj) {
      var found = false
      for(objType in existsHash){
        if(existsHash[objType][obj.key] !== undefined){
          found = true;
        }
      }
      if(!found){
        var key = obj.key;
        existsHash[type][key] = objDB[type].length;
        objDB[type].push(obj);
        return key;
      }
      atServer.message('Please do not make duplicate object keys.', 'danger');
      return false;
    }

    this.removeObj = function(type, obj) {
      existsHash[type][obj.key] -= 1;
      var i;
      for(i = 0; i < objDB[type].length; i++) {
        if(objDB[type][i].key == obj.key){
          break;
        }
      }
      objDB[type].splice(i, 1);
    }

    this.getObj = function(type, key) {
      var ind = existsHash[type][key];
      if( ind >= 0 && ind !== undefined){
        return objDB[type][ind];
      }
      return undefined;
    }

    this.getTypeRay = function(type){
      return objDB[type];
    };

    this.getTypeLength = function(type) {
      return objDB[type].length;
    }

    this.toStringParts = function(type, object) {
      //var str = '';
      if(type == 'action') {
        return ['Action '+object.action+' on ', object.object,' does ',object.result];
      }
      else if(type == 'output'){
        return ['Output '+object.key+' displays '+object.typeOut+' that '+object.desc];
      }
      else if(type == 'input'){
        if(object.restrictions) {
          var restrictRay = Object.keys(object.restrictions)
            .map(function (key) {
              if(object.restrictions[key] === true)
                return key;
              return (object.restrictions[key]||object.restrictions[key]===0)?key+': '+object.restrictions[key]:false}
            )
            .filter(function(x){return x!=false});
          var restricts = (restrictRay.length)? ' requires '+restrictRay.toString() : '';
          return ['Input '+object.key+' of type '+object.type+restricts];
        }
        else{
         return ['Input '+object.key+' is of type '+object.type]; 
        }
      }
      else if(type == 'navigation'){
        return ['Action '+object.action+' on ', object.object, ' goes to ',object.result];
      }
      else if(type == 'asset'){
        return ['Asset '+object.key+' is a(n) '+object.desc+' used by ',object.usedBy];
      }
      else if(type == 'build'){
        return [object.key+' is a(n) '+object.desc+' that uses ', object.asset];
      }
    }


    this.toPopOverParts = function(type, object,project) {
      if(type == 'output' && object){
        var html = '<div style="font-size:16px"><b>'+object.key+'</b></div><hr>'+
                   '<div><b>Type:</b> '+object.typeOut+'</div>'+
                   '<div><b>Description:</b><p>'+object.desc+'</p></div>';
        return {key:object.key, body:html}
      }
      else if(type == 'input' && object){
        if(object.restrictions) {
          var restrictRay = Object.keys(object.restrictions)
            .map(function (key) {
              if(object.restrictions[key] === true)
                return key;
              return (object.restrictions[key]||object.restrictions[key]===0)?key+': '+object.restrictions[key]:false}
            ).filter(function(x){return x!=false});
          var html = '<div style="font-size:16px"><b>'+object.key+'</b></div><hr>'+
                     '<div><b>Type:</b> '+object.type+'</div>'+
                     '<div><b>Restrictions:</b><br><ul>';
                      for(var i = 0; i < restrictRay.length; i++) {
                        html+= '<li>'+restrictRay[i]+'</li>';
                      }
                      html+= '</ul></div>';
          return {key:object.key, body:html}
        }
        else{
          var html = '<div style="font-size:16px"><b>'+object.key+'</b></div><hr>'+
                      '<div><b>Type:</b> '+object.type+'</div>';
          return {key:object.key, body:html}
        }
      }
      else if(type == 'build' && object){
        var html = '<img src="projects/'+project+'/build-assets/'+object.asset+'" width="180px" height:"auto">';
        return {key:object.asset, body:html};
      }
      else if(type == 'navigation' && object){
        var html = '<img src="projects/'+project+'/file-images/'+object+'.png" width="180px" height:"auto">';
        return {key:object, body:html};
      }
    }

    this.getLinkableObjects = function(type){
      if(type == 'assets') {
        return Object.keys(existsHash['output']);
      }
      else if(type == 'actions') {
        return {
          objects:Object.keys(existsHash['input']),
          results:Object.keys(existsHash['output'])
        };
      }
      else if(type == 'navigations') {
        return Object.keys(existsHash['input']);
      }
    };
    /////API STUFF/////
    function waitForBuildAssets(projectName) {
      if(projectName){
        return atServer.getBuildAssets(projectName).then(function(res){
          return res;
        });
      }
    }
    function waitForFileNames(projectName) {
      if(projectName){
        return atServer.getFileNames(projectName).then(function(res){
          return res;
        });
      }
    }

    //////////////////DOC STRUCTURE///////////////////////
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

    var getBlankDoc = function() {
      return {
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
    }
    
    this.reset = function() {
      docObj = getBlankDoc();
      objDB = {'input': [], 'output':[], 'action': [], 'asset':[], 'navigation':[], 'build': []};
      existsHash = {'input': {}, 'output':{}, 'action': {}, 'asset':{}, 'navigation':{}, 'build': {}};

      if(project){
        this.loadDropDownValues();
      }
    }

    this.selectProject = function(projectName) {
      project = projectName;
    }

    this.setFileName = function(project, fileName){
      docObj.Name = fileName;
      var url = './projects/'+project+'/file-images';
      atServer.getFileImages(project).then(function(res){
        res.forEach(function(x) {
          if(x.substring(0,x.indexOf('.')) == fileName) {
            url = url+'/'+x;
          }
        })
        if(url == './projects/'+project+'/file-images'){
          url = url+'/'+fileName+'.png';
        }
        docObj.URL = url;//'projects/'+project+'/file-images/'+fileName+'.png';
      });
    };
    this.getFileName = function(){
      return docObj.Name;
    }
    this.getDocObj = function(projectName, fileName) {
      if(projectName){
        project = projectName;
        if(fileName) {
          this.setFileName(projectName, fileName);
          return this.getFileData(projectName, fileName).then(function(res){
            docObj = res.data;
            return res.data;
          })
        }
      }
      else {
        return docObj;
      }
    };

    this.getGroup = function(prop1, prop2){
      if(prop2){
        docObj[prop1][prop2] = objDB[prop2];
        return docObj[prop1][prop2];
      }
      else{
        docObj[prop1] = objDB[prop1];
        return docObj[prop1];
      }
    };
    this.readyForRead = false;
    this.waitForReadyRead = function() {
      var deferred = $q.defer();

      setTimeout(function(){
          deferred.resolve(this.readyForRead);
      }.bind(this), 1000);

      return deferred.promise;
    }
    this.getFileData = function(projectName, fileName) {
      if(projectName && fileName){
        return atServer.getFileData(projectName, fileName).then(function(res){
          objDB = res.directives.objDB;
          existsHash = res.directives.existsHash;
          return res;
        });
      }
    };

    this.saveFile = function(projectName, fileName, doc, created, temp) {
      console.log(existsHash)
      if(projectName && fileName){
        atServer.saveFile(projectName, fileName, doc, created, temp, objDB, existsHash);
      }
    }

    this.getObjDB = function(){
      return objDB;
    }
    //////////MISC FUNCTIONS//////////
   
  }]);