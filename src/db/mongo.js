const mongoose = require('mongoose');
const boom = require('@hapi/boom');
const options = {
    //reconnectInterval: 2000,
    //reconnectTries: 30, // Retry up to 30 times
};

const MONGO_URI = process.env.MONGO_URI;
console.log("--- MongoDB connecting... ", MONGO_URI);

// Connect to DB
mongoose.connect(MONGO_URI, options);

// When successfully connected
mongoose.connection.on('connected', () => {
  console.log('--- MongoDB connected');
});

// When successfully reconnected
mongoose.connection.on('reconnected', () => {
  console.log('--- MongoDB dbevent: reconnected');
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
  console.log(`--- MongoDB dbevent: error: ${err}`);
  //console.log(`Retry mongo connect`);
  //mongoose.connect(MONGO_URI, options);
});
  

// Get Data Models
const User = require('./models/User');
const Session = require('./models/Session');
const SessionDetails = require('./models/SessionDetails');


const getNewCountExtend = function(provision) {
  return provision.countExtend !== undefined? (provision.countExtend + 1) : 1;
};

const getNewTimeRunning = function (provision) {
  let timeRunning = provision.timeRunning !== undefined?  provision.timeRunning : 0; //minutes
  
  if ( provision.statusVms === 'Stopped' ) {
    return timeRunning;
  } else {
    let runningFrom = provision.runningFrom? new Date(provision.runningFrom).getTime() : new Date(provision.created).getTime();
    
    let diffMinutes = Math.abs(new Date().getTime() - runningFrom)/1000/60;
    let minutesFromLastRunning = Math.floor(diffMinutes);
    return Math.floor(minutesFromLastRunning + timeRunning);
  }

};


const getPage = async ( model, filter, page, populates, select ) => {
  var sort = {};
  var modelAttributes = Object.keys(model.schema.tree);
  if ( modelAttributes.indexOf("created") !== -1) {
    sort = {created: -1};
  }

  try {
    var exec = model.find(filter, select).sort(sort).lean();
    var totalDocs = await model.countDocuments(filter);
    
    var isPage = false;
    if ( page && page.page > 0 && page.size !== undefined ) {
      var skip = 0;
      skip = (page.page - 1) * page.size;
      exec = exec.skip(skip);
      exec = exec.limit(page.size);
      isPage = true;
    }
    
    if ( populates ) {
      populates = JSON.parse(populates);
      populates.forEach(p=> {
        exec = exec.populate(p);
      });
    } else {
      if ( model === Session ) {
        exec = exec.populate({ path: 'user'}).populate({ path: 'details'});
      }
    }
    
    const entity = await exec;

    var out = {
      total: totalDocs, 
      count: entity.length,
      results: entity
    }
    if ( isPage && (page.page * page.size < totalDocs)) {
      out.next = {
        page: page.page + 1,
        size: page.size
      };
    }
    
    return out;

  } catch (err) {
    throw boom.boomify(err)
  }

};

const get = async (model, filter, select, skip, limit, populates, reply) => {
  var sort = {};
  var modelAttributes = Object.keys(model.schema.tree);

  
  if ( modelAttributes.indexOf("created") !== -1) {
    sort.created = -1;
  }
  try {
    var exec = model.find(filter, select).sort(sort).lean();
    var totalDocs = await model.countDocuments(filter);
    
    skip = skip? parseInt(skip) : 0;
    exec = exec.skip(skip);
    
    if ( limit ) {
      limit = parseInt(limit);
      exec = exec.limit(limit);
    }
    
    if ( populates ) {
      populates = JSON.parse(populates);
      populates.forEach(p=> {
        exec = exec.populate(p);
      });
    } else {
      if ( model === Session ) {
        exec = exec.populate({ path: 'user'}).populate({ path: 'details'});
      }

    }
    
    const entity = await exec;
    var out = {
      total: totalDocs, 
      count: entity.length,
      results: entity
    }
    if ( limit && (skip + limit) < totalDocs) {
      out.nextSkip = skip+limit;
      out.nextLimit = limit;
    }
    return out;

  } catch (err) {
    throw boom.boomify(err)
  }
}

const getById = async (model, id, reply) => {
  try {
    var exec = model.findById(id);
    if ( model === Session ) {
      exec = exec.populate({ path: 'user'}).populate({ path: 'details'});
    }
    
    const entity = await exec;
    return entity;
  } catch (err) {
    throw boom.boomify(err);
  }
};

const getOne = async (model, filter, reply) => {
  try {
    var exec = model.findOne(filter);
    if ( model === Session ) {
      exec = exec.populate({ path: 'user'}).populate({ path: 'details'});
    }
    const entity = await exec;
    return entity;
  } catch (err) {
    throw boom.boomify(err);
  }
};

const add = async (model, data, reply) => {
  try {
    const entity = new model(data)
    return entity.save();
  } catch (err) {
    throw boom.boomify(err);
  }
};

const update = async (model, id, body, reply) => {
  try {
    const { ...updateData } = body;
    updateData.updated = new Date();
    //console.log("UPDATE", id, updateData);
    var exec =  model.findByIdAndUpdate(id, updateData, { new: true });
    if ( model === Session ) {
      exec = exec.populate({ path: 'user'}).populate({ path: 'details'});
    }
    const update = await exec;
    return update;
  } catch (err) {
    throw boom.boomify(err)
  }
};

const updateMany = async (model, filter, body, reply) => {
  try {
    const { ...updateData } = body;
    
    updateData.updated = new Date();
    
    var exec =  model.updateMany(filter, updateData);
    
    if ( model === Session ) {
      exec = exec.populate({ path: 'user'}).populate({ path: 'details'});
    }

    return await exec;

  } catch (err) {
    throw boom.boomify(err)
  }
};

const del = async (model, id, reply) => {
  try {
    return await model.findByIdAndRemove(id);
  } catch (err) {
    throw boom.boomify(err)
  }
}

const delMany = async(model, filter, reply) => {
  try {
    return await model.deleteMany(filter);
  } catch (err) {
    throw boom.boomify(err)
  }
}

const count = async (model, filter, reply) => {
  try {
    var totalDocs = await model.countDocuments(filter);
    return totalDocs;
  } catch (err) {
    throw boom.boomify(err)
  }
}

function _m(model) {
  return {
    get: async (filter, select, skip, limit, populates, reply) => {
      return get(model, filter, select, skip, limit, populates, reply);
    },
    getPage: async (filter, page, populates, select, reply) => {
      return getPage(model, filter, page, populates, select, reply);
    },
    getById: async (id, reply) => {
      return getById(model, id, reply);
    },
    getOne: async (filter, reply)=>  {
      return getOne(model, filter, reply);
    },
    add: async (data, reply) => {
      return add(model, data, reply);
    },
    update: async (id, data, reply) => {
      return update(model, id, data, reply);
    },
    updateMany: async(filter, data, reply) => {
      return updateMany(model, filter, data, reply);
    },
    del: async (id, reply) => {
      return del(model, id, reply);
    },
    count: async (filter, reply) => {
      return count(model, filter, reply);
    },
    delMany: async(filter, reply) => {
      return delMany(model, filter, reply);
    }
  }
}


module.exports = {
  session: _m(Session),
  sessionDetails: _m(SessionDetails),
  user: _m(User),
  utils: {
    getNewTimeRunning: getNewTimeRunning,
    getNewCountExtend: getNewCountExtend
  },
  mongoose: mongoose,
  models: {
    User: User,
    Session: Session,
    SessionDetails: SessionDetails
  }
};




