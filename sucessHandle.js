const headers = require("./headers");

function sucessHandle(res, message) {
  res.writeHead(200, headers);
  res.write(
    JSON.stringify({
      status: "sucess",
      message: message,
    })
  );
  res.end();
}
module.exports = sucessHandle;
