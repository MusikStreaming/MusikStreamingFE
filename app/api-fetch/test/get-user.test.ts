import axios from 'axios';
import fetchUserById from '@/app/api-fetch/user-by-id';
import { AuthResponse } from '@/app/model/schemas/auth-response';
import z from 'zod';

const AlternativeAuthResponse = z.object({
    data: AuthResponse
});

test('fetch user by id', async () => {
    const user = await fetchUserById("2f95bcf2-581c-4775-966f-dd44257782a4");
    const parsedUser1 = AlternativeAuthResponse.parse(user);
    console.log(parsedUser1);
    expect(parsedUser1).toBeDefined();
    const parsedUser2 = AuthResponse.parse(parsedUser1);
    console.log(parsedUser2);
    expect(parsedUser2).toBeDefined();
});
