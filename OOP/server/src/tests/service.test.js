const UserService = require('../services/UserService.js');
const UserRepository = require('../repository/UserRepository.js');
const bcrypt = require('bcrypt');
const sinon = require('sinon');

describe('UserService Unit Tests', () => {
    let userService;
    let mockUserRepository;

    beforeEach(() => {
        mockUserRepository = sinon.createStubInstance(UserRepository);
        userService = new UserService(mockUserRepository);
    });

    // Test for registering a new user
    test('should register a new user', async () => {
        const email = 'test@example.com';
        const password = 'password';
        const name = 'Test User';
        const role = 'user';

        // Mock repository behavior
        mockUserRepository.findByEmail.resolves(null); // No user found
        mockUserRepository.save.resolves({
            id: '123',
            email,
            name,
            role,
            password: await bcrypt.hash(password, 10),
            createdAt: new Date(),
        });

        const result = await userService.registerUser(email, password, name, role);

        expect(mockUserRepository.findByEmail.calledOnceWith(email)).toBeTruthy();
        expect(result.email).toEqual(email);
    });
});