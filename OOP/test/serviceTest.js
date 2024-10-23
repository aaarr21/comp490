import UserService from '../services/UserService';
import UserRepository from '../repositories/UserRepository';
import bcrypt from 'bcrypt';
import sinon from 'sinon';

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
        expect(result.password).toBeUndefined(); // Ensure password is excluded from the response
    });

    // Test for user login
    test('should log in an existing user', async () => {
        const email = 'test@example.com';
        const password = 'password';

        // Mock repository and bcrypt behavior
        const hashedPassword = await bcrypt.hash(password, 10);
        mockUserRepository.findByEmail.resolves({
            id: '123',
            email,
            password: hashedPassword, // Hashed password in the DB
            name: 'Test User',
            role: 'user',
            createdAt: new Date(),
        });
        sinon.stub(bcrypt, 'compare').resolves(true); // Mock password comparison

        const result = await userService.loginUser(email, password);

        expect(mockUserRepository.findByEmail.calledOnceWith(email)).toBeTruthy();
        expect(result).toHaveProperty('token'); // Ensure a token is returned
        bcrypt.compare.restore(); // Restore the bcrypt compare method after the test
    });

    // Test for handling invalid login
    test('should throw error if password is invalid', async () => {
        const email = 'test@example.com';
        const password = 'wrongPassword';

        const hashedPassword = await bcrypt.hash('password', 10);
        mockUserRepository.findByEmail.resolves({
            id: '123',
            email,
            password: hashedPassword,
            name: 'Test User',
            role: 'user',
            createdAt: new Date(),
        });
        sinon.stub(bcrypt, 'compare').resolves(false); // Mock failed password comparison

        await expect(userService.loginUser(email, password)).rejects.toThrow('Invalid password');
        bcrypt.compare.restore();
    });
});
