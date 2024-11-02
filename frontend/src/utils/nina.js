const userName = "user";

export async function testConnection({ host, password }) {
  try {
    const resp = await ninaGet({ host, password }, "/api/v1/camera");
    if (resp.Type === "CameraStatus") {
      return {
        success: true,
        error: null
      };
    }
    return {
      success: false,
      error: "Invalid response from NINA server"
    };
  } catch (error) {
    return {
      success: false,
      error: error.message === "Failed to fetch" 
        ? "Failed to connect to the NINA server, is it running?"
        : error.message || "Could not connect to NINA server"
    };
  }
}

export function ninaGet({ host, password }, path) {
  const encodedCredentials = btoa(`${userName}:${password}`);
  return fetch(host + path, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${encodedCredentials}`,
    },
  }).then((resp) => resp.json());
}

export function ninaPost({ host, password }, path, body) {
  const encodedCredentials = btoa(`${userName}:${password}`);
  return fetch(host + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${encodedCredentials}`,
    },
    body: JSON.stringify(body),
  }).then((resp) => resp.json());
}

export function ninaPatch({ host, password }, path, body) {
  const encodedCredentials = btoa(`${userName}:${password}`);
  return fetch(host + path, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${encodedCredentials}`,
    },
    body: JSON.stringify(body),
  }).then((resp) => resp.json());
}

export function listen({ host, password }, onStatus, onEvent) {
  const serverHost = new URL(host).host;
  const isSecure = host.startsWith("https");
  const proto = isSecure ? "wss" : "ws";
  const uri = `${proto}://${serverHost}/events/v1`;
  const socket = new WebSocket(uri);

  socket.addEventListener("open", (event) => {
    onStatus(true);
    socket.send(JSON.stringify({ ApiKey: password }));
  });

  socket.addEventListener("message", (event) => {
    onEvent(JSON.parse(event.data));
  });

  socket.addEventListener("close", (event) => {
    onStatus(false);
  });
}
