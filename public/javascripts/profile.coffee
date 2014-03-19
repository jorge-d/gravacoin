app = angular.module('app', ['ngResource', 'ngClipboard']);

app.config(['ngClipProvider', (ngClipProvider)->
  ngClipProvider.setPath("ZeroClipboard.swf");
]);
app.factory('Address', ['$resource',
  ($resource)->
    $resource('api/addresses/:hash', {hash: '@hash'}, {
      query: {method:'GET', isArray:true}
    });
  ]);

app.controller('CurrencyCtrl', ['$scope', '$location', 'Address', ($scope, $location, Address)->
  # $scope.client = new ZeroClipboard()

  $scope.handleClick = (address)->
    current = $("button[data-address=#{address}]")
    current.removeClass('btn-info').addClass('btn-success')
    current.find('.legend').text("Copied !")
    current.find('.glyphicon').removeClass('hidden')
    return

  $scope.$watch 'hash', ->
    $scope.addresses = Address.query {hash: $scope.hash}

]);
