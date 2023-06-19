const app = require("./app");
const http = require("http").Server(app);
const { promisify } = require("util");
const io = require("socket.io")(http);
const User = require("./model/userModel");
const jwt = require("jsonwebtoken");
const catchAsync = require("./util/catchAsync");
const dotenv = require(`dotenv`);
const mongoose = require("mongoose");

dotenv.config({ path: `${__dirname}/config.env` });
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB connection SucessFull 😎");
  });

io.on("connection", async (socket) => {
  console.log("A user connected " + socket.id);

  socket.on(
    "jwt",
    catchAsync(async (token) => {
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );
      await User.findOneAndUpdate(
        { _id: decoded.id }, // Search criteria
        { SocketId: socket.id, online: true }, // Update data
        { new: true } // Options: Return the updated document
      );
      const userdata = await User.findOne({ SocketId: `${socket.id}` });
      const room = userdata.Room;
      socket.join(room);
      socket.emit("curruser", userdata);
      socket.emit("roomid", room);
    })
  );

  // Listen for chat messages
  socket.on(
    "chat message",
    catchAsync(async (message, room) => {
      // const userdata = await User.findOne({ SocketId: `${socket.id}` });
      // const room = userdata.Room;
      console.log(message);
      console.log(room);
      console.log(getRoomClientCount(room));
      socket.to(room).emit("chat message", { message, senderId: socket.id });
    })
  );

  function getRoomClientCount(roomName) {
    const room = io.sockets.adapter.rooms.get(roomName);
    if (room) {
      return room.size;
    }
    return 0;
  }
  function getRandomClientId(roomName) {
    const room = io.sockets.adapter.rooms.get(roomName);
    if (room) {
      const socketIds = Array.from(room);

      // Choose a random socket ID
      const randomSocketId =
        socketIds[Math.floor(Math.random() * socketIds.length)];

      return randomSocketId;
    }
    return null; // Room doesn't exist or has no clients
  }
  socket.on(
    "join",
    catchAsync(async () => {
      const roomName = User.findOne({ SocketId: socket.id }).Room;
      if (getRoomClientCount(roomName) > 1) {
        socket.emit("FullRoom", "room is full");
      } else {
        socket.join(roomName);
        if (getRoomClientCount(roomName) === 2) {
          User.findByIdAndUpdate(roomName, { isWhite: true });
          socket.to(getRandomClientId(roomName)).emit("White");
        }
      }
    })
  );

  socket.on(
    "sendData",
    catchAsync(async (room, data) => {
      const userdata = await User.findOne({
        SocketId: `${socket.id}`,
      });
      socket.to(userdata.Room).emit("Board", data);
    })
  );

  socket.on(
    "online",
    catchAsync(async () => {
      // const user = await User.find({ SocketId: socket.id });
      const userdata = await User.findOne({ SocketId: `${socket.id}` });
      const user = userdata;
      const arr = user.friends;
      io.to(socket.id).emit("thisAreOnline", arr);
    })
  );

  socket.on(
    "search",
    catchAsync(async (data) => {
      // console.log("searching");
      if (data) {
        const users = await User.find({ name: `${data}` });
        // const userdata = await User.findOne({ SocketId: `${socket.id}` });
        // const users = await User.find({ friends: { $nin: [`${userdata.id}`] } });
        // console.log(users);
        io.to(socket.id).emit("AvailableUser", users);
      } else {
        const userdata = await User.findOne({ SocketId: `${socket.id}` });
        console.log(`132 userdata == ${userdata}`);
        console.log(`132 socket.id == ${socket.id}`);
        // const userdata = await User.findOne({ SocketId: `${socket.id}` });
        const users = await User.find({
          friends: { $nin: [`${userdata.id}`] },
        });
        // const users = await User.find();
        // console.log(users);
        // console.log(`users == ${users}`);
        io.to(socket.id).emit("AvailableUser", users);
      }
    })
  );

  socket.on(
    "Addfriend",
    catchAsync(async (data) => {
      // const currentuser = await User.findOne({ SocketId: `${socket.id}` });
      const userdata = await User.findOne({ SocketId: `${socket.id}` });
      const currentuser = userdata;
      const frienduser = await User.findOne({ _id: `${data}` });
      // let currarr = currentuser._id;
      // let friendarr = frienduser._id;
      // console.log(`currarr = ${currarr}`);
      // currarr = currarr.push(frienduser._id);
      // console.log(`currarr = ${friendarr}`);
      // friendarr = friendarr.push(currentuser._id);
      // currentuser.friends = currarr;
      // friendarr.friends = friendarr;
      await User.findOneAndUpdate(
        { _id: currentuser.id }, // Search criteria
        { $push: { friends: `${frienduser._id}` } }, // Update data
        { new: true } // Options: Return the updated document
      );
      await User.findOneAndUpdate(
        { _id: frienduser.id }, // Search criteria
        { $push: { friends: `${currentuser._id}` } }, // Update data
        { new: true } // Options: Return the updated document
      );
      // console.log(await User.find());
      io.to(socket.id).emit("call");
    })
  );

  socket.on(
    "findonline",
    catchAsync(async () => {
      // const data = await User.findOne({ SocketId: `${socket.id}` });
      const data = await User.findOne({ SocketId: `${socket.id}` });
      if (data) {
        const data2 = await User.find({
          friends: { $in: [`${data.id}`] },
          online: true,
        });
        io.to(socket.id).emit("onlineuser", data2);
      }
      // console.log(arrr);
    })
  );
  socket.on(
    "playrequest",
    catchAsync(async (data) => {
      // console.log("playreq recived");
      const userdata = await User.findOne({ SocketId: `${socket.id}` });
      const friend = await User.findById(data);
      socket
        .to(friend.SocketId)
        .emit("getingplayrequest", userdata.id, userdata.name);
    })
  );
  function generateRandomString(length) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  socket.on(
    "playaccepted",
    catchAsync(async (id) => {
      const friend = await User.findById(id);
      const userdata = await User.findOne({ SocketId: `${socket.id}` });
      const string = generateRandomString(8);
      await User.findByIdAndUpdate(id, { Room: string }, { new: true });
      await User.findByIdAndUpdate(
        userdata.id,
        { Room: string },
        { new: true }
      );

      socket.to(friend.SocketId).emit("playon");
    })
  );

  // Handle disconnection

  socket.on(
    "disconnect",
    catchAsync(async () => {
      // console.log(socket.id);
      changeonline(socket.id);
      console.log("A user disconnected");
    })
  );
});

changeonline = catchAsync(async (id) => {
  console.log(id);

  await User.findOneAndUpdate(
    { SocketId: id }, // Search criteria
    { online: false }, // Update data
    { new: true } // Options: Return the updated document
  );
});
// Start the server
const port = 7500;
http.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
