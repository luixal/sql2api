const SQL_IDENTIFIER_REGEXP = new RegExp('^[a-zA-Z_][a-zA-Z0-9_]*$');

const isValidIdentifier = function(identifier) {
  return identifier && SQL_IDENTIFIER_REGEXP.test(identifier);
}

const QueryBuilder = {
  selectBuilder: function(table, query) {
    // paginated:
    if (query.page) {
      // check pagination params:
      let page = parseInt(query.page) || 0;
      let perPage = parseInt(query.perPage) || 10;
      let orderBy = isValidIdentifier(query.orderBy) ? query.orderBy : 'id';
      let order = isValidIdentifier(query.order) ? query.order : 'asc';
      // return paginated query:
      return `select * from ${table} order by ${orderBy} ${order} offset ${page * perPage} rows fetch next ${perPage} rows only`;
    } else {
      // non-paginated:
      return `select top 100 * from ${table}`;
    }
  }
}

const generateEndpoints = function(app, table, executeQuery, path='/api/') {

  if (!isValidIdentifier(table)) {
    console.log(`ERROR! Invalid table name: ${table}`);
    return;
  }

  app.get(
    `${path}${table}`,
    function(req , res){
      executeQuery(
        QueryBuilder.selectBuilder(table, req.query),
        (err, result) => {
          if (err) {
            console.log(`Error: ${err}`);
            res.send(err);
          } else {
            res.send(result.recordset)
          }
        }
      );
    }
  );

  // app.put(
  //   `${path}${table}`,
  //   function(req , res) {
  //     let _keys = Object.keys(req.body);
  //     let query = `insert into ${table} (${_keys.join(',')}) values (${_keys.map(key => req.body[key]).join(',')})`;
  //     console.log(query);
  //     executeQuery(res, query);
  //   }
  // );
  //
  // app.post(
  //   `${path}${table}`,
  //   function(req , res) {
  //     let _keys = Object.keys(req.body);
  //     let query = `insert into ${table} (${_keys.join(',')}) values (${_keys.map(key => req.body[key]).join(',')})`;
  //     console.log(query);
  //     executeQuery(res, query);
  //   }
  // );
  //
  // app.delete(
  //   `${path}${table}/:id`,
  //   function(req , res){
  //     executeQuery(res, `delete from ${table} where id=${req.params.id}`);
  //   }
  // );
}

exports.generateEndpoints = generateEndpoints;
