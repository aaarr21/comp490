
const User = require('./User');
const db = require('.db'); //need to implement db connection

class UserRepository{
//find a user by email
	async findByEmail(email) {
		return await db.findOne({	email }); //need to implement
	}

	//save new user
	async save(user){
		return await db.insertOne({
			id: user.id,
			email:user.email,
			password:user.password,
			name: user.name,
			role: user.role,
			createdAt: user.createdAt
		});
	}
}

module.exports = UserRepository;
