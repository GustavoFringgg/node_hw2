const headers = require("./headers");

function error_route(res) {
  res.writeHead(400, headers);
  res.write(
    JSON.stringify({
      status: "false",
      message: "無此路由，或ID輸入錯誤",
    })
  );
  res.end();
}

const handleError = (res, err) => {
  res.writeHead(400, headers);
  let message = "";
  if (err) {
    message = err.message;
  } else {
    message = "欄位未填寫正確或無此 id";
  }
  res.write(
    JSON.stringify({
      status: "false",
      message,
    })
  );
  res.end();
};
module.exports = handleError;
module.exports = { error_route, handleError };
