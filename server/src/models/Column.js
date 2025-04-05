const crypto = require('crypto');

class Column {
    constructor(columnName,columnAsg, color, creator){
        this.columnTitle = columnName;
        this.column= columnAsg[0] + creator[0] + crypto.randomBytes(3).toString('hex');
        this.color = color;
        this.creator = creator;
    }

    // Do later, generic asynchronous getters and setters
}


module.exports = Column;