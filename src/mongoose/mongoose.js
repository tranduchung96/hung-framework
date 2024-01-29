import pkg from 'lodash';
const {isUndefined} = pkg;
import debug from 'debug';
const log = debug('hung:MongooseHelper');
class MongooseHelper{
    constructor(_Document){
        this.Document = _Document;
        this.Aggregate = [];
        this.Paginate = false
        this.pageSize = 10
        this.page = 1
        this.pages = 0
    }
    
    /**
     * Where
     * @param query
     * @returns {MongooseHelper}
     */
    where(query){
        if(query == undefined || Object.keys(query).length == 0){
            query = {$match: {}}
        }
        this.Aggregate.push(query)
        return this;
    }
    
    /**
     * Group
     * @param field
     * @param group
     * @returns {MongooseHelper}
     */
    group(field, group){
        let query = {$group: {}}
        query.$group[field] = group
        this.Aggregate.push(query)
        return this;
    }

    /**
     * Project
     * @param field
     * @returns {MongooseHelper}
     */
    project(field){
        let query = {$project: {}}
        for(let key in field){
            query.$project[key] = field[key]
        }
        this.Aggregate.push(query)
        return this;
    }
    
    /**
     * Lookup
     * @param from
     * @param localField
     * @param foreignField
     * @param as
     * @param preserveNullAndEmptyArrays
     * @returns {MongooseHelper}
     */
    lookup(from, localField, foreignField, as, preserveNullAndEmptyArrays){
        let query = {$lookup: {}}
        query.$lookup.from = from;
        query.$lookup.localField = localField;
        query.$lookup.foreignField = foreignField;
        query.$lookup.as = as;
        if(!isUndefined(preserveNullAndEmptyArrays) && typeof preserveNullAndEmptyArrays == "boolean"){
            query.$lookup.preserveNullAndEmptyArrays = preserveNullAndEmptyArrays;
        }
        this.Aggregate.push(query)
        return this;
    }
    
    /**
     * Unwind
     * @param field
     * @returns {MongooseHelper}
     */
    unwind(field, preserveNullAndEmptyArrays){
        let query = {
            $unwind: {
                path: field
            },
        }
        if(!isUndefined(preserveNullAndEmptyArrays) && typeof preserveNullAndEmptyArrays == "boolean"){
            query.$unwind.preserveNullAndEmptyArrays = preserveNullAndEmptyArrays;
        }else{
            query.$unwind.preserveNullAndEmptyArrays = true;
        }
        this.Aggregate.push(query)
        return this;
    }
    
    replaceRoot(field){
        let query = {
            $replaceRoot: {
                newRoot: field
            }
        }
        this.Aggregate.push(query)
        return this;
    }
    
    /**
     * graphLookup
     */
    graphLookup(from, startWith, connectFromField, connectToField, as, maxDepth, depthField, restrictSearchWithMatch){
        let query = {$graphLookup: {}}
        query.$graphLookup.from = from
        query.$graphLookup.startWith = startWith
        query.$graphLookup.connectFromField = connectFromField
        query.$graphLookup.connectToField = connectToField
        query.$graphLookup.as = as
        this.Aggregate.push(query)
        return this;
    }
    
    /**
     * populate
     */
    populate(field, select){
        let query = {$populate: {}}
        query.$populate.path = field
        query.$populate.select = select
        this.Aggregate.push(query)
        return this;
    }
    
    /**
     * Out
     * @param field
     * @returns {MongooseHelper}
     */
    out(field){
        let query = {$out: field}
        this.Aggregate.push(query)
        return this;
    }
    
    /**
     * Count
     * @param field
     * @returns {MongooseHelper}
     */
    count(field){
        let query = {$count: field}
        this.Aggregate.push(query)
        return this;
    }
    
    /**
     * Match
     * @param field
     * @param match
     * @returns {MongooseHelper}
     */
    match(field, match){
        let query = {$match: {}}
        query.$match[field] = match
        this.Aggregate.push(query)
        return this;
    }
    
    set(field, value){
        let query = {$set: {}}
        query.$set[field] = value
        this.Aggregate.push(query)
        return this;
    }
    
    /**
     * Unset
     * @param field
     * @returns {MongooseHelper}
     */
    unset(field){
        let query = {$unset: field}
        this.Aggregate.push(query)
        return this;
    }
    
    /**
     * Sort
     * @param object
     */
    sort(object){
        let query = {$sort: object}
        this.Aggregate.push(query)
        return this;
    }
    
    /**
     * Limit
     * @param limit
     * @returns {MongooseHelper}
     */
    limit(limit){
        let query = {$limit: limit}
        this.Aggregate.push(query)
        return this;
    }
    
    /**
     * Skip
     * @param skip
     * @returns {MongooseHelper}
     */
    skip(skip){
        let query = {$skip: skip}
        this.Aggregate.push(query)
        return this;
    }
    
    /**
     * Paging
     * @param page
     * @param pageSize
     * @returns {MongooseHelper}
     */
    paging(page, pageSize){
        if(typeof (pageSize) == 'string' && pageSize == "all" || pageSize == "All"){
            this.Paginate = false;
            return this;
        }else{
            this.Paginate = true;
        }
        
        if(page == undefined || page == 0){
            page = 1;
        }
        
        if(pageSize == undefined || pageSize == 0){
            pageSize = 25;
        }
        
        if(typeof page != 'number' || typeof pageSize != 'number'){
            page = parseInt(page);
        }
        
        if(typeof pageSize != 'number'){
            page = parseInt(page);
        }
        
        if(page < 1){
            page = 1;
        }
        
        if(pageSize < 1){
            pageSize = 25;
        }
        
        this.pageSize = pageSize;
        this.page = page;
        this.Aggregate.push({$skip: pageSize * (page - 1)})
        this.Aggregate.push({$limit: parseInt(pageSize)})
        return this;
    }
    
    async exec(){
        let items = await this.Document.aggregate(this.Aggregate);
        if(this.Paginate){
            this.Aggregate = this.Aggregate.filter(function(el){
                return el.$limit == undefined && el.$skip == undefined;
            });
            let queryCount = {};
            this.Aggregate.forEach(function(el){
                if(el.$match != undefined){
                    queryCount = el.$match;
                }
            });
            let rows = await this.Document.countDocuments(queryCount);
            let result = {
                meta: {
                    rows: rows,
                    pages: Math.ceil(rows / this.pageSize),
                    pageSize: parseInt(this.pageSize),
                    pageCurrent: this.page
                },
                items: items,
            };
            return result;
        }
        return items;
    }
}

hung.MongooseHelper = MongooseHelper;
export default MongooseHelper;