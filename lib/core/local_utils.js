exports.mergeMissing = function(o1, o2) {
	if (o1 === undefined) o1 = {};
	if (o2 === undefined) o2 = {};
	for (var p in o2) {
		try {
			if (o2[p].constructor==Object) {
				o1[p] = exports.mergeMissing(o1[p], o2[p]);
			} else {
				if (o1[p] === undefined)
					o1[p] = o2[p];
			}
		} catch(e) {
			o1[p] = o2[p];
		}
	}
	return o1;
};

exports.merge = function(o1, o2) {
	if (o1 === undefined) o1 = {};
	if (o2 === undefined) o2 = {};
	for (var p in o2) {
		try {
			if (o2[p].constructor==Object) {
				o1[p] = exports.merge(o1[p], o2[p]);
			} else {
				o1[p] = o2[p];
			}
		} catch(e) {
			o1[p] = o2[p];
		}
	}
	return o1;
};
