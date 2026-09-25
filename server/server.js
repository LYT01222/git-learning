const path = require("path");
require("dotenv").config({
    path: path.join(__dirname, "../.env")
});
const http = require("http");
const Database = require("better-sqlite3");
const db = new Database(path.join(__dirname, "data.db"));
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
function getMessages() {
    const messages = db.prepare(`
        SELECT *
        FROM messages
        ORDER BY id DESC
        LIMIT 10
    `).all();
    return messages;
}
function executeTool(toolCall) {
    if (toolCall.name === "get_messages") {
        const messages = getMessages();
        return {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(messages)
        };
    }
    throw new Error(`未知工具：${toolCall.name}`);
}
const tools = [
    {
        type: "function",
        function: {
            name: "get_messages",
            description: "获取留言板中的留言",
            parameters: {
                type: "object",
                properties: {},
                additionalProperties: false
            }
        }
    }
];
async function callAI(messages, useTools = false) {
    const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
            },
            body: JSON.stringify({
                model: "openrouter/free",
                messages: messages,
                ...(useTools ? { tools: tools } : {}),
                stream: true
            })
        }
    );
    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
    }
    return response;
}
const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:3002");
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
    if (req.url === "/api/chat" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => {
            body += chunk;
        });
        req.on("end", async () => {
            let data;
            try {
                data = JSON.parse(body);
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({
                    message: "请求数据不是合法的 JSON"
                }));
                return;
            }
            if (!Array.isArray(data.messages) || data.messages.length === 0) {
                res.statusCode = 400;
                res.end(JSON.stringify({
                    message: "messages 不能为空"
                }));
                return;
            }
            try {
                const response = await callAI(data.messages,true);
                res.setHeader("Content-Type", "text/plain; charset=utf-8");
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let toolCall = null;
                let buffer = "";
                while (true) {
                    const { done, value } = await reader.read();
                    if(done) break;
                    buffer += decoder.decode(value, {
                        stream: true
                    });
                    const parts = buffer.split("\n\n");
                    buffer = parts.pop();
                    for (const part of parts) {
                        if (!part.startsWith("data: ")) continue;
                        const json = part.slice(6);
                        if (json === "[DONE]") continue;
                        const result = JSON.parse(json);
                        const delta = result.choices[0].delta;
                        if (delta.content) res.write(delta.content);
                        if (delta.tool_calls) {
                            const call = delta.tool_calls[0];
                            if (!toolCall) {
                                toolCall = {
                                    id: call.id,
                                    name: call.function.name,
                                    arguments: ""
                                };
                            }
                            toolCall.arguments += call.function.arguments || "";
                        }
                    }
                }
                if(!toolCall) {
                    res.end();
                    return;
                }
                const toolResult = executeTool(toolCall);
                const newMessages = [
                    ...data.messages,
                    {
                        role: "assistant",
                        tool_calls: [
                            {
                                id: toolCall.id,
                                type: "function",
                                function: {
                                    name: toolCall.name,
                                    arguments: toolCall.arguments
                                }
                            }
                        ]
                    },
                    toolResult
                ]
                const secondResponse = await callAI(newMessages, false);
                const reader2 = secondResponse.body.getReader();
                const decoder2 = new TextDecoder();
                let buffer2 = "";
                while (true) {
                    const { done, value } = await reader2.read();
                    if (done) {
                        break;
                    }
                    buffer2 += decoder2.decode(value, {
                        stream: true
                    });
                    const parts2 = buffer2.split("\n\n");
                    buffer2 = parts2.pop();
                    for (const part of parts2) {
                        if (!part.startsWith("data: ")) continue;
                        const json = part.slice(6);
                        if (json === "[DONE]") continue;
                        const result2 = JSON.parse(json);
                        const content2 = result2.choices[0].delta.content;
                        if (content2) res.write(content2);
                    }
                }
                res.end();
            } catch (error) {
                console.log(error);
                if (!res.writableEnded) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({
                        message: "服务器调用 AI 失败"
                    }));
                }
            }
        });
        return;
    }
    if (req.url === "/api/messages" && req.method === "GET") {
        const rows = db.prepare(`
            SELECT *
            FROM messages
            ORDER BY id DESC
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