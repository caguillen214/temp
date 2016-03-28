angular.module('atServerService', [])
  .service('atServer', ['$q', '$http',function($q, $http){
    // $scope.fileNames = [];
    // $scope.fileImages = [];
    // $scope.buildAssets = [];

    ////////////APP MESSAGE ALERT////////////
    this.message = function(msg,type){   
       var el = document.createElement("div");
       el.setAttribute("class","alert alert-"+type);
       el.setAttribute("style","  margin: -70px auto 0 auto;width: 25%;text-align: center;z-index: 1031;position: fixed;right: 0;left: 0;padding: 7px;");
       el.innerHTML = msg;
       setTimeout(function(){
        el.parentNode.removeChild(el);
       },3000);
       document.body.insertBefore( el, document.body.firstChild );
    }
    ///////////////////////////////////////

    this.getFileNames = function(projectName) {
      if(projectName){
        var res = {};
        var defer = $q.defer();
        $http.get("http://localhost:3000/get-file-names?project="+projectName)
          .success(function(data){
            res = data;
            defer.resolve(data);
          });
        return defer.promise;
      }
    };

    this.getFileImages = function(projectName) {
      if(projectName){
        var res = {};
        var defer = $q.defer();
        $http.get("http://localhost:3000/get-file-images?project="+projectName)
          .success(function(data){
            res = data;
            defer.resolve(data);
          });
        return defer.promise;
      }
    };

    this.getBuildAssets = function(projectName) {
      if(projectName){
        var res = {};
        var defer = $q.defer();
        $http.get("http://localhost:3000/get-build-assets?project="+projectName)
          .success(function(data){
            res = data;
            defer.resolve(data);
          });
        return defer.promise;
      }
    };

    this.getProjects = function() {
      var res = {};
      var defer = $q.defer();
      $http.get("http://localhost:3000/get-projects")
        .success(function(data){
          res = data;
          defer.resolve(data);
        });
      return defer.promise;
    };

    this.saveFile = function(projectName ,fileName, jsonData, created, temp, objDB, existsHash) {
      if(projectName && fileName)
        $http.post('http://localhost:3000/save-file', 
          {
            projectName: projectName,
            fileName: fileName,
            jsonData: jsonData,
            created: created,
            temp: temp,
            objDB: objDB,
            existsHash: existsHash
          })
          .success(function(data, status, headers, config) {
            this.message('File: '+fileName+' successfully saved in '+projectName, 'info');
          }.bind(this));
    };

    this.getFileData = function(projectName, fileName) {
      if(projectName && fileName){
        var res = {};
        var defer = $q.defer();
        $http.post('http://localhost:3000/get-file-data', 
           {
             projectName: projectName,
             fileName: fileName
           })
           .success(function(data, status, headers, config) {
              res = data;
              defer.resolve(data);
           });
        return defer.promise;
      }
    };

    this.createFile = function(projectName, fileName) {
      if(projectName && fileName)
        $http.get("http://localhost:3000/create-file?project="+projectName+'&file='+fileName)
        .success(function(data){
          this.message('File: '+fileName+' successfully created in '+projectName , 'info');
        }.bind(this));
    };

    this.createProject= function(projectName) {
      if(projectName)
        $http.get("http://localhost:3000/create-project?project="+projectName)
        .success(function(data){
          this.message("Project: "+projectName+" successfully saved", "info");
        }.bind(this));
    }

    this.deleteFile = function(projectName, fileName){
      $http.get("http://localhost:3000/delete-file?project="+projectName+'&file='+fileName)
        .success(function(data){
          this.message('File: '+fileName+' successfully deleted in '+projectName , 'info');
        }.bind(this));
    }
  }]);