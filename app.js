angular.module('atTuple', ['ngRoute', 'atMain'])
  .config(['$routeProvider',function($routeProvider) {
    $routeProvider.
      when('/:project?/:file?', {
        templateUrl: 'components/main/main.html',
        controller: 'MainController'
      }).
      otherwise({
        redirectTo: '/'
      });
}]);

