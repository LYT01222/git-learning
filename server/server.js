const http = require("http");
const Database = require("better-sqlite3");
const db = new Database("./server/data.db");
db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        message TEXT
    )
`);
const insertMessage = db.prepare(`
    INSERT INTO messages (name,message)
    VALUES (?,?)
`);
const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:3000");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        res.end();
        return;
    }
    if (req.url === "/api/name" && req.method === "POST") {
        let body="";
        req.on("data",chunk=>{
            body+=chunk;
        });
        req.on("end",()=>{
            console.log(body);
            let data;
            try{
                data = JSON.parse(body);
            }
            catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({
                    message: "请求数据不是合法的 JSON"
                }));
                return;
            }
            if(typeof data.name !=="string" || typeof data.message!=="string"){
                res.statusCode=400;
                res.end(JSON.stringify({
                    message:"名字和留言必须是字符串"
                }));
                return;
            }
            data.name=data.name.trim();
            data.message=data.message.trim();
            if(data.name==="" || data.message==="")
            {
                res.statusCode=400;
                res.end(JSON.stringify({
                    message:"名字和留言不能为空"
                }));
                return;
            }
            if(data.name.length>20 || data.message.length>500)
            {
                res.statusCode=400;
                res.end(JSON.stringify({
                    message:"名字或留言太长"
                }));
                return;
            }//后端输入验证
            insertMessage.run(data.name,data.message);
            res.end(JSON.stringify({
                message: "你好，"+data.name+"!"
            }));
        });
        return;
    }
    if (req.url === "/api/messages" && req.method === "GET") {
        const rows = db.prepare(`
            SELECT * FROM messages
        `).all();
        res.end(JSON.stringify(rows));
        return;
    }
    res.statusCode = 404;
    res.end(JSON.stringify({
        message: "Not Found"
    }));
});
server.listen(3001, () => {
    console.log("Server running at http://localhost:3001");
});