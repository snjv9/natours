class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        //Build a Query
        const queryObject = { ...this.queryString };

        //1A.[Basic Filtering]
        //{'difficuly':'easy','duration':5}
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => { delete queryObject[el] });

        //1B. Advanced Filtering
        //{'difficuly':'easy','duration':{gte:5}}
        let queryStr = JSON.stringify(queryObject);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => {
            return `$${match}`
        })

        this.query = this.query.find(JSON.parse(queryStr));
        //const query = await Tour.find().where('difficulty').equals('easy').where('duration').equals(5)
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }
        else {
            //query = query.sort('-createdAt');
        }
        return this;
    }
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v') //exluding from display
        }
        return this;
    }
    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}
module.exports = APIFeatures; 