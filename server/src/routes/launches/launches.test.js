const request = require("supertest");
const app = require("../../app");

const {mongoConnect, mongoDisconnect} = require("../../services/mongo")




describe('Launches API', () => {

  beforeAll(async () => {
    await mongoConnect()
  })

  afterAll(async () => {
    await mongoDisconnect()
  })

  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect(200)
        .expect("Content-Type", /json/);
    });
  });
  
  describe("Test POST /launches", () => {
    test("It should respond with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send({
          mission: "USS Enterprise",
          rocket: "NCC 1701-D",
          target: "Kepler-452 b",
          launchDate: "June 5, 2025",
        })
        .expect(201)
        .expect("Content-Type", /json/);
    });
  
    test("It should catch missing required properties", () => {});
    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send({
          mission: "USS Enterprise",
          rocket: "NCC 1701-D",
          target: "Kepler-452 b",
          launchDate: "chibaby",
        })
        .expect(400)
        .expect("Content-Type", /json/);
        
      expect(response.body).toStrictEqual({
        error: "invalid launch date!!",
      });
    });
  });
  
})

