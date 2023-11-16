import  express  from "express";
const app = express();

app.get('/', (req, res)=>{
    res.send('server is ready');
});
//list of jokes 
app.get('/api/jokes', (req, res)=>{
    const jokes = [
        {
            id:1,
            title:'A',
            content:'1'
        },
        {
            id:2,
            title:'B',
            content:'2'
        },
        {
            id:3,
            title:'C',
            content:'3'
        }
    ]
    res.send(jokes);
})

const port = process.env.port || 4000;

app.listen(port, ()=>{
    console.log(`serve at http://localhost:${port}`)
})