module.exports = function(){

	var suggesterMapping = function(language, scheme){
    return {
      _source: {
        enabled: true
      },
      properties: {
        id: {
          type: 'string',
          store: 'yes',
          index: 'not_analyzed',
          include_in_all: 'no'
        },
        label: {
          type: 'string',
          store: 'yes',
        }
      }
    };
  };

  var tag_definition =  {
		scheme: {
			type: "string",
			index: "not_analyzed",
			include_in_all: false
		},
		id: {
			type: "string",
			index: "not_analyzed",
			include_in_all: false
		},
		label: {
			type: "string",
			store: "yes",
			boost: 2.0
		},
		geo: {
			"type": "geo_point"
		},
		location: {
			type: "string",
			index: "not_analyzed",
			store: "yes",
			include_in_all: false
		}
	};

  return {
		places_en: suggesterMapping('en', 'places'),
		places_ar: suggesterMapping('ar', 'places'),
		people_en: suggesterMapping('en', 'people'),
		people_ar: suggesterMapping('ar', 'people'),
		topics_en: suggesterMapping('en', 'topics'),
		topics_ar: suggesterMapping('ar', 'topics'),
		unpublished: {
			_source: {
				enabled: false
			},
			properties: {
				filter: {
					type: "string",
					index: "not_analyzed",
					include_in_all: false,
					store: "yes"
				},
				id: {
					type: "string",
					index: "not_analyzed",
					include_in_all: false,
					store: "yes"
				},
				modified: {
					type: "date",
					format: "date_time",
					store: "yes",
					include_in_all: false
				}
			}
		},
		article: {
			_source: {
				enabled: true
			},
			properties: {
				title: {
					type: "string",
					store: "yes",
					boost: 3.0
				},
				summary: {
					type: "string",
					store: "yes"
				},
				body: {
					type: "string"
				},
				lang: {
					type: "string",
					store: "yes",
					index: "not_analyzed",
					include_in_all: false
				},
				byline: {
					type: "string",
					store: "yes"
				},
				source: {
					type: "string",
					store: "yes",
					include_in_all: false
				},
				filter: {
					type: "string",
					index: "not_analyzed",
					include_in_all: false
				},
				channel: {
					type: 'string',
					index: 'not_analyzed',
					include_in_all: 'no'
				},
				mime: {
					type: "string",
					store: "yes",
					include_in_all: false
				},
				venue: {
					properties:tag_definition
				},
				cfns: {
					properties: {
						scheme: {
							type: "string",
							index: "not_analyzed",
							include_in_all: false
						},
						id: {
							type: "string",
							index: "not_analyzed",
							include_in_all: false
						},
						label: {
							type: "string",
							store: "yes",
							boost: 2.0
						}
					}
				},
				tags: {
					properties: {
						special:{
						  properties:tag_definition
						},
						topic:{
							properties:tag_definition
						},
						source:{
							properties:tag_definition
						}
					}
				},
				published: {
					type: "date",
					format: "date_time",
					store: "yes",
					include_in_all: false
				},
				created: {
					type: "date",
					format: "date_time",
					store: "yes",
					include_in_all: false
				},
				modified: {
					type: "date",
					format: "date_time",
					store: "yes",
					include_in_all: false
				},
				schedule: {
					properties:{
						start_date: {
							type: "date",
							format: "date_time",
							store: "yes",
							include_in_all: false
						},
						end_date: {
							type: "date",
							format: "date_time",
							store: "yes",
							include_in_all: false
						}
					}
				},
				media: {
					properties: {
						id: {
							type: "string",
							store: "yes",
							index: "no",
							include_in_all: false
						},
						caption: {
							type: "string",
							include_in_all: true
						},
						description: {
							type: "string",
							include_in_all: true
						}
					}
				},
				video: {
					properties: {
						url: {
							type: "string",
							store: "yes",
							index: "no",
							include_in_all: false
						},
						thumbnail: {
							properties: {
								id: {
									type: "string",
									store: "yes",
									index: "no",
									include_in_all: false
								},
								caption: {
									type: "string",
									include_in_all: true
								},
								description: {
									type: "string",
									include_in_all: true
								}
							}
						}
					}
				}
			}
		}
	};
};