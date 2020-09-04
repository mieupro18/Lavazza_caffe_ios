// eslint-disable-next-line no-undef
export default getTimeoutSignal = (async) timeout => {
  // eslint-disable-next-line no-undef
  const controller = new AbortController();
  setTimeout(() => {
    controller.abort();
  }, timeout);
  return controller;
};
