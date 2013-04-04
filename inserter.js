var Inserter = function (push) {
    this.push = push;
    this.data = [];
    this.maxThreads = 6;
    this.currentThreads = 0;
    this.batchSize = 5000;
    this.queue = 0;
    this.inserted = 0;
    this.startTime = Date.now();
};

Inserter.prototype.add = function(data) {
    this.data.push(data);
};

// Use force=true for last insert
Inserter.prototype.insert = function(force) {
    var that = this;
    if (this.data.length >= this.batchSize || force) {
        if (this.currentThreads >= this.maxThreads) {
            this.queue++;
            return;
        }
        this.currentThreads++;
        console.log('Threads: ' + this.currentThreads);
        this.push(this.data.splice(0, this.batchSize), function() {
            that.inserted += that.batchSize;
            var currentTime = Date.now();
            var workTime = Math.round((currentTime - that.startTime) / 1000)
            console.log('Speed: ' + that.inserted / workTime + ' per sec');
            that.currentThreads--;
            if (that.queue > 0) {
                that.queue--;
                that.insert();
            }
        });
    }
};