angular.module('atDirectives')
  .directive('atAsset', [function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        active: '=',
        asset: '=',
        add: '&addAsset',
      },
      templateUrl: 'components/directives/at-asset.html'
    }
  }]);