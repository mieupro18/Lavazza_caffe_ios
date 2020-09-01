// eslint-disable-next-line no-undef
export default getTimeoutSignal = (async) => {
  // eslint-disable-next-line no-undef
  const controller = new AbortController();
  setTimeout(() => {
    controller.abort();
  }, 30000);
  return controller;
};
