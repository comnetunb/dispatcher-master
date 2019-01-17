module.exports = {
  getSortFilter: (query) => {
    const field = query.split('|')[0] || null;
    const criteria = query.split('|')[1] || null;

    const filter = {};

    if (field && criteria) {
      filter[field] = criteria;
    }

    return filter;
  },
  computeTablefication: (data, page, perPage /* , filter */) => {
    const filteredData = data;

    const lastPage = Math.ceil(filteredData.length / perPage);
    const currentPage = (page > lastPage) ? lastPage : page;
    const from = ((currentPage - 1) * perPage) + 1;
    const to = ((from + perPage) - 1 > filteredData.length)
      ? filteredData.length
      : (from + perPage) - 1;

    return {
      total: filteredData.length,
      per_page: perPage,
      current_page: currentPage,
      last_page: lastPage,
      from,
      to,
      data: filteredData.slice(from - 1, to)
    };
  }
};
