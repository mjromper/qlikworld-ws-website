var updatedSessions;
var updatedDetails;

// create the editor
const container = document.getElementById("sessions");
const container2 = document.getElementById("details");
var options = {
  mode: "code",
  //modes: ['code', 'form', 'tree'],
  name: "Sessions",
  onChange: function () {
    console.log("sessions", editor.get());
    document.getElementById("savesessions").style.display = "inline";
  },
};
const editor = new JSONEditor(container, options);
var options2 = {
  mode: "code",
  //modes: ['code', 'form', 'tree'],
  name: "Details",
  onChange: function () {
    console.log("details", editor2.get());
    document.getElementById("savedetails").style.display = "inline";
  },
};
const editor2 = new JSONEditor(container2, options2);

fetch("/api/sessions")
  .then((response) => response.json())
  .then((data) => {
    editor.set(data.sessions);
    editor2.set(data.details);
  });

function save(file) {
  var o;
  if (file === "sessions") {
    o = { sessions: editor.get() };
  }

  if (file === "details") {
    o = { details: editor2.get() };
  }

  fetch("/api/sessions", {
    method: "POST", // or 'PUT'
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(o),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);

      document.getElementById("save" + file).style.display = "none";
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
