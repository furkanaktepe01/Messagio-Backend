import express from "express";
import mongoose from "mongoose";
import messagesCollection from "./messageModel.js";
import usersCollection from "./userModel.js";
import channelsCollection from "./channelModel.js";
import Pusher from "pusher";
import cors from "cors";


// App Config

const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1313195",
    key: "3e88269f715be8f452f3",
    secret: "7342e43056c992aa35a7",
    cluster: "eu",
    useTLS: true
});


// Middlewares

app.use(express.json());
app.use(cors());


// DB Config

const connection_url = "mongodb+srv://admin:PAuyrga1cAlqxbXq@messajio.lyg5e.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.once("open", () => {
    console.log("DB is connected");
    
    const messagesCollection = db.collection("messages");
    const changeStream = messagesCollection.watch();

    changeStream.on("change", (change) => {
        console.log("A change has occured.",change);

        if (change.operationType === "insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("messages", "inserted", {
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received: messageDetails.received
            })
        } else {
            console.log("Error triggering Pusher");
        }

    })

});


// Api Routes

app.get("/", (req, res) => {
    res.status(200).send("Server's Response");
});

app.post("/channels/new", async (req, res) => {
    
    const newChannel = req.body;

    if(newChannel.user_1 !== "0") {
        
        channelsCollection.create(newChannel, (err, data) => {
            if (err) {
                res.status(500).send(err);
            } else {console.log(data);
                res.send(data)   
            }
        })

    } else {
        res.send("0");  
    }
    
});


app.post("/signIn", async (req, res) => {
    
    const { googleId } = req.body;

    const existentUser = await usersCollection.find({googleId: googleId}).count();

    if (!existentUser) {
        
        const newUser = req.body;

        usersCollection.create(newUser, (err, data) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(201).send(data);
            }
        })
    }

})

app.patch("/signOut", (req, res) => {
    console.log(req.body);
})

app.get("/email-to-user/:email", async (req, res) => {
    const { email } = req.params;
    const user = await usersCollection.findOne({email: email});
    if(user) {
        res.send(user); 
    } else {
        res.send("0");
    }
})

app.get("/channels/:id", (req, res) => {

    const {id} = req.params; 

    messagesCollection.find({channelId: id}, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    })
});

app.get("/channels/initial_fetch/:email", async (req,res) => {

    const {email} = req.params; 

    const user =  await usersCollection.findOne({email: email}); 

    const channelsList = await channelsCollection.find({ $or:[ {"user_0.email": email}, {"user_1.email": email} ]}); 
    console.log(channelsList);

    res.send(channelsList);

})

app.post("/messages/new", (req, res) => {

    const dbMessage = req.body;

    messagesCollection.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    });

});


// Listen

app.listen(port, () => {
    console.log(`Listening the port: ${port}`)
})
