const axios = require("axios");

let BACKEND_URL = "http://localhost:3000/";

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

describe('user avatar info',()=>{
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

        userId = signupResponse.data.userId

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

      test('get back avatar info for a user',async ()=>{
        const res = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`)

        expect(res.data.avatars.length).toBe(1)
        expect(res.data.avatars[0].userId).toBe(userId)

      })

      test("get available avatars list",async ()=>{
        const res = await axios.get(`${BACKEND_URL}/api/v1/avatars`)

        expect(res.data.avatars.length).not.toBe(0)
        const currentAvatar = res.data.avatars.find(x =>x.id == avatarId)
        expect(currentAvatar).toBeDefined()
      })
})

describe("space info",()=>{
    let mapId
    let element1Id
    let element2Id
    let adminId
    let adminToken
    let userToken
    let userId

    beforeAll(async ()=>{
        const username = `anish-${Math.random()}`;
        const password = "1234567";
    
        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1.signup`, {
          username,
          password,
          type: "admin",
        });

        adminId = signupResponse.data.userId

        const response = await axios.post(`${BACKEND_URL}/api/v1.signin`, {
          username,
          password,
        });
        adminToken = response.data.token;

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1.signup`, {
          username,
          password,
          type: "admin",
        });

        userId = userSignupResponse.data.userId

        const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1.signin`, {
          username,
          password,
        });
        userToken = userSigninResponse.data.token;

        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
          "static": true 
        },{
            headers:{
                "Authorization":`Bearer ${adminToken}`
            }
        })

        const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
          "static": true 
        },{
            headers:{
                "Authorization":`Bearer ${adminToken}`
            }
        })

        element1Id = element1.data.id
        element2Id = element2.data.id

        const createMap = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                  elementId:  element1Id,
                    x: 18,
                    y: 20
                }, {
                  elementId: element2Id,
                    x: 19,
                    y: 20
                }, {
                  elementId: element2Id,
                    x: 19,
                    y: 20
                }
            ]
        },{
            headers:{
                "Authorization":`${adminToken}`
            }
        })

        mapId = createMap.data.id
    })

    test('user is able to create a space',async()=>{

       const res = await axios.post(`${BACKEND_URL}/api/v1/space`,{
        "name": "Test",
        "dimensions": "100x200",
        "mapId": mapId
       },{
        headers:{
            "Authorization":`Bearer ${userToken}`
        }
       })

       expect(res.data.spaceId).toBeDefined()
    })
    test('user is able to create a space without mapId(empty space)',async()=>{

       const res = await axios.post(`${BACKEND_URL}/api/v1/space`,{
        "name": "Test",
        "dimensions": "100x200",
       },{
        headers:{
            "Authorization":`Bearer ${userToken}`
        }
       })

       expect(res.data.spaceId).toBeDefined()
    })
    test('user is not able to create a space without mapId and dimensions',async()=>{

       const res = await axios.post(`${BACKEND_URL}/api/v1/space`,{
        "name": "Test",
       },{
        headers:{
            "Authorization":`Bearer ${userToken}`
        }
       })

       expect(res.statusCode).toBe(400)
    })
    test('user is not able to delete a space that doesnt exist',async()=>{

       const res = await axios.delete(`${BACKEND_URL}/api/v1/space/reandomIdDoesntExist`,{
        headers:{
            "Authorization":`Bearer ${userToken}`
        }
       })

       expect(res.statusCode).toBe(400)
    })
    test('user is able to delete a space that  exist',async()=>{
        const res = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            "name": "Test",
            "dimensions": "100x200",
            "mapId": mapId
           },{
            headers:{
                "Authorization":`Bearer ${userToken}`
            }
           })

        const deleteRes = await axios.delete(`${BACKEND_URL}/api/v1/space/${res.data.spaceId}`,{
        headers:{
            "Authorization":`Bearer ${userToken}`
        }
       })

       expect(res.statusCode).toBe(200)
    })
    test('user should not be able to delete a space created by another user',async ()=>{
        const res = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            "name": "Test",
            "dimensions": "100x200",
            "mapId": mapId
           },{
            headers:{
                "Authorization":`Bearer ${userToken}`
            }
           })

        const deleteRes = await axios.delete(`${BACKEND_URL}/api/v1/space/${res.data.spaceId}`,{
        headers:{
            "Authorization":`Bearer ${adminToken}`
        }
       })
       expect(deleteRes.statusCode).toBe(400)
    })
    test('admin has no space initally',async()=>{
        const res = await axios.get(`${BACKEND_URL}/api/v1/space/all`)

        expect(res.data.spaces.length).toBe(0)
    })
    test('user is able to get existing space',async ()=>{
        const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            "name": "Test",
            "dimensions": "100x200",
           },{
            headers:{
                "Authorization":`Bearer ${userToken}`
            }
           })
        const res = await axios.get(`${BACKEND_URL}/api/v1/space/all`)

        const filteredSpace = res.data.spaces.find(x =>x.id == spaceCreateResponse.data.spaceId)
        expect(res.data.spaces.length).toBe(1)
        expect(filteredSpace).toBeDefined()

    })
})

