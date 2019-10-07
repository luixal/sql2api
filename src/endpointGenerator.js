const SQL_IDENTIFIER_REGEXP = new RegExp('^[a-zA-Z_][a-zA-Z0-9_]*$');

const isValidIdentifier = function(identifier) {
  return identifier && SQL_IDENTIFIER_REGEXP.test(identifier);
}

const QueryBuilder = {
  selectBuilder: function(table, query) {
    // paginated:
    if (query.page) {
      // check pagination params:
      let page = 0;
      let perPage = 10;
      let orderBy = 'id';
      let order = 'asc';
      let whereFilter = [];
      //let compareUsingLike = false;

      Object.keys(query).map(
        (key) => {
          if (key.toLowerCase() === 'page') page = query[key];
          else if (key.toLowerCase() === 'perpage') perPage = query[key];
          else if (key.toLowerCase() === 'orderby') orderBy = query[key];
          else if (key.toLowerCase() === 'order') order = query[key];
          //else if (key.toLowerCase() === 'compareusinglike') compareUsingLike = query[key];
          else whereFilter.push({field: key, value: query[key]})
        }
      )

      // where clause builder:
      generateWhereSubQuery = function(whereFilter) {
        if (whereFilter) return `${whereFilter.field} = '${whereFilter.value}'`;
      }

      // build where statement:
      let whereStatement;
      if (whereFilter.length) whereStatement = whereFilter.map( filter => generateWhereSubQuery(filter) ).join(' AND ');
      whereStatement += ' AND (FEC_ALTA_EMPLEADO <= GETDATE() OR FEC_BAJA <= GETDATE())';
      // build SQL query:
      let sqlQuery = `select * from ${table} ${whereStatement ? `where ${whereStatement}` : ''} order by ${orderBy} ${order} offset ${page * perPage} rows fetch next ${perPage} rows only`;
      return sqlQuery;
    } else {
      // default limited:
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
