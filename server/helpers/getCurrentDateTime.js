const getCurrentDateTime = (type) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const formattedDate = `${year}-${month < 10 ? "0" : ""}${month}-${day < 10 ? "0" : ""}${day}`;

  return type === "formatted" ? formattedDate : date;
};

module.exports = getCurrentDateTime;
