$(function() {
  var client;
  client = new ZeroClipboard($(".copy-button"));
  return client.on("load", function(client) {
    return client.on("complete", function(client, args) {
      $(this).removeClass('btn-info').addClass('btn-success');
      $(this).find('.legend').text("Copied !");
      return $(this).find('.glyphicon').removeClass('hidden');
    });
  });
});
