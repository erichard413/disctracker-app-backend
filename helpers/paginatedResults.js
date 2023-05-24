function paginatedResults(data, page=null, limit=null) {
    if (!page || !limit) return {results : data};
        const startIdx = (page-1) * limit;
        const endIdx = page * limit;
  
        const results = {}

        if (endIdx < data.length) {
            results.next = {
                page: page + 1,
                limit: limit
            }
        }
        if (startIdx > 0) {
            results.previous = {
                page: page -1,
                limit: limit
            }
        }
        results.endPage = Math.ceil(data.length/limit);
        results.results = data.slice(startIdx, endIdx);
    return results;
}

module.exports = {paginatedResults};