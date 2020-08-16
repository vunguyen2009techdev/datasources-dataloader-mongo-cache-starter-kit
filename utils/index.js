function isEmpty(obj) {
  for(var key in obj) {
      if(obj.hasOwnProperty(key))
          return false;
  }
  return true;
}

export const removeEmpty = obj => {
  Object.entries(obj).forEach(([key, value]) => {
    if (!value) {
      delete obj[key];
    }
  });

  if (isEmpty(obj)) {
    return null;
  }
  return obj;
};