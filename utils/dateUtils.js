export const formatDate = (date) => {
  return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
};

export const getYesterdayDate = () => {
  return new Date(Date.now() - 86400000); // 86400000 ms = 1 day
};
