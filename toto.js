var vizion = require('vizion');

vizion.analyze({
    folder : __dirname
}, function(err, meta) {
    if (err) throw new Error(err);

    console.log(meta);
});
