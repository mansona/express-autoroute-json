var createMeta = require('./helpers/metaCreation');

module.exports = function (options) {
	if(options.find.limit){//Pagination has been applied to the find
		return function (req, res) {
			//First carry out a count so that we can fill in the meta data
			options.model.count(req.autorouteQuery).exec()
			.then(function(count){
				//Do the find and pass the results and meta to the process
			 	options.model.find(req.autorouteQuery).skip(req.autorouteOffset).limit(req.autorouteLimit).sort(req.autorouteSort).exec()
				.then(function (results){
					var meta = createMeta(count, req.autorouteOffset, req.autorouteLimit);
					if(options.find.process){
						//Allow the user to process the data themselves and thus key the items correctly
						return res.json(options.find.process(results, meta));
					}
					
					//Send back a generic respond using 'data' instead of the model name for the key
					return res.json({data: results, meta: meta});
				});
			});	        
		};
	}

	return function (req, res) {
		var query = options.model.find(req.autorouteQuery).sort(req.autorouteSort);
		query.exec().then(function (results) {
			if(options.find.process){
				return res.json(options.find.process(results));
			}
			res.json(results);
		});
	};
}