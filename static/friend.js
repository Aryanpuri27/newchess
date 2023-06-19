const socket = io();

function getJWTFromCookie(cookieName) {
  const cookieValue = document.cookie.match(
    "(^|;)\\s*" + cookieName + "\\s*=\\s*([^;]+)"
  );
  if (cookieValue) {
    const jwt = decodeURIComponent(cookieValue.pop());
    return jwt;
  }
  return null;
}
const username = document.getElementById("username");
socket.on("curruser", (data) => {
  console.log(data);
  username.innerText = data.name;
});

const jwt = getJWTFromCookie("jwt");
socket.emit("jwt", jwt);
// console.log(jwt);
const online = document.getElementById("online");
const search = document.getElementById("availablebox");
socket.on("usersucess", () => {
  socket.emit("findonline");
});
socket.on("AvailableUser", (data) => {
  search.innerHTML = "";
  data.forEach((element) => {
    search.innerHTML =
      search.innerHTML +
      ` <div class="frindbox" id="frindbox">
      <div class="friendrequest" id="${element._id}"></div>
      <div class="friendname">${element.name}</div>
      </div>`;
  });
  socket.emit("findonline");
});
// socket.emit("findonline");

const searchbutton = document.getElementById("searchbutton");
// console.log(searchbutton);
searchbutton.addEventListener("click", () => {
  // console.log("click");
  const searchbox = document.getElementById("search");
  const data = searchbox.value;
  // console.log(data);
  socket.emit("search", data);
  socket.emit("findonline");
});

// });
const friendbox = document.getElementById("availablebox");
// console.log(friendbox);

friendbox.addEventListener("click", (event) => {
  const data = event.target.id;
  socket.emit("Addfriend", data);
  socket.emit("findonline");
});

// socket.on("usersucess", () => {
//   socket.emit("findonline");
// });

const onlinebox = document.getElementById("onlinebox");
socket.on("onlineuser", (data) => {
  const uniqueArray = data.filter((object, index) => {
    return (
      index ===
      data.findIndex(
        (obj) => obj._id === object._id && obj.name === object.name
      )
    );
  });
  // socket.emit("findonline");
  // console.log(uniqueArray);
  onlinebox.innerHTML = "";

  uniqueArray.forEach((el) => {
    onlinebox.innerHTML =
      onlinebox.innerHTML +
      ` <div class="frindbox">
   <div class="friendname">${el.name}</div>
   <div class="friendrequest" id="${el._id}"></div>
   </div>`;
  });
});
// socket.emit("findonline");
socket.on("call", () => {
  socket.emit("findonline");
});
const onlineboxbox = document.getElementById("onlinebox");
onlineboxbox.addEventListener("click", (event) => {
  const data = event.target.id;
  // console.log(data);
  socket.emit("playrequest", data);
});
const banner = document.getElementById("banner");
socket.on("getingplayrequest", async (id, name) => {
  // console.log("got play req");
  banner.innerHTML = `      <div class="banner-content">
      <div class="req" id="req">${name} want to play with you</div>
      <div class="but" id="${id}"></div>
    </div>`;

  banner.style.display = "flex";
  eventlistern(id);
});
function eventlistern(id) {
  banner.addEventListener("click", (event) => {
    // console.log(event.target.id);
    socket.emit("playaccepted", id);
    getboard();
  });
}
socket.on("playon", () => {
  getboard();
});
function getboard() {
  window.location.href = "/board";
}
