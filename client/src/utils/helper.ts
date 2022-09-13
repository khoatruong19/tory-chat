export const formatError = (error: { field: string; message: string }) => {
  return { [error.field]: error.message };
};

export const formatFullname = (firstName: string, lastName: string) => {
  return firstName + ' ' + lastName;
};

export const isValidHttpUrl = (value: string) => {
  let url;
  try {
    url = new URL(value);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
};
