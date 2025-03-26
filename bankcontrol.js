const mysql=require("mysql");

const con=mysql.createPool({
    connectionlimit: 10,
    host           : process.env.DB_HOST,
    user           : process.env.DB_USER,
    password       : process.env.DB_PASS,
    database       : process.env.DB_NAME
});

exports.view=(req,res)=>{

    con.getConnection((err,connection)=>{
        if(err) throw err
        connection.query("select * from users",(err,rows)=>{
            connection.release();
            if(!err){
                console.log("Done");
                res.render("home");
            }else{
                console.log("Error in Listing Data"+err);
            }
        })
        //console.log("Connection Success:");
    });
    //res.render("home");
};

exports.view_transaction=(req,res)=>{

    con.getConnection((err,connection)=>{
        if(err) throw err
        connection.query("select * from users",(err,rows)=>{
            connection.release();
            if(!err){
                console.log("Done");
                res.render("register");
            }else{
                console.log("Error in Listing Data"+err);
            }
        })
        
    });
    
};
