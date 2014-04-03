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

app.controller('CurrencyCtrl', ['$scope', '$location', '$timeout', 'Address', 'Currency', ($scope, $location, $timeout, Address, Currency)->
  $scope.handleClick = (currency)->
    current = $("button[data-currency=#{currency}]")
    current.removeClass('btn-info').addClass('btn-success')
    current.find('.legend').text("")
    current.find('.glyphicon').removeClass('hidden')

    window.setInterval ()->
        current.addClass('btn-info').removeClass('btn-success')
        current.find('.legend').text("Copy to Clipboard")
        current.find('.glyphicon').addClass('hidden')
      , 2000

    return

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
