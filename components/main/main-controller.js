angular.module('atMain')
  .controller('MainController', ['$scope', 'atDirApi', 'atServer', '$sce', '$filter','$routeParams', '$location', '$window', function($scope, atDirApi, atServer, $sce, $filter, $routeParams, $location, $window) {

    $scope.tabs = [{title:'Markdown View', active:true}, {title:'Raw Markdown', active:false}, {title:'JSON Raw', active:false}, {title:'Image View', active:false}];
    $scope.propertyTypes = ['input', 'output','action', 'navigation','asset', 'build'];
    $scope.atDirApi = atDirApi;
    $scope.project =  '';
    $scope.fileName = '';
    $scope.selected = {'input':false, 'action': false, 'asset':false, 'output':false, 'navigation':false, 'build':false};
    $scope.created = {};
    $scope.temp = {};
    $scope.doc = {};
    // $scope.doc = atDirApi.getDocObj($routeParams.project || '', $routeParams.file || '');
    $scope.showImage = false;

    
    $scope.convert = function(pType, prop) {
      var res = atDirApi.toStringParts(pType, prop);
      if(pType == 'action') {
        if(!$scope.created[prop.object]){
          $scope.created[prop.object] = true;
          $scope.temp[prop.object] = atDirApi.toPopOverParts('input', atDirApi.getObj('input',prop.object));
        }
        if(!$scope.created[prop.result]){
          $scope.created[prop.result] = true;
          $scope.temp[prop.result] = atDirApi.toPopOverParts('output', atDirApi.getObj('output',prop.result));
        }
      }
      else if(pType == 'asset'){
        if(!$scope.created[prop.usedBy]){
          $scope.created[prop.usedBy] = true;
          $scope.temp[prop.usedBy] = atDirApi.toPopOverParts('output', atDirApi.getObj('output',prop.usedBy));
        }
      }
      else if(pType == 'navigation'){
        if(!$scope.created[prop.object]){
          $scope.created[prop.object] = true;
          $scope.temp[prop.object] = atDirApi.toPopOverParts('input', atDirApi.getObj('input',prop.object));
        }
        if(!$scope.created[prop.result]){
          $scope.created[prop.result] = true;
          $scope.temp[prop.result] = atDirApi.toPopOverParts('navigation', prop.result, $scope.project);
        }
      }
      else if(pType == 'build'){
        if(!$scope.created[prop.asset]){
          $scope.created[prop.asset] = true;
          $scope.temp[prop.asset] = atDirApi.toPopOverParts('build', prop, $scope.project);
        }
      }
      return res;
    };

    $scope.safeHtml = function(html, isGif) {
      if(isGif) {
        var gifHtml = '<img src="projects/example/build-assets/'+html+'" width="180px" height:"auto">'
        return $sce.trustAsHtml(gifHtml)
      }
      return $sce.trustAsHtml(html);
    };

    $scope.titleCase = function(text) {
      return text.charAt(0).toUpperCase()+text.substring(1);
    };

    $scope.getFileNames = function(project) {
      return atServer.getFileNames(project);
    };

    $scope.getFileImages = function(project) {
      return atServer.getFileImages(project);
    };

    $scope.showFunc = function(){
      $scope.showImage = !$scope.showImage;
    }

    $scope.confirmDelete = function() {
      if($window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) { 
        atServer.deleteFile($scope.project,$scope.fileName || $scope.doc.Name);
        $location.path('/'+$scope.project);
      }
    }

    $scope.getBuildAssets = function() {
      return atServer.getBuildAssets(project);
    }
    
    $scope.removeObj = function(type,obj){
      atDirApi.removeObj(type,obj);
    }
    $scope.setFileName = function(project, file) {
      atDirApi.setFileName(project,file);
      $scope.fileName = file;
    }

    $scope.saveFile = function() {
      atDirApi.saveFile($scope.project, $scope.doc.Name , $scope.doc, $scope.created, $scope.temp);
      $location.path('/'+$scope.project+'/'+$scope.fileName || $scope.doc.Name);
    };
    $scope.selectProject = function(project, skipReset) {
      if(skipReset == true && !$routeParams.file){
        $location.path('/'+project);
      }
      if($scope.project){
        $scope.saveFile();
      }
      $scope.fileName = '';
      $scope.project = project;
      atDirApi.selectProject(project);
      atDirApi.reset();
      $scope.doc = atDirApi.getDocObj();
      getNamesOf('files');
      $scope.created = {};
      $scope.temp = {};
      return project;
    }
    $scope.selectFile = function(file, skipReset) {    
      if($scope.fileName.length){
        atServer.saveFile($scope.project, $scope.doc.Name, $scope.doc, $scope.created, $scope.temp, atDirApi.getObjDB());
      }
      $scope.fileName = file;
      atDirApi.reset();
      atDirApi.getDocObj($scope.project, file).then(function(res) {
        $scope.doc = res;
      });
      getNamesOf('files');
      atDirApi.getFileData($scope.project, file).then(function(res) {
        $scope.created = res.directives.created;
        $scope.temp = res.directives.temp;
        atDirApi.readyForRead = true;
        //atDirApi.loadDropDownValues();
      });
       if(skipReset == true){
        $location.path('/'+$scope.project+'/'+file);
      }
      return file;
    }

    $scope.projectsList = [];
    $scope.filesList = [];

    var getNamesOf = function(type) {
      if(type == 'projects'){
        atServer.getProjects().then(function(res){
            return res;
          }).then(function(res){
            $scope.projectsList = res;
          });
      }
      else {
        atServer.getFileNames($scope.project).then(function(res){
            return res;
          }).then(function(res){
            $scope.filesList = res;
          })
      }
    }
    getNamesOf('projects');
    if($scope.project.length){
      getNamesOf('files');
    }
    
    $scope.createNew = function(type, project, file) {
      if(type == 'project'){
        atServer.createProject(project);
        $scope.selectProject(project)
      }
      else {
        atServer.createFile(project,file);
        atDirApi.readyForRead = true;
        atServer.getFileNames($scope.project).then(function(res){
            return res;
          }).then(function(res){
            $scope.filesList = res;
            $scope.selectFile(file)
          });
      }
    }

    $scope.toJSON = function(){
      var obj = $filter('json',2)($scope.doc)
      return $sce.trustAsHtml(obj.replace(/\n/g, '<br>'));
    }

    if($routeParams.project) {
      $scope.selectProject($routeParams.project, true);
      if($routeParams.file) {
        $scope.selectFile($routeParams.file, true);
      }
    }
    else {
      atDirApi.reset();
      $scope.doc = atDirApi.getDocObj();
    }
  }]);