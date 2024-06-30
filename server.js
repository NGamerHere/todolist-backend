const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose=require('mongoose');

const app = express();
app.use(bodyParser.json()); // Add this line to parse JSON requests
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/todolist').then(()=>{
   console.log('connected to database');
}).catch((e)=>{
   console.error('error in connecting the db :'+e );
})

const userdataSchema=new mongoose.Schema({
   username:String,
   name:String,
   password:String,
})

const taskSchema=new mongoose.Schema({
   userid:mongoose.Schema.ObjectId,
   taskName:String,
   taskDescription:String
})
const userdata=mongoose.model('userdata',userdataSchema);
const task=mongoose.model('task',taskSchema);


app.get('/', (req, res) => {
   res.json({
      name: 'well hi',
      greeting: 'name is the of the man'
   });
});

app.post('/addtask',async (req,res)=>{
   const {id,taskName,taskDescription}=req.body;
   const newTask=await new task({
      userid:id,
      taskName:taskName,
      taskDescription:taskDescription
   });
   await newTask.save().then(()=>{
      console.log('saved the new task');
      res.status(200).json({message:'done'})
   }).catch((e)=>{
      console.log(e);
      res.status(500).json({message:'internal server error'})
   })
})


app.get('/getTask', async (req, res) => {
   try {
      const id = req.query.id;
      if (!id) {
         return res.status(400).send('Missing id parameter');
      }
      const tasks = await task.find({userid: id});
      res.send(tasks);
   } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).send('An error occurred while fetching tasks');
   }
});


app.post('/signup',async (req,res)=>{
   const {username,password,name}=req.body;
   if(!username || !password){
      return res.status(400).json({message:"usernameAndPasswordWasMissing"})
   }
   const newds=new userdata({
      username:username,
      name:name,
      password:password
   });
   await newds.save().then(()=>{
      console.log('saved in the new data')
      res.status(200).json({message:'done'})
   }).catch((e)=>{
      console.log('error in saving the data:'+e);
      res.status(500).json({message:'error'})
   })
});

app.post('/signin', async (req, res) => {
   const { username, password } = req.body;
   if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
   }

   try {
      const user = await userdata.findOne({username: username});
      if (!user) {
         return res.status(404).json({ message: 'usernameNotFound' });
      }

      if (user.password !== password) {
         return res.status(401).json({ message: 'passwordWrong' });
      }

      res.json({ message: 'done', id: user['_id'] ,name:user['name']});
   } catch (error) {
      console.error('Error during signin:', error);
      res.status(500).json({ message: 'Internal server error' });
   }
});

app.listen(4000, () => {
   console.log('The server was started on port 4000');
});