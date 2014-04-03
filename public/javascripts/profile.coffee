app = angular.module('app', ['ngResource', 'ngClipboard']);

app.config(['ngClipProvider', (ngClipProvider)->
  ngClipProvider.setPath("zeroclipboard/ZeroClipboard.swf");
]);
app.factory('Address', ['$resource',
  ($resource)->
    $resource('/api/:hash', {hash: '@hash'}, {
      query: {method:'GET', isArray:true}
    });
  ]
);
app.factory('Currency', ['$resource',
  ($resource)->
    $resource('/api/currencies/:id', {id: '@id'}, {
      query: {method:'GET', isArray:true}
    });
  ]
);

app.controller('IndexCtrl', ['$scope', '$location', '$timeout', 'Address', 'Currency', ($scope, $location, $timeout, Address, Currency)->
  $scope.handleClick = (currency)->
    el = $("button[data-currency=#{currency}]")

    old_text = el.find('.small').text()
    el.find('.small').text('Copied !')
    el.find('.glyphicon-link').addClass('hidden')
    el.find('.glyphicon-ok').removeClass('hidden')
    el.removeClass('btn-warning').addClass('btn-success')

    $timeout ->
        el.find('.small').text(old_text)
        el.addClass('btn-warning').removeClass('btn-success')
        el.find('.glyphicon-link').removeClass('hidden')
        el.find('.glyphicon-ok').addClass('hidden')
      , 1500

  $scope.handleProfileUrlClick = ->
    el = $('#profile_url')

    old_text = el.find('.small').text()
    el.find('.small').text('Copied !')
    el.find('.glyphicon-link').addClass('hidden')
    el.find('.glyphicon-ok').removeClass('hidden')

    $timeout ->
        el.find('.small').text(old_text)
        el.find('.glyphicon-link').removeClass('hidden')
        el.find('.glyphicon-ok').addClass('hidden')
      , 1500

  # We use ng-init to pass the hash variable along, so the variable only exists later
  $scope.$watch 'hash', ->
    $scope.profile_url = 'http://gravaco.in/' + $scope.hash
    $scope.addresses = Address.query {hash: $scope.hash}
]);
