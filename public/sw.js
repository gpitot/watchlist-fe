console.log("hello world");

// Listen for push messages and show a notification.
self.addEventListener("push", (e) => {
  console.log("NOTIFCATION RECEIVED", e);
  const data = e.data.json();
  // See https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
  self.registration.showNotification(data.title, data);
});
