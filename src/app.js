import express from "express";
import os from "os"
import cluster from "cluster";
import minimist from "minimist";

const app = express();
const PORT = process.env.PORT || 8080;
const CPUs = os.cpus().length
const args = minimist(process.argv.slice(2),{alias:{m:"mode"},default:{m:"FORK"}})

console.log(args)

app.get("/",(req,res)=>{
    res.send("Petición atendida por el PID "+process.pid)
})

app.get("/api/randoms",(req,res)=>{
const numberGenerator = () =>{
    return Math.floor(Math.random() * (1000 - 1 + 1) + 1)
} 
const resultados = Array.from({length: 100000},()=>numberGenerator())
let found = {}
for (let i = 0; i < resultados.length; i++) {
    let keys = resultados[i].toString()
    found[keys] = ++found[resultados[i]] || 1
}
res.send({result:found,pid:process.pid})
})

app.get("/info",(req,res)=>{
    res.send({processors:CPUs})
})


if(args.mode === "FORK"){
    app.listen(PORT, () => console.log("Listening on "+PORT));
}else if (args.mode ==="CLUSTER"){
    if (cluster.isPrimary) {
        console.log("Proceso primario con pid: " + process.pid);
        for (let i = 0; i < CPUs; i++) {
            cluster.fork();
        }
        cluster.on('exit', (worker) => {
            console.log("Proceso finalizado, pid: "+worker.process.pid)
            cluster.fork();
        })
    } else {
        console.log("Proceso worker con pid "+process.pid)
        const server = app.listen(PORT, () => console.log("Listening on "+PORT));
    }
}