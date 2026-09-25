let form=document.querySelector("#name-form");
let btn=form.querySelector("button");
form.addEventListener("submit",function(event){
    event.preventDefault();
    btn.disabled=true;
    btn.textContent="提交中……";
    let name=document.querySelector("#name").value.trim();
    let message = document.querySelector("#message").value.trim();
    if(name==="")
    {
        document.querySelector("#name-result").textContent="请输入你的名字";
        btn.disabled = false;
        btn.textContent = "提交";
        return;
    }
    const data={
        name: name,
        message: message
    };
    fetch("http://localhost:3001/api/name", {
        method: "POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response =>{
        if(!response.ok)
        {
            return response.json().then(data=>{
                throw new Error(data.message);
            })
        }
        return response.json();
    })
    .then(data => {
        document.querySelector("#name-result").textContent=data.message;
    })
    .catch(error => {
        document.querySelector("#name-result").textContent=error.message;
        console.log(error);
    })
    .finally(() => {
        btn.disabled = false;
        btn.textContent = "提交";
    });
})
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const chatBox = document.querySelector("#chat-box");
let chatHistory = [];
chatForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const message = chatInput.value.trim();
    if (message === "") {
        return;
    }
    const userMessage = document.createElement("p");
    userMessage.textContent = "你：" + message;
    chatBox.appendChild(userMessage);
    chatHistory.push({
        role: "user",
        content: message
    });
    chatInput.value = "";
    const recentHistory = chatHistory.slice(-10);
    fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: recentHistory
        })
    })
    .then(async response => {
        if (!response.ok) {
            const errorText = await response.text();
            console.log("AI 请求失败，状态码：", response.status);
            console.log("AI 返回内容：", errorText);
            throw new Error("AI 请求失败");
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const aiMessage = document.createElement("div");
        aiMessage.textContent = "AI：";
        chatBox.appendChild(aiMessage);
        let aiText = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const text = decoder.decode(value, {
                stream: true
            });
            aiText += text;
            aiMessage.textContent = "AI：" + aiText;
        }
        const html = marked.parse(aiText);
        const safeHtml = DOMPurify.sanitize(html);
        aiMessage.innerHTML = "AI：" + safeHtml;
        renderMathInElement(aiMessage, {
            delimiters: [
                {
                    left: "$$",
                    right: "$$",
                    display: true
                },
                {
                    left: "$",
                    right: "$",
                    display: false
                }
            ]
        });
        chatHistory.push({
            role: "assistant",
            content: aiText
        });
    })
    .catch(error => {
        console.log(error);
        const errorMessage = document.createElement("p");
        errorMessage.textContent = "AI 请求失败，请稍后再试。";
        chatBox.appendChild(errorMessage);
    });
});