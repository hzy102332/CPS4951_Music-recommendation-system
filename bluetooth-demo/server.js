// function dbcon(){
	var mysql  = require('mysql');
	var connection = mysql.createConnection({
		host     : 'sh-cynosdbmysql-grp-eeizn9m8.sql.tencentcdb.com',
		user     : 'root',
		password : 'cps4951!',
		port	 : '29917',
		database : 'cps4951'
	});
	connection.connect();
	
	
	var  sql = 'SELECT * FROM heart_beat';
	connection.query(sql,function (err, results) {
		if(err){
			console.log('erro')
			console.log('[SELECT ERROR] - ',err.message);
			return;
		}

		if(results)
		{
			console.log(results)

		}
		 console.log('The solution is:', results);
	});
	connection.end();
// }
