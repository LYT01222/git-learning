function getMessage()
{
    fetch("http://localhost:3001/api/messages")
        .then(response=>{
            if(!response.ok) throw new Error("HTTP请求失败");
            return response.json();
        })
        .then(data => {
            const messages = document.querySelector("#messages");
            messages.textContent = "";
            data.forEach(item => {
                const p = document.createElement("p");
                p.textContent = item.name + "：" + item.message;
                messages.appendChild(p);
            });
        })
        .catch(error => {
            console.log(error);
        });
}
let form=document.querySelector("form");
let btn=document.querySelector("button");
getMessage();
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
        getMessage();
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