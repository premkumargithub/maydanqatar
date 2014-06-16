module.exports = function(){

	var mergeMissing = function(o1, o2) {
    if (o1 === undefined) o1 = {};
    if (o2 === undefined) o2 = {};
    for (var p in o2) {
      try {
        if (o2[p].constructor==Object) {
          o1[p] = mergeMissing(o1[p], o2[p]);
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

	var i18n = {};
	var l10ns = {};
		
	i18n.get = function(lang) {
    return l10ns[lang];
	};
	
	i18n.accept = function(contrib) {
    l10ns = mergeMissing(l10ns, contrib);
	};
	
	return i18n;
};
