var createPrevious = function(offset, limit){
	if(offset > 0){
		return {
			offset: offset - limit,
			limit: limit
		};
	}
	return null;
};

var createCurrent = function(offset, limit){
	return {
		offset: offset,
		limit: limit
	};
};

var createNext = function(count, offset, limit){
	var current = offset + limit;
	var remainder = count - current;
	if(current != count){
		return {
			offset: offset + limit,
			limit: (remainder >= limit) ? limit : remainder
		}
	}

	return null;
};


module.exports = function(count, offset, limit){
	return {
		previous: createPrevious(offset, limit),
		current: createCurrent(offset, limit),
		next: createNext(count, offset, limit),
		count : count
	};
};