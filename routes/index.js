
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Gravacon - Like Gravatar, for your coin addresses !' });
};
