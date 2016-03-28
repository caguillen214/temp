angular.module("atDirectives", ['ui.bootstrap', 'atDirectiveService']);

angular.module("atDirectives")
  .controller("DirectiveController" , ['$scope', 'atDirApi','$modal', function($scope, atDirApi, $modal){

    ///////////////////STRUCTURE CODE/////////////////////////////
    $scope.action = atDirApi.getStructure('action');
    $scope.navigation = atDirApi.getStructure('navigation');
    $scope.input = atDirApi.getStructure('input');
    $scope.output = atDirApi.getStructure('output');
    $scope.build = atDirApi.getStructure('build')
    $scope.asset = {
      linkableObjects:null, 
      reloadAssets: function(){
        $scope.asset.linkableObjects = atDirApi.getLinkableObjects('assets')
      }
    };

    $scope.action.reloadActions = function() {
        var res = atDirApi.getLinkableObjects('actions');
        $scope.action.objects = res['objects'];
        $scope.action.results = res['results'];
    }

    $scope.navigation.reloadNavigations = function() {
        var res = atDirApi.getLinkableObjects('navigations');
        $scope.navigation.objects = res;
    }

    atDirApi.waitForReadyRead().then(function(res){
      if(res){
        $scope.action.reloadActions();
        $scope.asset.reloadAssets();
        $scope.navigation.reloadNavigations();
      }
    })

    //////////////////////////////////////////////////////////////
    $scope.store = function(type, object) {  
      var res = Object.keys(object).filter(function(val){return object[val]});
      if(res.length){
        var success = atDirApi.storeObj(type, object);
        if(type == 'output' && success) {
          $scope.action.reloadActions();
          $scope.asset.reloadAssets();
        }
        return true;
      }
      return false;
    };

    $scope.input.openModal = function () {

        var modalInstance = $modal.open({
          animation: true,
          templateUrl: 'myModalContent.html',
          controller: 'ModalInstanceCtrl',
          resolve: {
            input: function () {
              return $scope.input;
            }
          }
        });

        modalInstance.result.then(function (object) {
          var success = $scope.store('input', object);
          if(success){
            $scope.action.reloadActions();
            $scope.navigation.reloadNavigations();
          }
        }, function () {
          //$scope.store('input', object);
        });
      };
  }]);


angular.module("atDirectives").controller('ModalInstanceCtrl', function ($scope, $modalInstance, input) {

  $scope.input = input;
  $scope.restrictsSelected = {};
  $scope.restrictionDetails = {
    'Text': {'Exact Text':null, 'Uppercase Only':null, 'Lowercase Only':null, 'Mixed Case':null, 'Alphabetic':null, 'Alphanumeric':null, 'Alphanumeric + Symbols':null, 'Symbols Only':null, 'Title Case':null, 'Regular Expression':null},
    'Password': {'Exact Text':null, 'Uppercase Only':null, 'Lowercase Only':null, 'Mixed Case':null, 'Alphabetic':null, 'Alphanumeric':null, 'Alphanumeric + Symbols':null, 'Symbols Only':null, 'Title Case':null, 'Regular Expression':null},
    'Number': {'Minimum Number':null, 'Maximum Number':null, 'Exact Number':null, 'Phone Number':null, 'All Real Numbers':null, 'Negative Only':null, 'Positive Only':null},
    'File': {'Minimum Size':null, 'Maximum Size': null, 'File Type': null},
  }
  $scope.type;
  $scope.inputKey;
  $scope.fileTypes = ['Data Document', 'Image File', 'Microsoft Document', 'Plain Text Document', 'Sound File', 'Video File'];

  $scope.ok = function () {
    var restricts = $scope.restrictionDetails[$scope.type];
    for(key in $scope.restrictsSelected[$scope.type]){
      if(!$scope.restrictionDetails[$scope.type][key]){
        restricts[key] = $scope.restrictsSelected[$scope.type][key]
      }
    }
    $modalInstance.close({type:$scope.type, restrictions: restricts, key: $scope.inputKey});
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});