const axios = require("axios");

let BACKEND_URL = "http://localhost:3000";
let WS_URL = "ws://localhost/3001";

describe("Authentication", () => {
  test("User is able to signup only once", async () => {
    const username = "anish" + Math.random();
    const password = "1234567";
    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    expect(response.statusCode).toBe(200);

    const updateResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    expect(updateResponse.statusCode).toBe(400);
  });

  test("Signup request fails if username is empty", async () => {
    const username = `anish-${Math.random()}`;
    const password = "1234567";

    const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      password,
    });
    expect(response.statusCode).toBe(400);
  });

  test("Signin succeeds if the username and password are correct", async () => {
    const username = `anish-${Math.random()}`;
    const password = "1234567";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  test("Signin fails if the username and password are incorrect", async () => {
    const username = `anish-${Math.random()}`;
    const password = "1234567";

    await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username: "wrongUsername",
      password,
    });
    expect(response.statusCode).toBe(403);
  });
});

describe("User update metadata endpoint", () => {
  let token = "";
  let avatarId = "";

  beforeAll(async () => {
    const username = `anish-${Math.random()}`;
    const password = "1234567";

    await axios.post(`${BACKEND_URL}/api/v1.signup`, {
      username,
      password,
      type: "admin",
    });
    const response = await axios.post(`${BACKEND_URL}/api/v1.signin`, {
      username,
      password,
    });
    token = response.data.token;

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      }
    );
    avatarId = avatarResponse.data.avatarId;
  });

  test("user can't update their metadata with wrong avatar id", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/user/metadata`,
      {
        avatarId: "12345687654",
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.statusCode).toBe(400);
  });

  test("user can update their metadata with right avatar id", async () => {
    const response = await axios.post(
      `${BACKEND_URL}/apiv1/user/metadata`,
      {
        avatarId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    expect(response.statusCode).toBe(200);
  });
  test("user can update their metadata if auth header is not present", async () => {
    const response = await axios.post(`${BACKEND_URL}/apiv1/user/metadata`, {
      avatarId,
    });

    expect(response.statusCode).toBe(403);
  });
});

describe("user avatar info", () => {
  let token = "";
  let avatarId = "";
  let userId = "";

  beforeAll(async () => {
    const username = `anish-${Math.random()}`;
    const password = "1234567";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1.signup`, {
      username,
      password,
      type: "admin",
    });

    userId = signupResponse.data.userId;

    const response = await axios.post(`${BACKEND_URL}/api/v1.signin`, {
      username,
      password,
    });
    token = response.data.token;

    const avatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      }
    );
    avatarId = avatarResponse.data.avatarId;
  });

  test("get back avatar info for a user", async () => {
    const res = await axios.get(
      `${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`
    );

    expect(res.data.avatars.length).toBe(1);
    expect(res.data.avatars[0].userId).toBe(userId);
  });

  test("get available avatars list", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/v1/avatars`);

    expect(res.data.avatars.length).not.toBe(0);
    const currentAvatar = res.data.avatars.find((x) => x.id == avatarId);
    expect(currentAvatar).toBeDefined();
  });
});

describe("space info", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminId;
  let adminToken;
  let userToken;
  let userId;

  beforeAll(async () => {
    const username = `anish-${Math.random()}`;
    const password = "1234567";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1.signup`, {
      username,
      password,
      type: "admin",
    });

    adminId = signupResponse.data.userId;

    const response = await axios.post(`${BACKEND_URL}/api/v1.signin`, {
      username,
      password,
    });
    adminToken = response.data.token;

    const userSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1.signup`,
      {
        username: username + "-user",
        password,
        type: "user",
      }
    );

    userId = userSignupResponse.data.userId;

    const userSigninResponse = await axios.post(
      `${BACKEND_URL}/api/v1.signin`,
      {
        username: username + "-user",
        password,
      }
    );
    userToken = userSigninResponse.data.token;

    const element1 = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const element2 = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    element1Id = element1.data.id;
    element2Id = element2.data.id;

    const createMap = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: {
          Authorization: `${adminToken}`,
        },
      }
    );

    mapId = createMap.data.id;
  });

  test("user is able to create a space", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(res.data.spaceId).toBeDefined();
  });
  test("user is able to create a space without mapId(empty space)", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(res.data.spaceId).toBeDefined();
  });
  test("user is not able to create a space without mapId and dimensions", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(res.statusCode).toBe(400);
  });
  test("user is not able to delete a space that doesnt exist", async () => {
    const res = await axios.delete(
      `${BACKEND_URL}/api/v1/space/reandomIdDoesntExist`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(res.statusCode).toBe(400);
  });
  test("user is able to delete a space that  exist", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const deleteRes = await axios.delete(
      `${BACKEND_URL}/api/v1/space/${res.data.spaceId}`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(res.statusCode).toBe(200);
  });
  test("user should not be able to delete a space created by another user", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const deleteRes = await axios.delete(
      `${BACKEND_URL}/api/v1/space/${res.data.spaceId}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    expect(deleteRes.statusCode).toBe(400);
  });
  test("admin has no space initally", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/v1/space/all`);

    expect(res.data.spaces.length).toBe(0);
  });
  test("user is able to get existing space", async () => {
    const spaceCreateResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const res = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const filteredSpace = res.data.spaces.find(
      (x) => x.id == spaceCreateResponse.data.spaceId
    );
    expect(res.data.spaces.length).toBe(1);
    expect(filteredSpace).toBeDefined();
  });
});

describe("arena endpints", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminId;
  let adminToken;
  let userToken;
  let userId;
  let spaceId;

  beforeAll(async () => {
    const username = `anish-${Math.random()}`;
    const password = "1234567";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1.signup`, {
      username,
      password,
      type: "admin",
    });

    adminId = signupResponse.data.userId;

    const response = await axios.post(`${BACKEND_URL}/api/v1.signin`, {
      username,
      password,
    });
    adminToken = response.data.token;

    const userSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1.signup`,
      {
        username: username + "-user",
        password,
        type: "user",
      }
    );

    userId = userSignupResponse.data.userId;

    const userSigninResponse = await axios.post(
      `${BACKEND_URL}/api/v1.signin`,
      {
        username: username + "-user",
        password,
      }
    );
    userToken = userSigninResponse.data.token;

    const element1 = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const element2 = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    element1Id = element1.data.id;
    element2Id = element2.data.id;

    const createMap = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: {
          Authorization: `${adminToken}`,
        },
      }
    );

    mapId = createMap.data.id;
    const createSpace = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: `${mapId}`,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    spaceId = createSpace.data.spaceId;
  });

  test("user can get a space", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    expect(res.data.dimensions).toBe("100x200");
    expect(res.data.elements.length).toBe(4);
  });

  test("user cannot get incorrect space id", async () => {
    const res = await axios.get(
      `${BACKEND_URL}/api/v1/space/randomWrongSpaceId`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(res.statusCode).toBe(400);
  });

  test("delete an element", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const deleteRes = await axios.delete(
      `${BACKEND_URL}/api/v1/space/element`,
      {
        spaceId: spaceId,
        elementId: res.data.elements[0].id,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const newResponse = await axios.get(
      `${BACKEND_URL}/api/v1/space/${spaceId}`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(newResponse.data.elements.length).toBe(3);
  });

  test("add an element fails if it is outside arena dimension", async () => {
    const addElementResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space/element`,
      {
        elementId: element1Id,
        spaceId: spaceId,
        x: 500000,
        y: 200000,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(addElementResponse.statusCode).toBe(400);
  });
  test("add an element in arena", async () => {
    const addElementResponse = await axios.post(
      `${BACKEND_URL}/api/v1/space/element`,
      {
        elementId: element1Id,
        spaceId: spaceId,
        x: 50,
        y: 20,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const newResponse = await axios.get(
      `${BACKEND_URL}/api/v1/space/${spaceId}`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(newResponse.data.elements.length).toBe(4);
  });
});

describe("Admin endpoints", () => {
  let adminId;
  let adminToken;
  let userToken;
  let userId;
  let elementId;

  beforeAll(async () => {
    const username = `anish-${Math.random()}`;
    const password = "1234567";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1.signup`, {
      username,
      password,
      type: "admin",
    });

    adminId = signupResponse.data.userId;

    const response = await axios.post(`${BACKEND_URL}/api/v1.signin`, {
      username,
      password,
    });
    adminToken = response.data.token;

    const userSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1.signup`,
      {
        username: username + "-user",
        password,
        type: "user",
      }
    );

    userId = userSignupResponse.data.userId;

    const userSigninResponse = await axios.post(
      `${BACKEND_URL}/api/v1.signin`,
      {
        username: username + "-user",
        password,
      }
    );
    userToken = userSigninResponse.data.token;
  });

  test("user is not able to hit admin endpoint", async () => {
    const element = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    elementId = element.data.id;

    const createMap = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [],
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const createAvatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const updateElementResponse = await axios.put(
      `${BACKEND_URL}/api/v1/admin/avatar/${elementId}`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    expect(element.statusCode).toBe(403);
    expect(createMap.statusCode).toBe(403);
    expect(createAvatarResponse.statusCode).toBe(403);
    expect(updateElementResponse.statusCode).toBe(403);
  });
  test("user is able to hit admin endpoint", async () => {
    const element = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    elementId = element.data.id;

    const createMap = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: elementId,
            x: 20,
            y: 20,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const createAvatarResponse = await axios.post(
      `${BACKEND_URL}/api/v1/admin/avatar`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    const updateElementResponse = await axios.put(
      `${BACKEND_URL}/api/v1/admin/avatar/${elementId}`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(element.statusCode).toBe(200);
    expect(createMap.statusCode).toBe(200);
    expect(createAvatarResponse.statusCode).toBe(200);
    expect(updateElementResponse.statusCode).toBe(200);
  });
});

describe("WebSockets tests", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminId;
  let adminToken;
  let userId;
  let userToken;
  let spaceId;
  let ws1;
  let ws2;
  let ws1Messeages = [];
  let ws2Messeages = [];
  let userX;
  let userY;
  let adminX;
  let adminY;

  function waitForAndPopLatestMessage(messageArray) {
    return new Promise((r) => {
      if (messageArray.length > 0) {
        resolve(messageArray.shift());
      } else {
        let interval = setInterval(() => {
          if (messageArray.length > 0) {
            resolve(messageArray.shift());
            clearInterval(interval);
          }
        }, 100);
      }
    });
  }

  async function setupHTTP() {
    const username = `anish-${Math.random()}`;
    const password = "1234567";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    const signinResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
      username,
      password,
    });

    adminId = signupResponse.data.userId;
    adminToken = signinResponse.data.token;

    const userSignupResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signup`,
      {
        username: username + "user",
        password,
        type: "user",
      }
    );
    const userSigninResponse = await axios.post(
      `${BACKEND_URL}/api/v1/signin`,
      {
        username: username + "user",
        password,
      }
    );

    userId = userSignupResponse.data.userId;
    userToken = userSigninResponse.data.token;

    const createElement1 = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    const createElement2 = await axios.post(
      `${BACKEND_URL}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    element1Id = createElement1.data.id;
    element2Id = createElement2.data.id;

    const createMap = await axios.post(
      `${BACKEND_URL}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    mapId = createMap.data.id;

    const createSpace = await axios.post(
      `${BACKEND_URL}/api/v1/space`,
      {
        name: "Test",
        dimensions: "100x200",
        mapId: `${mapId}`,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    spaceId = createSpace.data.spaceId;
  }

  async function setupWs() {
    ws1 = new WebSocket(WS_URL);

    await new Promise((r) => {
      ws1.onopen = r;
    });

    ws1.onmessage = (event) => {
      ws1Messeages.push(JSON.parse(event.data));
    };

    ws2 = new WebSocket(WS_URL);

    await new Promise((r) => {
      ws2.onopen = r;
    });

    ws2.onmessage = (event) => {
      ws2Messeages.push(JSON.parse(event.data));
    };
  }

  beforeAll(() => {
    setupHTTP();
    setupWs();
  });

  test("Get back ack for joining the space", async () => {
    ws1.send(
      JSON.stringify({
        type: "join",
        payload: {
          spaceId: spaceId,
          token: adminToken,
        },
      })
    );
    let message1 = await waitForAndPopLatestMessage(ws1Messeages);

    ws2.send(
      JSON.stringify({
        type: "join",
        payload: {
          spaceId: spaceId,
          token: userToken,
        },
      })
    );

    let message2 = await waitForAndPopLatestMessage(ws2Messeages);
    let message3 = await waitForAndPopLatestMessage(ws1Messeages);

    expect(message1.type).toBe("space-joined");
    expect(message2.type).toBe("space-joined");

    expect(message1.payload.users.length).toBe(0);
    expect(message2.payload.users.length).toBe(1);
    expect(message3.type).toBe("user-join");
    expect(message3.payload.x).toBe(message2.payload.spawn.x);
    expect(message3.payload.y).toBe(message2.payload.spawn.y);
    expect(message3.payload.userId).toBe(userId);

    adminX = message1.payload.spawn.x;
    adminY = message1.payload.spawn.y;

    userX = message1.payload.spawn.x;
    userY = message1.payload.spawn.y;
  });

  test("User should not be able to move two blocks at the same time", async () => {
    ws1.send(
      JSON.stringify({
        type: "movement",
        payload: {
          x: adminX + 2,
          y: adminY,
        },
      })
    );
    const message = await waitForAndPopLatestMessage(ws1Messeages);
    expect(message.type).toBe("movement-rejected");
    expect(message.payload.x).toBe(adminX);
    expect(message.payload.y).toBe(adminY);
  });
  test("User should not be able to move across the boundary of wall", async () => {
    ws1.send(
      JSON.stringify({
        type: "movement",
        payload: {
          x: 100000,
          y: 100000,
        },
      })
    );
    const message = await waitForAndPopLatestMessage(ws1Messeages);
    expect(message.type).toBe("movement-rejected");
    expect(message.payload.x).toBe(adminX);
    expect(message.payload.y).toBe(adminY);
  });

  test("Correct movement should be broadcast to the other sockets in the room", async () => {
    ws1.send(
      JSON.stringify({
        type: "movement",
        payload: {
          x: adminX + 1,
          y: adminY,
          userId: adminId,
        },
      })
    );
    const message = await waitForAndPopLatestMessage(ws2Messeages);
    expect(message.type).toBe("movement");
    expect(message.payload.x).toBe(adminX + 1);
    expect(message.payload.y).toBe(adminY);
  });
  test("If a user leave, the other user receives a leave event", async () => {
    ws1.close();
    const message = await waitForAndPopLatestMessage(ws1Messeages);
    expect(message.type).toBe("user-left");
    expect(message.payload.userId).toBe(adminId);
  });
});
