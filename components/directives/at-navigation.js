angular.module('atDirectives')
  .directive('atNavigation', [function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        active: '=',
        navigation: '=',
        add: '&addNavigation',
      },
      templateUrl: 'components/directives/at-navigation.html'
    }
  }]);