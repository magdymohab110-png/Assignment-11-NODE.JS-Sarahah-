
export const findOne = async({model , filter , options = {}}) =>{
    return await model.findOne(filter , options);
}

export const create = async({model,data,options = {}}) => {
    return await model.create([data] , options);
}

export const findById = async({model,id,options = {}})=>{
return await model.findById(id , options);  
}

export const findByIdAndUpdate = async({model , id , update , options = {}} = {}) =>{
return await model.findByIdAndUpdate(id , update , {runValidators : true , new : true , ...options});
}

export const findOneAndUpdate = async({model , filter , update , options ={}} = {}) =>{
    return await model.findOneAndUpdate(filter , update , {runValidators : true , new : true , ...options});
}

export const find = async({model , filter,options = {}} = {}) =>{
    const data = model.find(filter);
    if(options?.limit) data.limit(options?.limit);
    if(options?.skip) data.skip(options?.skip);
    if(options?.populate) data.populate(options?.populate);
    if(options?.sort) data.sort(options?.sort);

    return data.exec();
}

export const findOneAndDelete = async({model , filter , options = {}} = {}) =>{
    return await model.findOneAndDelete(filter, options);
}

export const deleteMany = async({model,filter , options = {}}={})=>{
    return model.deleteMany(filter,options);
}
