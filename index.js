const express = require('express');
var http = require('http');
const cors = require('cors');
//import db connection
const db = require('./db');
//import model
const MessageModel = require('./model/message');
const UserModel = require('./model/user');
//import routes
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 5000;
var server = http.createServer(app);

var io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});


app.use(express.json());
app.use(cors());

var clients = {};
app.use("/routes", routes);


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    console.log(socket.id, "has joined");
    socket.on('signin', (id) => {
        console.log('UserID: ' + id);
        clients[id] = socket;
        //genarate public and private key
        //emit messages recived when user is offline
        MessageModel.find({ targetId: id })
            .then(messages => {
                if (messages.length != 0) {
                    const targetIds = messages.map(obj => obj.targetId);
                    const sourseIds = messages.map(obj => obj.sourseId);
                    const message = messages.map(obj => obj.message);
                    const _id = messages.map(obj => obj._id);
                    var i = 0;
                    while (i < messages.length) {
                        var msg = { "sourseId": sourseIds[i], "targetId": targetIds[i], "message": message[i] };
                        clients[id].emit('message', msg);
                        console.log(msg);
                        //delete the message from the database after emit that message
                        MessageModel.findByIdAndDelete(_id[i]).then(() => {
                            console.log("message deleted");
                        }).catch(err => {
                            console.log(err);
                        });
                        i++;
                    }
                }
            })
            .catch(err => {
                console.log(err);
            });
    });

    //send message
    socket.on('message', (msg) => {
        console.log(msg);
        let targetId = msg.targetId;
        if (clients[targetId]) {
            clients[targetId].emit('message', msg);
        } else {
            //this has to check
            MessageModel.create({ sourseId: msg.sourseId, targetId: msg.targetId, message: msg.message });

            console.log("User is not online");
        }
    });

    socket.on('reqpub', (data) => {
        console.log(data);
        var toSend = data["user"];
        //find public key from the database
        UserModel.findOne({ userID: data["targetUser"] })
            .then(user => {
                if (user) {
                    console.log("public key found");
                    var pub = { "user": data["user"], "pub": user.PublicKey };
                    try {
                        clients[toSend].emit('respub', { "publicKey": pub });
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    console.log("public key not found");
                    try {
                        clients[toSend].emit('respub', { "publicKey": "Oops! public key not found" });
                    } catch (error) {
                        console.log(error);
                    }
                }
            })
            .catch(err => {
                console.log(err);
            });
    });


    //users send their public key to the server
    socket.on('pubKey', (data) => {
        console.log(data);
        savePubKey(data);
    });

    //saving public keys to the database only if the key is not in the database
    async function savePubKey(data) {
        const findPK = await UserModel.findOne({ userID: data["userID"] });
        if (findPK) {
            console.log("public key already exist");
            if (findPK.PublicKey != data["PublicKey"]) {
                console.log("but,public key changed. so trying to update it...");
                try {
                    findPK.PublicKey = data["PublicKey"];
                    const savePub = await findPK.save();
                    console.log("public key updated");
                }
                catch (error) {
                    console.log(error);
                }
            }
        } else {
            console.log("public key not exist, so trying to save it...");
            try {
                const savePub = UserModel.create({
                    userID: data.userID,
                    PublicKey: data.PublicKey,
                });
            }
            catch (error) {
                console.log(error);
            }
        }
    }

    //reciving requested public key
    socket.on('respub', (data) => {
        console.log("public key " + data["user"] + " : " + data["pub"]);
        //complete other part
    });
});


//crud operation

//wrtie data
app.post('/adddata', async (req, res) => {
    const { sourseId, targetId, message } = req.body;
    console.log(req.body);
    try {
        const newPost = await MessageModel.create({
            sourseId: sourseId,
            targetId: targetId,
            message: message
        });
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//read data
app.get('/getdata', async (req, res) => {
    try {
        const posts = await MessageModel.find();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//read spesific data
app.get('/getdata/:id', async (req, res) => {
    const { id } = req.params;
    MessageModel.find({ targetId: id })
        .then(messages => {
            console.log(messages);
            res.status(200).json(messages);
        })
        .catch(err => {
            console.log(err);
        });
});




server.listen(port, "0.0.0.0", () => {
    console.log(`Listening on port ${port}`);
});