const bcrypt = require("bcryptjs");

class UserService {
  constructor(client) {
    this.User = client.db().collection("users");
  }

  async create(payload) {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
    };
    const result = await this.User.insertOne(user);
    return { ...user, _id: result.insertedId, password: undefined };
  }

  async findByEmail(email) {
    return await this.User.findOne({ email });
  }
}

module.exports = UserService;
